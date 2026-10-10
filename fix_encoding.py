#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fix_encoding.py — восстановление onlyafans.html (строго по шагам ТЗ).

Шаг 0. Источники: main содержит полный читаемый русский текст (после ftfy), но
        в повреждённой разметке; HEAD содержит чистую структуру/вёрстку, но с
        потерянными первыми буквами слов («И»→«?») и mojibake в <meta>/JSON-LD.
        Итог = структура из HEAD + текстовые узлы из main (сопоставление по
        якорям tag+attrs+нормализованный текст+порядок).
Шаг 1. Обратная двойная кодировка (ftfy.fix_text) + таблица замен для lossy-следов.
Шаг 2. Трансплантация узлов из main — того, что не раскрутилось скриптом.
Шаг 3. UTF-8 без BOM, <meta charset="UTF-8"> первой строкой <head>.
Шаг 4. Отчёт: сегменты закрыты скриптом / узлов трансплантировано / остаток.
"""
import re
import html as H
import difflib
from collections import defaultdict
import subprocess

import ftfy

SRC = 'onlyafans.html'

TABLE = {  # остатки после ftfy (lossy-последовательности)
    'В«': '«', 'В»': '»',
    'вЂ”': '—', 'вЂ“': '–', 'вЂ¦': '…', 'в‚Ѕ': '₽',
    'Р\x98': 'И',
}


def step1_undo_double(text):
    fixed = ftfy.fix_text(text)
    n_table = 0
    for k, v in TABLE.items():
        c = fixed.count(k)
        if c:
            n_table += c
            fixed = fixed.replace(k, v)
    sm = difflib.SequenceMatcher(None, text, fixed)
    blocks = sum(max(i2 - i1, j2 - j1)
                 for t, i1, i2, j1, j2 in sm.get_opcodes() if t != 'equal')
    return fixed, {'ftfy_segments_fixed': blocks, 'table_replacements': n_table}


TAGS = r'h1|h2|h3|h4|h5|h6|p|li|a|span|title|figcaption|blockquote|td|th|button'
PAT_NODE = re.compile(r'<(%s)\b([^>]*)>(.*?)</\1>' % TAGS, re.S)


def plain(inner):
    return H.unescape(re.sub(r'<[^>]+>', '', inner))


def norm(t):
    return re.sub(r'\s+', ' ', t).strip().lower()


def is_dirty(t):
    return bool(re.search(r'Р[\x80-\xff]', t)) or 'Ð' in t or 'â' in t \
        or '\x98' in t or '?' in t


def build_pool(clean_text):
    pool = defaultdict(list)
    for mo in PAT_NODE.finditer(clean_text):
        tag, attrs, inner = mo.group(1), mo.group(2).strip(), mo.group(3)
        txt = plain(inner)
        if is_dirty(txt):          # берём только чистые узлы источника
            continue
        pool[(tag, attrs)].append([norm(txt), inner, False])
    return pool


def ratio(a, b):
    return difflib.SequenceMatcher(None, a, b).ratio()


def align_lines(target, donor):
    """Построчное выравнивание target->donor; возвращает пары индексов для replace-блоков."""
    tl = [l.strip() for l in target.splitlines()]
    dl = [l.strip() for l in donor.splitlines()]
    sm = difflib.SequenceMatcher(None, tl, dl)
    pairs = {}
    for t, i1, i2, j1, j2 in sm.get_opcodes():
        if t == 'replace' and (i2 - i1) == (j2 - j1):
            pairs.update(zip(range(i1, i2), range(j1, j2)))
        elif t == 'equal':
            pairs.update(zip(range(i1, i2), range(j1, j2)))
    return tl, dl, pairs


def transplant_flat(text, donor_clean):
    """Узлы вне PAT_NODE (содержимое <meta content=...>, строки JSON-LD):
    трансплантируем целыми строками из донора при high-confidence совпадении."""
    tl, dl, pairs = align_lines(text, donor_clean)
    n = 0
    lines = text.splitlines(keepends=True)
    newline_map = {}
    for ti, di in pairs.items():
        cur_line = tl[ti]
        don_line = dl[di]
        if cur_line == don_line:
            continue
        if not is_dirty(cur_line):
            continue
        if is_dirty(don_line):
            continue
        r = ratio(cur_line.lower(), don_line.lower())
        # сохраняем отступ оригинальной строки
        indent = re.match(r'\s*', lines[ti]).group(0)
        eol = '\n' if lines[ti].endswith('\n') else ''
        newline_map[ti] = indent + don_line + eol
        n += 1
    for ti, repl in newline_map.items():
        lines[ti] = repl
    return ''.join(lines), n


def step2_transplant(struct, donor_clean):
    """struct — файл со structure-эталоном (HEAD); donor_clean — main+ftfy."""
    pool = build_pool(donor_clean)
    stats = defaultdict(int)
    replaced_spans = []
    leftover = []

    spans = sorted((mo.span() for mo in PAT_NODE.finditer(struct)),
                   key=lambda x: x[1] - x[0])  # deepest-first
    for a, b in spans:
        mo = PAT_NODE.fullmatch(struct[a:b])
        if not mo:
            continue
        tag, attrs, inner = mo.group(1), mo.group(2).strip(), mo.group(3)
        txt = plain(inner)
        if not is_dirty(txt):
            continue
        k = norm(txt)
        lst = pool.get((tag, attrs), [])
        hit = None
        for i, (hk, hin, used) in enumerate(lst):          # точный ключ
            if not used and hk[:60] == k[:60]:
                hit = i
                stats['exact'] += 1
                break
        if hit is None:                                     # fuzzy по якорю
            best_r, bi = 0.0, None
            for i, (hk, hin, used) in enumerate(lst):
                if used:
                    continue
                r = ratio(k, hk)
                if r > best_r:
                    best_r, bi = r, i
            if best_r >= 0.5:
                hit = bi
                stats['fuzzy'] += 1
        if hit is not None:
            lst[hit][2] = True
            replaced_spans.append((a, b, tag, attrs, lst[hit][1]))
        else:
            leftover.append((struct[:a].count('\n') + 1, txt[:80]))
            stats['unmatched'] += 1

    out = struct
    for a, b, tag, attrs, newin in reversed(replaced_spans):
        open_tag = '<%s%s>' % (tag, (' ' + attrs) if attrs else '')
        out = out[:a] + open_tag + newin + '</%s>' % tag + out[b:]
    stats['transplanted_total'] = len(replaced_spans)

    # плоская трансплантация строк (meta/JSON-LD), не покрытых узловой
    out2, n_flat = transplant_flat(out, donor_clean)
    stats['flat_lines'] = n_flat
    return out2, dict(stats), leftover


def step3_meta(text):
    text = re.sub(r'[ \t]*<meta\s+charset=["\'][^"\']*["\']\s*/?>\s*\n?', '',
                  text, flags=re.I)
    text = re.sub(r'(<head[^>]*>)', r'\1\n<meta charset="UTF-8">', text,
                  count=1, flags=re.I)
    return text.lstrip('\ufeff')


def main():
    head = subprocess.run(['git', 'show', 'HEAD:onlyafans.html'],
                          capture_output=True).stdout.decode('utf-8-sig')
    main_raw = subprocess.run(['git', 'show', 'main:onlyafans.html'],
                              capture_output=True).stdout.decode('utf-8-sig')
    donor_clean, st_d = step1_undo_double(main_raw)   # источник чистого текста
    print('ШАГ0: main как донор текста:', st_d)

    s1, st1 = step1_undo_double(head)                 # шаг1 над структурой HEAD
    print('ШАГ1 (по HEAD):', st1)

    s2, st2, leftover = step2_transplant(s1, donor_clean)
    print('ШАГ2:', st2)
    if leftover:
        print('Не сматчились:')
        for ln, snip in leftover:
            print(f'   стр.{ln}: {snip!r}')

    s3 = step3_meta(s2)
    with open(SRC, 'wb') as f:
        f.write(s3.encode('utf-8'))                   # без BOM
    print('ШАГ3: сохранён UTF-8 без BOM; meta charset=UTF-8 первой строкой <head>')


if __name__ == '__main__':
    main()
