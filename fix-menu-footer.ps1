$htmlFiles = Get-ChildItem -Recurse -Filter *.html

foreach ($file in $htmlFiles) {

    # главную страницу не трогаем
    if ($file.FullName -eq (Join-Path (Get-Location) "index.html")) {
        continue
    }

    Write-Host "Processing $($file.FullName)"

    $content = Get-Content $file.FullName -Raw

    $menu = @'
<nav class="nav">
  /index.html
    <span class="logo-main">Модели</span>
    <span class="logo-sub">Москва</span>
  </a>

  <div class="nav-links">
    <a href="/index.html#findель</a>
    /stat-modelyu.htmlСтать моделью</a>
  </div>
</nav>
'@

    $footer = @'
<footer>
  <h2>Модели Москва</h2>

  <p>
    Самые красивые девушки, истории, интервью и авторские материалы.
  </p>

  <p>
    © 2026 Модели Москва
  </p>

  <p>
    Деятельность осуществляется исключительно в правовом поле.
  </p>
</footer>
'@

    # заменяем меню если уже есть
    if ($content -match '<nav') {
        $content = [System.Text.RegularExpressions.Regex]::Replace(
            $content,
            '<nav[\s\S]*?</nav>',
            [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $menu },
            'Singleline'
        )
    }

    # заменяем футер если уже есть
    if ($content -match '<footer') {
        $content = [System.Text.RegularExpressions.Regex]::Replace(
            $content,
            '<footer[\s\S]*?</footer>',
            [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $footer },
            'Singleline'
        )
    }
    else {
        $content = $content -replace '</body>', "$footer`r`n</body>"
    }

    Set-Content $file.FullName $content -Encoding UTF8
}

Write-Host ""
Write-Host "==================================="
Write-Host "DONE"
Write-Host "==================================="
