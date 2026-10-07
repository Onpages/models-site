"use strict";
var $ = function (s, c) { return (c || document).querySelector(s); };
var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

(function () {
  // Тело: отступ под сторис-док
  document.body.classList.toggle('has-dock', !!$('.stories'));

  // ===== ФУТЕР: автоподстановка текущего года =====
  var fy = $('#foot-year');
  if (fy) fy.textContent = String(new Date().getFullYear());

  // ===== ВЕРХНЕЕ МЕНЮ: логотип — скролл в начало страницы =====
  var logo = $('#logo');
  if (logo) {
    logo.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== БЕГУЩАЯ СТРОКА: дублирование для бесшовности =====
  $$('.marquee span').forEach(function (sp) { sp.innerHTML += sp.innerHTML; });

  // ===== МЕНЮ СТОРИС: активная модель + тап → скролл к карточке =====
 var MODEL_IDS = ['topmodel-1', 'topmodel-2', 'topmodel-3', 'topmodel-4', 'mediamodel', 'topmodel-5', 'topmodel-6', 'topmodel-7'];
  function setActiveStory(id) {
    $$('.story[data-model]').forEach(function (a) {
      a.classList.toggle('on', a.getAttribute('data-model') === id);
    });
  }
  $$('.story[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setTimeout(function () {
        target.classList.remove('arrive');
        void target.offsetWidth;
        target.classList.add('arrive');
      }, 500);
      setActiveStory(a.getAttribute('data-model') || '');
      history.replaceState(null, '', '#' + id);
    });
  });
  // Подсветка активной модели при скролле к её карточке (заработает после вставки карточек)
  if ('IntersectionObserver' in window) {
    var cardIo = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) setActiveStory(en.target.id);
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    MODEL_IDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) cardIo.observe(el);
    });
  }

  // ===== ШАПКА: слайдер моделей (авто 6 сек, свайп, стрелки, синхрон имён) =====
  var NAMES = ['Катя', 'Оля', 'Лизз', 'Алина', 'Кристина', 'Лена', 'Таня', 'Настя'];
  var TOTAL = NAMES.length;
  var cur = 0;
  var mTrack = $('#ph-track');
  var dTrack = $('#ph-track-d');
  var mLink = $('#ph-link');
  var dLink = $('#ph-link-d');
  var autoTimer = null;
  function phRender() {
    var shift = cur * 100 / TOTAL;
    if (mTrack) mTrack.style.transform = 'translateX(-' + shift + '%)';
    if (dTrack) dTrack.style.transform = 'translateX(-' + shift + '%)';
    if (mLink) { mLink.textContent = NAMES[cur]; mLink.setAttribute('href', '#' + MODEL_IDS[cur]); }
    if (dLink) { dLink.textContent = NAMES[cur]; dLink.setAttribute('href', '#' + MODEL_IDS[cur]); }
    setActiveStory(MODEL_IDS[cur]);
  }
  function phGo(i) { cur = ((i % TOTAL) + TOTAL) % TOTAL; phRender(); }
  function phNext() { phGo(cur + 1); }
  function phPrev() { phGo(cur - 1); }
  function phStart() { if (!autoTimer) autoTimer = setInterval(phNext, 6000); }
  function phStop() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
  if (mTrack || dTrack) {
    phRender();
    phStart();
    var hero = $('.pagehero');
    if (hero) {
      hero.addEventListener('mouseenter', phStop);
      hero.addEventListener('mouseleave', phStart);
      hero.addEventListener('touchstart', phStop, { passive: true });
      hero.addEventListener('touchend', phStart);
    }
    if (mTrack) {
      var tx = 0;
      mTrack.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; phStop(); }, { passive: true });
      mTrack.addEventListener('touchend', function (e) {
        var dx = tx - e.changedTouches[0].clientX;
        if (Math.abs(dx) > 50) { if (dx > 0) phNext(); else phPrev(); }
        phStart();
      }, { passive: true });
    }
    var pv = $('#ph-prev'), nx = $('#ph-next');
    if (pv) pv.addEventListener('click', function () { phPrev(); phStart(); });
    if (nx) nx.addEventListener('click', function () { phNext(); phStart(); });
  }

  // ===== ШАПКА: кнопка языка (меню поверх, заглушки, смена логотипа) =====
  var logoMain = $('#logo-main');
  var logoSub = $('#logo-sub');
function applyLang(lang, full, short) {
if (lang === 'ru') {
if (logoMain) logoMain.textContent = 'Модели';
if (logoSub) logoSub.textContent = 'Москва';
} else {
if (logoMain) logoMain.textContent = 'Models';
if (logoSub) logoSub.textContent = 'Moscow';
}
$$('#ph-lang-btn .lang-full, #ph-lang-btn-d .lang-full').forEach(function (el) { el.textContent = full; });
$$('#ph-lang-btn .lang-short, #ph-lang-btn-d .lang-short').forEach(function (el) { el.textContent = short; });
}
  var langPairs = [
    { btn: $('#ph-lang-btn'), menu: $('#ph-lang-menu') },
    { btn: $('#ph-lang-btn-d'), menu: $('#ph-lang-menu-d') }
  ];
  function closeLangMenus() {
    langPairs.forEach(function (p) { if (p.menu) p.menu.setAttribute('hidden', ''); });
  }
  langPairs.forEach(function (p) {
    if (!p.btn || !p.menu) return;
    p.btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var wasHidden = p.menu.hasAttribute('hidden');
      closeLangMenus();
      if (wasHidden) p.menu.removeAttribute('hidden');
    });
    $$('button', p.menu).forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.stopPropagation();
        var lang = item.getAttribute('data-lang');
        var short = item.getAttribute('data-short') || 'Ru';
        var full = (lang === 'ru') ? 'Русский' : item.textContent.replace(' — в разработке', '');
        applyLang(lang, full, short);
        closeLangMenus();
      });
    });
  });
  document.addEventListener('click', closeLangMenus);

  // ===== МЕНЮ ТОЧЕК: список = h1 + все h2 (без повторов текста) =====
 var DOTS = [
{ label: 'Начало', sel: '.pagehero' },
{ label: 'Кто я', sel: '#who-i' },
{ label: 'Предложения', sel: '#offers' },
{ label: 'Путешествия', sel: '.photogallery' },
{ label: 'Почему я?', sel: '.article-block' },
{ label: 'Селебрити', sel: '.mcard-media' },
{ label: 'Вечеринки', sel: '.yt-party-section' },
{ label: 'Лайфхак', sel: '.lifehack__section' },
{ label: 'Кастинг', sel: '.cast7x_section' },
{ label: 'Вопрос-ответ', sel: '.faqblock' },
{ label: 'Интервью', sel: '#interview' },
{ label: 'Этапы', sel: '.how-to-find' },
{ label: 'ИИ-агент', sel: '.aiagent' },
{ label: 'Конец', sel: '.cta' }
];
var heads = [];
var labels = [];
DOTS.forEach(function (d) {
var el = document.querySelector(d.sel);
if (!el) return;
heads.push(el);
labels.push(d.label);
});
var bar = document.createElement('div');
bar.className = 'section-dots';
var dotsMq = window.matchMedia('(min-width: 961px)');
var dotBtns = heads.map(function (h, i) {
var label = labels[i];
var btn = document.createElement('button');
btn.type = 'button';
btn.setAttribute('aria-label', label);
btn.innerHTML = '<span class="sd-name">' + label + '</span><span class="sd-dash">—</span>';
btn.addEventListener('click', function () {
h.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
bar.appendChild(btn);
return btn;
});
document.body.appendChild(bar);
  function dotsActive() {
    var mid = window.innerHeight * 0.5;
    var idx = 0;
    heads.forEach(function (h, i) {
      if (h.getBoundingClientRect().top <= mid) idx = i;
    });
    dotBtns.forEach(function (b, i) { b.classList.toggle('on', i === idx); });
  }
  window.addEventListener('scroll', dotsActive, { passive: true });
  dotsActive();
  var dotsOpen = false, dotsHover = false, dotsTimer = null;
  function dotsApply() { bar.classList.toggle('open', dotsOpen && dotsMq.matches); }
  bar.addEventListener('mouseenter', function () { dotsHover = true; dotsOpen = true; dotsApply(); });
  bar.addEventListener('mouseleave', function () { dotsHover = false; dotsOpen = false; dotsApply(); });
  window.addEventListener('scroll', function () {
    if (!dotsMq.matches) return;
    dotsOpen = true;
    dotsApply();
    if (dotsTimer) clearTimeout(dotsTimer);
    dotsTimer = setTimeout(function () {
      if (!dotsHover) { dotsOpen = false; dotsApply(); }
    }, 1000);
  }, { passive: true });

  // ===== Ссылки Telegram: новая вкладка =====
  $$('a[href^="https://t.me"]').forEach(function (a) {
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener');
  });
})();
 // ===== ЛИПКОЕ КИНО (cinema): проявление фото + модалка «Читать дальше» =====
(function () {
  var chapters = $$('.cinema-chapter');
  if (!chapters.length) return;
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('on'); cio.unobserve(e.target); }
      });
    }, { rootMargin: '-20% 0px -20% 0px', threshold: 0 });
    chapters.forEach(function (ch) { cio.observe(ch); });
  } else {
    chapters.forEach(function (ch) { ch.classList.add('on'); });
  }
  var sheet = document.createElement('div');
  sheet.className = 'cinema-sheet';
  sheet.innerHTML = '<div class="cinema-sheet__inner"><button class="cinema-sheet__close" type="button" aria-label="Закрыть">×</button><div class="cinema-sheet__body"></div></div>';
  document.body.appendChild(sheet);
  var sheetBody = sheet.querySelector('.cinema-sheet__body');
  function closeSheet() {
    sheet.classList.remove('open');
    document.body.style.overflow = '';
  }
  sheet.querySelector('.cinema-sheet__close').addEventListener('click', closeSheet);
  sheet.addEventListener('click', function (e) { if (e.target === sheet) closeSheet(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sheet.classList.contains('open')) closeSheet();
  });
  $$('.cinema-readmore').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var ch = btn.closest('.cinema-chapter');
      if (!ch) return;
      var t = ch.getAttribute('data-title') || '';
      var full = ch.querySelector('.cinema-full');
      sheetBody.innerHTML = (t ? '<h3>' + t + '</h3>' : '') + (full ? full.innerHTML : '');
      sheet.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });
})();
// ===== ФОТОГАЛЕРЕЯ: КАТАЛОГ ПУТЕШЕСТВИЙ (второй слайдер по местам) =====
(function(){
var CONFIG = [
{ id: 'kurchevel', name: 'Куршевель', photos: [
'media/gallery/kurchevel-1.webp',
'media/gallery/kurchevel-2.webp',
'media/gallery/kurchevel-3.webp',
'media/gallery/kurchevel-4.webp',
'media/gallery/kurchevel-5.webp',
'media/gallery/kurchevel-6.webp',
'media/gallery/kurchevel-7.webp',
'media/gallery/kurchevel-8.webp',
'media/gallery/kurchevel-9.webp'
] },
{ id: 'dubai', name: 'Дубай', photos: [] },
{ id: 'goa', name: 'Гоа', photos: [
'media/gallery/goa-2.webp',
'media/gallery/goa-3.webp',
'media/gallery/goa-4.webp',
'media/gallery/goa-5.webp',
'media/gallery/goa-6.webp',
'media/gallery/goa-7.webp',
'media/gallery/goa-8.webp',
'media/gallery/goa-9.webp',
'media/gallery/goa-13.webp'
] },
{ id: 'maldivy', name: 'Мальдивы', photos: [] },
{ id: 'maiami', name: 'Майами', photos: [
'media/gallery/maiami-1.webp',
'media/gallery/maiami-2.webp',
'media/gallery/maiami-3.webp',
'media/gallery/maiami-4.webp',
'media/gallery/maiami-5.webp',
'media/gallery/maiami-6.webp',
'media/gallery/maiami-7.webp',
'media/gallery/maiami-8.webp',
'media/gallery/maiami-9.webp',
'media/gallery/maiami-10.webp'
] }
];
var root = document.querySelector('.photogallery');
if (!root) return;
var placesWrap = root.querySelector('.photogallery__places');
var tape = root.querySelector('.photogallery__tape');
if (!placesWrap || !tape) return;
var places = CONFIG.filter(function(p){ return p.photos && p.photos.length > 0; });
if (!places.length) { root.hidden = true; return; }
var groups = [];
places.forEach(function(p){
var a = document.createElement('a');
a.className = 'photogallery__place';
a.href = '#photogallery-' + p.id;
a.textContent = p.name;
a.dataset.place = p.id;
placesWrap.appendChild(a);
var g = document.createElement('div');
g.className = 'photogallery__group';
g.id = 'photogallery-' + p.id;
g.dataset.place = p.id;
p.photos.forEach(function(src, i){
var img = document.createElement('img');
img.src = src;
img.alt = p.name + ' — фото ' + (i + 1);
img.loading = 'lazy';
img.decoding = 'async';
g.appendChild(img);
});
tape.appendChild(g);
groups.push(g);
});
var links = Array.prototype.slice.call(placesWrap.querySelectorAll('.photogallery__place'));
function groupLeft(g){ return g.getBoundingClientRect().left - tape.getBoundingClientRect().left + tape.scrollLeft; }
function slideLinkIntoView(a){
var target = a.offsetLeft - (placesWrap.clientWidth - a.offsetWidth) / 2;
placesWrap.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
}
function setActive(id, withSlide){
links.forEach(function(a){
var on = (a.dataset.place === id);
if (on && withSlide && !a.classList.contains('on')) slideLinkIntoView(a);
a.classList.toggle('on', on);
});
}
function currentPlace(){
var center = tape.scrollLeft + tape.clientWidth / 2;
var best = groups[0].dataset.place;
var bestDist = Infinity;
groups.forEach(function(g){
var start = groupLeft(g);
var end = start + g.offsetWidth;
if (center >= start && center < end) { best = g.dataset.place; bestDist = -1; }
else if (bestDist !== -1) {
var d = Math.min(Math.abs(center - start), Math.abs(center - end));
if (d < bestDist) { bestDist = d; best = g.dataset.place; }
}
});
return best;
}
links.forEach(function(a){
a.addEventListener('click', function(e){
e.preventDefault();
var g = null;
groups.forEach(function(x){ if (x.dataset.place === a.dataset.place) g = x; });
if (!g) return;
tape.scrollTo({ left: groupLeft(g), behavior: 'smooth' });
setActive(a.dataset.place, true);
});
});
var ticking = false;
tape.addEventListener('scroll', function(){
if (ticking) return;
ticking = true;
requestAnimationFrame(function(){
ticking = false;
setActive(currentPlace(), true);
});
}, { passive: true });
setActive(places[0].id, false);
var imgs = tape.querySelectorAll('img');
if ('IntersectionObserver' in window) {
var io = new IntersectionObserver(function(es){
es.forEach(function(en){
if (en.isIntersecting) { en.target.classList.add('on'); io.unobserve(en.target); }
});
}, { root: tape, rootMargin: '0px 15% 0px 15%', threshold: 0 });
imgs.forEach(function(img){ io.observe(img); });
} else {
imgs.forEach(function(img){ img.classList.add('on'); });
}
})();
/* ===== FAVM SLIDER V1: без автопрокрутки; стрелки десктоп, свайп+точки мобайл ===== */
(function(){
  var favmSlider = document.querySelector('.favm-slider');
  if (!favmSlider) return;
  var favmTrack = favmSlider.querySelector('.favm-track');
  if (!favmTrack) return;
  var favmTotal = favmTrack.children.length;
  if (favmTotal < 2) return;
  var favmCur = 0;
  var favmDotsWrap = favmSlider.querySelector('.favm-dots');
  var favmDots = [];
  function favmRender(){
    favmTrack.style.transform = 'translateX(-' + (favmCur * 100 / favmTotal) + '%)';
    for (var i = 0; i < favmDots.length; i++) {
      favmDots[i].classList.toggle('favm-dot--on', i === favmCur);
    }
  }
  function favmGo(i){ favmCur = ((i % favmTotal) + favmTotal) % favmTotal; favmRender(); }
  function favmNext(){ favmGo(favmCur + 1); }
  function favmPrev(){ favmGo(favmCur - 1); }
  if (favmDotsWrap) {
    for (var k = 0; k < favmTotal; k++) {
      (function(idx){
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'favm-dot';
        b.setAttribute('aria-label', 'Кадр ' + (idx + 1));
        b.addEventListener('click', function(){ favmGo(idx); });
        favmDotsWrap.appendChild(b);
        favmDots.push(b);
      })(k);
    }
  }
  var favmPrevBtn = favmSlider.querySelector('.favm-arrow--prev');
  var favmNextBtn = favmSlider.querySelector('.favm-arrow--next');
  if (favmPrevBtn) favmPrevBtn.addEventListener('click', favmPrev);
  if (favmNextBtn) favmNextBtn.addEventListener('click', favmNext);
  var favmTx = 0;
  favmSlider.addEventListener('touchstart', function(e){ favmTx = e.touches[0].clientX; }, {passive: true});
  favmSlider.addEventListener('touchend', function(e){
    var dx = favmTx - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) { if (dx > 0) favmNext(); else favmPrev(); }
  }, {passive: true});
  favmRender();
})();

// ===== ВЕЧЕРИНКИ: слайдер вертикальных видео (точки, стрелки, play/mute, автоскрытие) =====
(function () {
var slider = document.querySelector('.yt-party-slider');
if (!slider) return;
var track = slider.querySelector('.yt-party-track');
if (!track) return;
var slides = $$('.yt-party-slide', track);
var total = slides.length;
if (!total) return;
var dotsWrap = slider.querySelector('.yt-party-dots');
var playBig = slider.querySelector('.yt-party-playbig');
var muteBtn = slider.querySelector('.yt-party-mute');
var prevBtn = slider.querySelector('.yt-party-arrow--prev');
var nextBtn = slider.querySelector('.yt-party-arrow--next');
var cur = 0;
var dots = [];
if (dotsWrap) {
for (var k = 0; k < total; k++) {
(function (idx) {
var b = document.createElement('button');
b.type = 'button';
b.className = 'yt-party-dot';
b.setAttribute('aria-label', 'Видео ' + (idx + 1));
b.addEventListener('click', function () { go(idx); });
dotsWrap.appendChild(b);
dots.push(b);
})(k);
}
}
function videoOf(s) { return s.querySelector('video'); }
function load(s) {
var v = videoOf(s);
if (v && v.getAttribute('data-src')) {
v.src = v.getAttribute('data-src');
v.removeAttribute('data-src');
v.preload = 'metadata';
}
}
function pauseAll(except) {
slides.forEach(function (s, i) {
var v = videoOf(s);
if (v && i !== except) v.pause();
});
}
var idleTimer = null;
function showControls() {
slider.classList.remove('is-idle');
clearTimeout(idleTimer);
idleTimer = setTimeout(function () {
if (slider.classList.contains('is-playing')) slider.classList.add('is-idle');
}, 3000);
}
function updateMute() {
var v = videoOf(slides[cur]);
slider.classList.toggle('is-muted', !!v && v.muted);
}
function render() {
track.style.transform = 'translateX(-' + (cur * 100) + '%)';
dots.forEach(function (d, i) { d.classList.toggle('on', i === cur); });
slider.classList.toggle('is-photo', !videoOf(slides[cur]));
load(slides[cur]);
pauseAll(cur);
slider.classList.remove('is-playing');
showControls();
}
function go(i) { cur = ((i % total) + total) % total; render(); }
function playActive() {
var v = videoOf(slides[cur]);
if (!v) return;
load(slides[cur]);
v.play().catch(function () { v.muted = true; v.play().catch(function () {}); });
slider.classList.add('is-playing');
showControls();
}
if (playBig) playBig.addEventListener('click', playActive);
if (muteBtn) muteBtn.addEventListener('click', function (e) {
e.stopPropagation();
var v = videoOf(slides[cur]);
if (!v) return;
v.muted = !v.muted;
updateMute();
showControls();
});
if (prevBtn) prevBtn.addEventListener('click', function () { go(cur - 1); });
if (nextBtn) nextBtn.addEventListener('click', function () { go(cur + 1); });
slides.forEach(function (s) {
var v = videoOf(s);
if (!v) return;
v.addEventListener('play', function () { slider.classList.add('is-playing'); updateMute(); showControls(); });
v.addEventListener('pause', function () { slider.classList.remove('is-playing'); showControls(); });
v.addEventListener('volumechange', updateMute);
});
slider.addEventListener('mousemove', showControls);
slider.addEventListener('touchstart', showControls, { passive: true });
var x0 = null;
track.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
track.addEventListener('touchend', function (e) {
if (x0 === null) return;
var dx = e.changedTouches[0].clientX - x0;
if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
x0 = null;
}, { passive: true });
var mx = null;
track.addEventListener('mousedown', function (e) { mx = e.clientX; e.preventDefault(); });
window.addEventListener('mouseup', function (e) {
if (mx === null) return;
var dx = e.clientX - mx;
if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
mx = null;
});
render();
updateMute();
})();
// ===== ИНТЕРВЬЮ V2 (intw): табы, модалки, данные =====
(function () {
  var section = document.getElementById('interview');
  if (!section) return;

  var DATA = {
    anya: { name: 'Аня', age: '20 лет', info: 'Два мероприятия', answers: [
      'Аня, 20 лет, два мероприятия.',
      'Нашла сайт в яндексе',
      'Высокий гонорар, чувствуется серьезный подход, это резко контрастировало со следующими агентствами, а дальше не искала.',
      'Первое мероприятие - это был романтический вечер. Там просто заработала. Потом сразу тебе сказала, что меня интересуют только люди из моего круга. потому что я хочу расти в своей сфере.',
      'Перед первым ничего не боялась. Всё прошло хорошо. так как и обговаривали. А вот перед вторым - боялась. Это было мероприятия, на котором были много влиятельных людей, с которыми мне нужно было познакомиться и наладить отношения. Я очень боялась, что не знала как они отнесуться к тому, что я из эскорта. Ну ничего, как выяснилось, это нормальная ситуация. Я сопровождала человека на форуме, потом мы продолжили общение',
      'Да не запомнилось особо. Провела время и все. Второе мероприятие - оно важное. Оно запомнилось',
      'На втором мероприятии я сидела за одним столом с деканом своего факультета.',
      'То, что мне нравился мой спутник. Он был интересен. И я поняла, что поступила правильно',
      'Я получила заявку. Отправила анкету. Мне ответили. Всё',
      'Я написала. Мы созвонились. Поговорили. Потом, встретились. Я показала, что умею. Всё чудесно',
      'Для меня карьера - это всё. Я очень люблю международное право и буду в нем развиваться. Это главное',
      'Нет не знают. Да мне и всё равно',
      'Не распыляйся на ненужных людей. Выбирай заказы. Ты молодец',
      'Поскольку я свободно говорю на английском и на немецком, меня интересуют зарубежное сопровождение. В идеале - деловое и романтическое. Про гонорар - ну не знаю. В зависимости от продолжительности. От 5.000.000.. Так же готова к мероприятиям здесь в Москве с иностранными гостями'
    ] },
    maria: { name: 'Мария', age: '22 года', info: 'Пять мероприятий', answers: [
      'Мария. 22 года, студентка актерского факультета',
      'Познакомила общая знакомая. Не из эскорта',
      'Я про другие не знаю. не интересовалась',
      'у меня было пять мероприятий: 4 встречи, 5-е сначала тоже была встреча, потом предложил мне составить компанию в совместном путешествии. Теперь я с ним же на постоянной основе',
      'Мне было 19 лет. Я боялась всего.',
      'Мужчина понимал, что я очень волновалась. Мы поужинали в ресторане и на этом решили разойтись. Мужчина подарил мне просто так 100.000 за беспокойство. Для меня это тогда были серьезные деньги.',
      'Интересные все. Но самое сильное впечатление, это на мероприятие мы летали на вертолете. туда и обратно. Я не могу рассказать деталей. Но было круто',
      'То, что ты меня всему научил. Я всегда была открыта к людям, но не к мужчинам. ты во мне это исправил.',
      'Я к анкете приложила визитку. Только вся в белом. помоему сработало))',
      'я пришла. разделась. и мы просто начали разговаривать. А дальше я набрала обороты и поговорили обо всём))',
      'Я кайфую от того, что мной восхищаются. А выражается это в гонорарах',
      'Нет, никто не знает',
      'ничего такого. ты делаешь всё правильно',
      'Пока что я сосредоточена на карьере. Поэтому только встречи в москве от 1000000'
    ] },
    sonya: { name: 'Соня', age: '19 лет', info: 'Одно мероприятие', answers: [
      'Соня. 19 лет. На одном и оно продолжается, но я не исключаю вариант, что найду что-то повыгоднее',
      'Погуглила дорогой эскорт',
      'Я хотела стать эскортницей по вызову. Ты меня переубедил этим не заниматься. Я решила попробовать с тобой, если что, думала, что в любой момент могу уйти туда',
      'Одна встреча. Мужчина сразу сказал, что ищет постоянную основу. А эту встречу он оплатил, чтобы со мной познакомиться, потому что понравилась по анкете',
      'Не было страхов. Я была готова ко всему, но оказалось все проще',
      'Мы встретились. Поужинали в ресторане, покатались по городу. Получила много всего, первый подарок - мне оплатили обучение на права. Сняли квартиру. В которой живу одна. Хожу в зал, пробую разные курсы, но пока ничего не нравиться',
      'Однажды мы с мужчиной ехали. На светофоре остановились и я в окне автобуса который тоже остановился, увидела своего бывшего одноклассника, а он увидел меня. Он в автобусе, я - в лендровере. Пока мальчик',
      'То, что я богиня',
      'Я отвечала на все заявки. На эту получила ок. Я не знала к кому я иду. Пришла и все получилось',
      'Я научилась общаться. Думала, что умею.. Что там уметь? А нет. Ты научил меня до уровня "богиня общения"',
      'Это значит тусить. Кайфовать.',
      'Нет не знают. Я не хочу чтобы мои будущие мужчины знали. Я хочу чтобы они думали что я на их мероприятии в первый раз в качестве эскорт модели',
      'Молодец, девочка, что попробовала',
      'Хочу долгосрочный контракт, который больше чем сейчас. на 2-3 миллиона в месяц и больше'
    ] },
    victoria: { name: 'Виктория', age: '21 год', info: 'Одно мероприятие', answers: [
      'Виктория. 21 год. медсестра',
      'через поиск',
      'Мне важна конфиденциальность. Мне понравилось что у тебя нет каталогов с моделями.',
      'одно мероприятие. заработала 500.000',
      'Я очень долго ждала первый заказ. больше двух лет. Я очень нервничала. То, что мужчина оплатил мне перелет до москвы и гостиницу - заставляло нервничать еще сильнее',
      'Мужчина приехал ко мне в гостиницу. Мы поговорили. Потом поехали покататься по городу. Он мне показал Москву. Поужинали. Вернулись в номер. Получила подарочек',
      'Я впервые увидела Москва-Сити. Меня это впечатлило. Потом мы поднялись в ресторан на верхнем этаже.',
      'То, что ты меня подготовил',
      'Я не особо верила в то, что меня выберут, при условии, что мне лететь через пол страны. Поэтому отвечала не на все заказы',
      'Когда я прилетела в Москву, ты меня встретил и привез в гостиницу. Мы с тобой поговорили, ты показал, как это делать лучше. Я перестала волноваться. Через четыре дня мы встретились уже с заказчиком',
      'Я знаю, что это ненадолго. Поэтому, пока красивая, хочу накопить денег',
      'Нет конечно',
      'Надо было раньше начинать',
      'К интересным романтическим'
    ] },
    katya: { name: 'Катя', age: '23 года', info: 'Три мероприятия', answers: [
      'Катя 23 года, была на 3 мероприятиях.',
      'Подруга посоветовала',
      'Другие не искала. просто доверилась',
      'Сначала отдала кредиты. Потом согласилась еще на одно. Потом еще одно. Трачу деньги на себя',
      'Страха не было. Немного волновалась. Успокоило то, что ты мне всё рассказал и четко проинструктировал, всему научил. К тому же, видела пример подруги, так что всё прошло нормально.',
      'Первое мероприятие - это было свидание. Я хотела блеснуть эрудицией, но мужчина оказался опытнее меня, поэтому я молчала и слушала. Хотя мужчина оценил мою увлеченность. Потом, как ты советовал, взяла инициативу в свои руки. Показала заранее заготовленные ролики и сказала что хочу так же. Поехали и воплотили. Оказалось, это проще, чем я сама себе накручивала',
      'Все по-своему интересны. Мне самой интересно было экспериментировать. Подготовила ролики и интересные цены, которая предложила воплотить.',
      'Мне нравится контролировать мужчин, и спасибо тебе, что ты только с такими меня и знакомишь. Еще мне нравиться то, что все трое мужчины пытались пригласить меня повторно.',
      'На первой встрече ты мне сказал: "Задавай любые вопросы". Я задавала по моему сотни две вопросов что как и ты на все ответил. Потом мы приехали к тебе и ты сказал "командуй" И я сделала все что хотела и даже то, что всегда где-то глубоко во мне.',
      'Мы катались катались. Я чувствовала себя королевой и красивой и в тоже время властной. Я научилась разговаривать с мужчинами. Понимать что хочу и не боятся говорить про это. Я рассталась с парнем и нашла себе нового. Хорошего и классного.',
      'Я считаю себя богиней кекса. Мне нравиться подтверждение этого денежным эквивалентом.',
      'Нет. Мой парень сделал мне предложение. Думаю, всё этим сказано',
      'Катя, ты лучшая! Не сомневайся в этом и действуй!',
      'Посмотрим. Я готова к достойным предложениям'
    ] },
    alisa: { name: 'Алиса', age: '24 года', info: 'Одно путешествие', answers: [
      'Алиса, 24 года. Я была в одном путешествии',
      'Меня привела подруга. Она сказала, что есть мужчина, которому нужны две девушки для сопровождения в Китай. Отдохнуть и поработать. Подруга предложила подать заявку от нас двоих',
      'Я другие не смотрела',
      'У меня это одно мероприятие. До этого я работала в парфюмерном лакшери бутике. После мероприятия, решила начать работать в недвижимости.',
      'Перед мероприятием, мужчина дал нам с подружкой деньги, чтобы мы купили что нам понадобиться в поездке. Поэтому было доверие',
      'Я ожидала что мы с девочками просидим в гостинице, потому что сопровождение по рабочим вопросам не требовалось, а получилось так, что мы только один день погуляли с девочками по гуанчжоу, а потом уже с мужчиной покатались по городу. Везде побывали, покатались на катере, а потом он предложил полететь в Тайланд и мы тусили еще два дня там.',
      'Мы ели много всего экзотического и в Китае и в Тае. От шашлыка из крокодила, до еще чего, даже не запомнила',
      'То, что была рядом подруга',
      'Это было удивительно. Мы с подругой приехали к тебе, потому что первое знакомство с мужчиной было по скайпу. Когда мы приехали, у тебя была другая девочка блогер. Первое что я ей сказала.. оо. я на тебя подписана. Потом мы долго ждали, когда мужчина сможет выйти на связь, у него были какие-то внезапные дела. До этого мы катались вчетвером. Потом позвонил мужчина. Мы уже готовые. Хотели даже покататься при включенном скайпе. Я думала что мужчина выберет двоих из нас троих. Думала, что меня не выберет. А мужчина взял всех троих.',
      'Сначала мы созвонились. Потом встретились уже втроем: я, ты и моя подруга. Ни я ни моя подруга никогда не пробовали кататься втроем, но все прошло лучше и интереснее, чем можно было представить.',
      'Возможности. Больше всего не люблю упускать возможности.',
      'Только подруга и всё',
      'Не тормози. Пока молодая - всё получиться',
      'Люблю путешествовать и в моем приоритете - поездки от 3000000'
    ] },
    dasha: { name: 'Даша', age: '19 лет', info: 'Одно мероприятие', answers: [
      'Меня зовут Даша. Я была на одном мероприятии',
      'Через поиск. Я давно про тебя знала, но долго решалась',
      'Я общалась с представителями других агентств. Но у них какие-то маленькие суммы, что даже как-то не интересно.',
      'У меня было только одно мероприятие. Надо было составить компанию мужчине. Мы разговаривали наверное часов пять. Заказывали еду и напитки аж три раза. У меня менялись вкусы. На самом деле, мне просто очень нравилось заказывать.',
      'Да не боялась. Просто пришла, зная, что если что уйду в любой момент',
      'Я ожидала то, что и все ожидают. Но, мы просто веселились и разговаривали о его проблемах с женой и детьми.',
      'Я объелась',
      'Ты. Твои советы и то, чему ты меня научил',
      'Я написала. Отправила фотки. Потом созвонились. Мужчина просто так мне денег на хорошее настроение.',
      'Я приехала. Мы покатались. ты всё рассказал. Или надо поподробнее?',
      'Это интересно',
      'Нет. И я думаю не узнают.',
      'Никогда никуда не опаздывай. Уважай чужое время. Я опоздала к тебе тогда, но ты простил',
      'На любые. Встречи от полумиллиона, все остальное - обсуждаемо'
    ] }
  };
  var QUESTIONS = [
    'Представься, сколько тебе лет и на скольких мероприятиях ты была?',
    'Как ты про меня узнала?',
    'Чем я отличаюсь от других агентств или предложений, которые ты видела?',
    'Сколько у тебя всего было мероприятий? Что тебе это дало?',
    'Расскажи о своих страхах перед первым твоим мероприятием?',
    'Расскажи о первом мероприятии. Чего ты ожидала? Как всё прошло? Что ты получила?',
    'Расскажи о самом интересном мероприятии или случае, который с тобой произошёл?',
    'Что помогает тебе чувствовать себя свободно на мероприятии?',
    'Расскажи про кастинг на мероприятие, о котором ты рассказала?',
    'Расскажи, как прошло наше с тобой собеседование? Что ты чувствовала? Чему научилась? Как тебе это помогло?',
    'Что для тебя значит быть моделью в элитном сопровождении? Не работа, а именно смысл?',
    'Твои знакомые знают про то, что ты в элитном эскорте?',
    'Какие бы ты дала советы самой себе, если бы только начинала?',
    'К каким новым мероприятиям ты готова и на какой гонорар рассчитываешь?'
  ];

  var tabs = Array.prototype.slice.call(section.querySelectorAll('.intw-tab'));
  var modelsList = document.getElementById('intw-models');
  var questionsList = document.getElementById('intw-questions');
  var modal = document.getElementById('intw-modal');
  var modalBody = document.getElementById('intw-modal-body');
  var closeBtn = section.querySelector('.intw-close');

  // Генерация панелек вопросов (один раз)
  if (questionsList && !questionsList.children.length) {
    QUESTIONS.forEach(function (t, i) {
      var d = document.createElement('div');
      d.className = 'intw-qp';
      d.setAttribute('data-qi', i);
      d.innerHTML = '<div><p class="intw-qp-num">Вопрос ' + (i + 1) + '</p><p class="intw-qp-text">' + t + '</p></div>';
      questionsList.appendChild(d);
    });
  }

  // Табы
  function showMode(mode) {
    tabs.forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-mode') === mode);
    });
    if (modelsList) modelsList.hidden = (mode !== 'models');
    if (questionsList) questionsList.hidden = (mode !== 'questions');
  }
  tabs.forEach(function (b) {
    b.addEventListener('click', function () { showMode(b.getAttribute('data-mode')); });
  });

  // Модалка: открытие/закрытие
  function openModal(html) {
    if (!modal || !modalBody) return;
    modalBody.innerHTML = html;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) closeModal();
  });

  // Клик по карточке модели → все её ответы
  if (modelsList) modelsList.addEventListener('click', function (e) {
    var card = e.target.closest ? e.target.closest('.intw-card') : null;
    if (!card) return;
    var d = DATA[card.getAttribute('data-model')];
    if (!d) return;
    var html = '<div class="intw-mh"><h3>' + d.name + ', ' + d.age + '</h3><p>' + d.info + '</p></div>';
    QUESTIONS.forEach(function (q, i) {
      html += '<div class="intw-mq"><div class="intw-mq-num">Вопрос ' + (i + 1) + '</div><div class="intw-mq-text">' + q + '</div><p class="intw-mq-a">' + (d.answers[i] || '') + '</p></div>';
    });
    openModal(html);
  });

  // Клик по панельке вопроса → ответы всех моделей
  if (questionsList) questionsList.addEventListener('click', function (e) {
    var qp = e.target.closest ? e.target.closest('.intw-qp') : null;
    if (!qp) return;
    var i = parseInt(qp.getAttribute('data-qi'), 10);
    var html = '<div class="intw-mqh"><div class="intw-mqh-num">Вопрос ' + (i + 1) + '</div><p class="intw-mqh-text">' + QUESTIONS[i] + '</p></div><div class="intw-answers">';
    Object.keys(DATA).forEach(function (k) {
      html += '<div class="intw-answer"><div class="intw-answer-name">' + DATA[k].name + ', ' + DATA[k].age + '</div><p class="intw-answer-text">' + (DATA[k].answers[i] || 'Ответ отсутствует') + '</p></div>';
    });
    html += '</div>';
    openModal(html);
  });

  showMode('models');
})();
/* ===== КАСТИНГ: плавное появление + авто-пауза YouTube при скролле ===== */
(function () {
  "use strict";

  // 1) Reveal-анимация секции (использует уже существующий класс .reveal)
  var section = document.querySelector('.cast7x_section.reveal');
  if (section && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('on');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    io.observe(section);
  }

  // 2) YouTube API: пауза видео, когда блок уходит из экрана
  var iframe = document.getElementById('cast7xYT');
  if (!iframe) return;

  var player = null;

  function onYouTubeIframeAPIReady() {
    player = new YT.Player('cast7xYT', {
      events: {
        onReady: function (e) {
          var wrap = iframe.closest('.cast7x_video') || iframe;
          if ('IntersectionObserver' in window) {
            var vio = new IntersectionObserver(function (entries) {
              entries.forEach(function (en) {
                if (!en.isIntersecting && player && typeof player.pauseVideo === 'function') {
                  try { player.pauseVideo(); } catch (err) {}
                }
              });
            }, { threshold: 0.1 });
            vio.observe(wrap);
          }
        }
      }
    });
  }

  // Подгружаем YouTube IFrame API один раз
  if (window.YT && window.YT.Player) {
    onYouTubeIframeAPIReady();
  } else {
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var first = document.getElementsByTagName('script')[0];
    first.parentNode.insertBefore(tag, first);
    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
  }
})();
/* ===== CTA: параллакс фона ===== */
(function () {
  var cta = document.querySelector('.cta');
  if (!cta) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function tick() {
    var r = cta.getBoundingClientRect();
    var p = (window.innerHeight - r.top) / (window.innerHeight + r.height);
    cta.style.setProperty('--shift', ((p - 0.5) * 30) + 'px');
  }
  window.addEventListener('scroll', tick, { passive: true });
  tick();
})();
/* ===== БЛОК ДОВЕРИЯ: видео-контролы (Shorts + Instagram) ===== */
// ===== ARTICLE VIDEO: Shorts-плеер =====
(function () {
  var wrap = document.getElementById('av-wrap');
  var video = document.getElementById('av-video');
  var poster = document.getElementById('av-poster');
  var playBig = document.getElementById('av-play-big');
  var btnMuteBr = document.getElementById('av-btn-mute-br');
  
  if (!wrap || !video) return;
  
  var idleTimer = null;
  var IDLE_MS = 3000;

  function showControls() {
    wrap.classList.remove('is-idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      if (!video.paused) wrap.classList.add('is-idle');
    }, IDLE_MS);
  }

  function togglePlay() {
    if (video.paused) { video.play(); } else { video.pause(); }
  }

  function toggleMute() {
    video.muted = !video.muted;
  }

  function updatePlayState() {
    wrap.classList.toggle('is-playing', !video.paused);
    wrap.classList.toggle('is-paused', video.paused);
  }

  function updateMuteState() {
    wrap.classList.toggle('is-muted', video.muted);
  }

  function startVideo() {
    video.play().catch(function () {
      video.muted = true;
      video.play().catch(function () {});
    });
  }

  // Запуск по клику на постер или большую кнопку play
  poster.addEventListener('click', startVideo);
  playBig.addEventListener('click', function (e) { e.stopPropagation(); startVideo(); });

  // Play/pause по клику на само видео
  video.addEventListener('click', togglePlay);

  // Mute из нижнего правого угла
  btnMuteBr.addEventListener('click', toggleMute);

  // Движение мыши/касание → показать контролы и сбросить таймер автоскрытия
  wrap.addEventListener('mousemove', showControls);
  wrap.addEventListener('touchstart', showControls, { passive: true });

  // События видео
  video.addEventListener('play', updatePlayState);
  video.addEventListener('pause', function () {
    updatePlayState();
    wrap.classList.remove('is-idle');
    clearTimeout(idleTimer);
  });
  video.addEventListener('volumechange', updateMuteState);

  // Начальное состояние
  updateMuteState();
  updatePlayState();
})();
// ===== МЕДИЙНАЯ МОДЕЛЬ: слайдер как в Инстаграме (точки внизу, без автопрокрутки) =====
(function () {
  var box = $('.mcard-media__sliderbox');
  if (!box) return;
  var track = $('.mcard-media__track', box);
  var slides = $$('.mcard-media__slide', track);
  var dotsWrap = $('.mcard-media__dots', box);
  if (!track || !slides.length || !dotsWrap) return;
  var cur = 0;

  var dots = slides.map(function (s, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'mcard-media__dot';
    b.setAttribute('aria-label', 'Слайд ' + (i + 1));
    b.addEventListener('click', function () { go(i); });
    dotsWrap.appendChild(b);
    return b;
  });

  function loadMedia(slide) {
    var img = slide.querySelector('img[data-src]');
    if (img) { img.src = img.getAttribute('data-src'); img.removeAttribute('data-src'); }
    var vid = slide.querySelector('video[data-src]');
    if (vid) { vid.src = vid.getAttribute('data-src'); vid.removeAttribute('data-src'); vid.preload = 'metadata'; }
  }

  function playActive() {
    slides.forEach(function (s, i) {
      var v = s.querySelector('video');
      if (!v) return;
      if (i === cur) {
        loadMedia(s);
        v.play().catch(function () { v.muted = true; v.play().catch(function () {}); });
      } else {
        v.pause();
      }
    });
  }

  function go(i) {
    cur = Math.max(0, Math.min(slides.length - 1, i));
    track.style.transform = 'translateX(-' + (cur * 100) + '%)';
    dots.forEach(function (d, k) { d.classList.toggle('on', k === cur); });
    loadMedia(slides[cur]);
    if (slides[cur + 1]) loadMedia(slides[cur + 1]);
    playActive();
  }

  // Стрелки влево/вправо — как в карточках моделей (.mcard__arrow), видны только на десктопе
  var prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'mcard-media__arrow mcard-media__arrow--prev';
  prev.setAttribute('aria-label', 'Предыдущее');
  prev.textContent = '\u2039';
  prev.addEventListener('click', function () { go(cur - 1); });
  var next = document.createElement('button');
  next.type = 'button';
  next.className = 'mcard-media__arrow mcard-media__arrow--next';
  next.setAttribute('aria-label', 'Следующее');
  next.textContent = '\u203A';
  next.addEventListener('click', function () { go(cur + 1); });
  box.querySelector('.mcard-media__slider').appendChild(prev);
  box.querySelector('.mcard-media__slider').appendChild(next);

  var x0 = null;
  track.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
    x0 = null;
  }, { passive: true });

  var mx = null;
  track.addEventListener('mousedown', function (e) { mx = e.clientX; e.preventDefault(); });
  window.addEventListener('mouseup', function (e) {
    if (mx === null) return;
    var dx = e.clientX - mx;
    if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
    mx = null;
  });

  go(0);
})();
/* ===== MCARD V3: слайдер карточки топ-модели (точки внизу, активная синяя; стрелки на десктопе; свайп на мобильных) ===== */
(function(){
  var cards = document.querySelectorAll('.mcard');
  if (!cards.length) return;
  Array.prototype.forEach.call(cards, function(card){
    var slider = card.querySelector('.mcard__slider');
    var track = card.querySelector('.mcard__track');
    if (!slider || !track) return;
    var slides = Array.prototype.slice.call(track.children);
    var total = slides.length;
    if (!total) return;
    var cur = 0;
    // Точки
    var dotsWrap = document.createElement('div');
    dotsWrap.className = 'mcard__dots';
    var dots = [];
    for (var k = 0; k < total; k++) {
      (function(idx){
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'mcard__dot';
        b.setAttribute('aria-label', 'Слайд ' + (idx + 1));
        b.addEventListener('click', function(){ go(idx); });
        dotsWrap.appendChild(b);
        dots.push(b);
      })(k);
    }
    slider.appendChild(dotsWrap);
    // Стрелки (видны только на десктопе через CSS)
    var prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'mcard__arrow mcard__arrow--prev';
    prev.setAttribute('aria-label', 'Предыдущее');
    prev.textContent = '‹';
    prev.addEventListener('click', function(){ go(cur - 1); });
    var next = document.createElement('button');
    next.type = 'button';
    next.className = 'mcard__arrow mcard__arrow--next';
    next.setAttribute('aria-label', 'Следующее');
    next.textContent = '›';
    next.addEventListener('click', function(){ go(cur + 1); });
    slider.appendChild(prev);
    slider.appendChild(next);
    function videoOf(slide){ return slide.querySelector('video'); }
    function prep(v){ if (v && v.getAttribute('preload') === 'none') v.setAttribute('preload', 'metadata'); }
    function render(){
      track.style.transform = 'translateX(-' + (cur * 100) + '%)';
      for (var i = 0; i < total; i++) {
        dots[i].classList.toggle('on', i === cur);
        var v = videoOf(slides[i]);
        if (v && i !== cur) v.pause();
      }
      var av = videoOf(slides[cur]);
      if (av) {
        prep(av);
        av.play().catch(function(){ av.muted = true; av.play().catch(function(){}); });
      }
      if (cur + 1 < total) prep(videoOf(slides[cur + 1]));
      if (cur - 1 >= 0) prep(videoOf(slides[cur - 1]));
    }
    function go(i){ cur = ((i % total) + total) % total; render(); }
    // Свайп (мобильные)
    var tx = 0, ty = 0, horiz = null;
    slider.addEventListener('touchstart', function(e){ tx = e.touches[0].clientX; ty = e.touches[0].clientY; horiz = null; }, { passive: true });
    slider.addEventListener('touchmove', function(e){
      if (!tx) return;
      var dx = e.touches[0].clientX - tx, dy = e.touches[0].clientY - ty;
      if (horiz === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) horiz = Math.abs(dx) > Math.abs(dy);
      if (horiz) e.preventDefault();
    }, { passive: false });
    slider.addEventListener('touchend', function(e){
      if (!tx) return;
      var dx = e.changedTouches[0].clientX - tx;
      if (horiz && Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
      tx = 0; ty = 0; horiz = null;
    }, { passive: true });
    // Перетаскивание мышью (десктоп)
    var mx = null;
    slider.addEventListener('mousedown', function(e){ mx = e.clientX; e.preventDefault(); });
    window.addEventListener('mouseup', function(e){
      if (mx === null) return;
      var dx = e.clientX - mx;
      if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
      mx = null;
    });
    render();
  });
})();
/* ===== ФУТЕР-КНИЖКА: год в копирайтите ===== */
(function(){
  var root = document.querySelector('.footbook');
  if (!root) return;
  var yearEl = root.querySelector('.footbook__year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();