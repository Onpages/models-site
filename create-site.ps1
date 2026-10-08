$files = Get-ChildItem -Recurse -Filter *.html

foreach ($file in $files)
{
    $content = Get-Content $file.FullName -Raw

    $content = $content.Replace('href="/content/index.html"', 'href="/content/"')
    $content = $content.Replace('href="/modeling/index.html"', 'href="/modeling/"')
    $content = $content.Replace('href="/journal/index.html"', 'href="/journal/"')
    $content = $content.Replace('href="/models/index.html"', 'href="/models/"')
    $content = $content.Replace('href="/webcam/index.html"', 'href="/webcam/"')
    $content = $content.Replace('href="/tusovki/index.html"', 'href="/tusovki/"')

    $content = $content.Replace('content/index.html', '/content/')
    $content = $content.Replace('modeling/index.html', '/modeling/')
    $content = $content.Replace('journal/index.html', '/journal/')
    $content = $content.Replace('models/index.html', '/models/')
    $content = $content.Replace('webcam/index.html', '/webcam/')
    $content = $content.Replace('tusovki/index.html', '/tusovki/')

    Set-Content $file.FullName $content -Encoding UTF8
}

Write-Host ""
Write-Host "====================================="
Write-Host "Все ссылки исправлены"
Write-Host "====================================="
Write-Host ""