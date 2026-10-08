$pages = @(
    "models\index.html",
    "models\cristy-ren\index.html",
    "models\cristy-ren\story.html",
    "models\olya\index.html",
    "models\katya\index.html",
    "models\alina\index.html",
    "journal\index.html",
    "journal\cinema\index.html",
    "journal\travel\index.html",
    "content\index.html",
    "modeling\index.html",
    "webcam\index.html",
    "tusovki\index.html",
    "legal\privacy.html",
    "legal\terms.html"
)

foreach ($page in $pages) {

    $dir = Split-Path $page

    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }

    $name = [System.IO.Path]::GetFileNameWithoutExtension($page)

    $html = @"
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<title>$name</title>

/style.css

</head>

<body>

<nav class="nav">

/index.html
<span class="logo-main">Модели</span>
<span class="logo-sub">Москва</span>
</a>

<div class="nav-links">
/index.html#findНайти модель</a>
/stat-modelyu.htmlСтать моделью</a>
</div>

</nav>

<main style="max-width:1000px;margin:0 auto;padding:120px 5vw 80px;">

<h1>$name</h1>

<p>Здесь будет текст.</p>

<p>Здесь будет галерея.</p>

<p>Здесь будет видео.</p>

<p>Здесь будет интервью.</p>

<p>Здесь будут публикации.</p>

</main>

<footer>

<h2>Модели Москва</h2>

<p>
Самые красивые девушки, интервью, путешествия и публикации.
</p>

<p>
© 2026 Модели Москва
</p>

</footer>

</body>
</html>
"@

    Set-Content -Path $page -Value $html -Encoding UTF8
}

Write-Host "DONE"
