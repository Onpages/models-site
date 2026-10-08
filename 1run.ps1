$pages = @(
"models/index.html",
"models/cristy-ren/index.html",
"models/cristy-ren/story.html",

"models/olya/index.html",
"models/katya/index.html",
"models/alina/index.html",

"journal/index.html",
"journal/cinema/index.html",
"journal/travel/index.html",

"content/index.html",
"modeling/index.html",
"webcam/index.html",
"tusovki/index.html",

"legal/privacy.html",
"legal/terms.html"
)

foreach ($page in $pages)
{
    $dir = Split-Path $page

    if (!(Test-Path $dir))
    {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    $title = [System.IO.Path]::GetFileNameWithoutExtension($page)

    $html = @"
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>$title</title>
<link rel="stylesheetbody>

<nav class="nav">

/index.html
MODELS MOSCOW
</a>

<div class="nav-links">
<a href=tml#findFind model</a>
<atat-modelyu.htmlBecome model</a>
</div>

</nav>

<main style="max-width:1000px;margin:0 auto;padding:120px 5vw 80px;">

<h1>$title</h1>

<p>TEXT PLACEHOLDER</p>

<p>GALLERY PLACEHOLDER</p>

<p>VIDEO PLACEHOLDER</p>

<p>INTERVIEW PLACEHOLDER</p>

<p>POSTS PLACEHOLDER</p>

</main>

<footer>

<h2>MODELS MOSCOW</h2>

<p>
FOOTER PLACEHOLDER
</p>

</footer>

</body>
</html>
"@

    Set-Content -Path $page -Value $html -Encoding UTF8
}

Write-Host "DONE"
