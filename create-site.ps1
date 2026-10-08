$root = Get-Location

$folders = @(
    "models",
    "models\cristy-ren",
    "models\olya",
    "models\katya",
    "models\alina",
    "journal",
    "journal\cinema",
    "journal\travel",
    "content",
    "modeling",
    "webcam",
    "tusovki",
    "legal"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
}

function WriteHtml($path, $title, $heading, $text) {

@"
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>$title</title>
<link rel="stylesheet" href="/style.csspx;
margin:0 auto;
padding:120px 5vw 80px;
}
.placeholder{
padding:24px;
border:1px solid #eee;
background:#fafafa;
margin:24px 0;
}
</style>
</head>
<body>

<nav class="nav">
<a class="logo" href="/">Модели Москва</a>
</nav>

<main>

<h1>$heading</h1>

<p>$text</p>

<div class="placeholder">
Здесь будет текст.
</div>

<div class="placeholder">
Здесь будет галерея.
</div>

<div class="placeholder">
Здесь будет видео.
</div>

<div class="placeholder">
Здесь будет интервью.
</div>

<div class="placeholder">
Здесь будут публикации.
</div>

</main>

</body>
</html>
"@ | Set-Content -Encoding UTF8 $path

}

WriteHtml "models\index.html" `
"Модели A-Z | Модели Москва" `
"Модели A–Z" `
"Каталог моделей проекта."

WriteHtml "models\cristy-ren\index.html" `
"Cristy Ren | Модели Москва" `
"Cristy Ren" `
"Медийная модель. Путешествия. Кино. Lifestyle."

WriteHtml "models\cristy-ren\story.html" `
"История Cristy Ren" `
"Кристина Готфрид: женщина, которую невозможно забыть" `
"Здесь будет большая история Cristy Ren."

WriteHtml "models\olya\index.html" `
"Оля | Модели Москва" `
"Оля" `
"Автор материалов о кино."

WriteHtml "models\katya\index.html" `
"Катя | Модели Москва" `
"Катя" `
"Автор материалов о путешествиях."

WriteHtml "models\alina\index.html" `
"Алина | Модели Москва" `
"Алина" `
"Автор материалов о моде."

WriteHtml "journal\index.html" `
"Журнал моделей" `
"Журнал моделей" `
"Публикации и статьи моделей."

WriteHtml "journal\cinema\index.html" `
"Кино | Журнал моделей" `
"Кино" `
"Раздел публикаций о кино."

WriteHtml "journal\travel\index.html" `
"Путешествия | Журнал моделей" `
"Путешествия" `
"Раздел публикаций о путешествиях."

WriteHtml "content\index.html" `
"Контент | Модели Москва" `
"Создание контента" `
"Контент, личный бренд и медиа."

WriteHtml "modeling\index.html" `
"Моделинг | Модели Москва" `
"Моделинг" `
"Раздел о моделинге."

WriteHtml "webcam\index.html" `
"Webcam | Модели Москва" `
"Webcam" `
"Раздел о webcam."

WriteHtml "tusovki\index.html" `
"Мероприятия и тусовки" `
"Мероприятия и тусовки" `
"Раздел о мероприятиях."

WriteHtml "legal\privacy.html" `
"Политика конфиденциальности" `
"Политика конфиденциальности" `
"Здесь будет политика конфиденциальности."

WriteHtml "legal\terms.html" `
"Условия использования" `
"Условия использования" `
"Здесь будут условия использования."

Write-Host ""
Write-Host "====================================="
Write-Host "Структура сайта успешно создана"
Write-Host "====================================="