$folders = @(
"models",
"journal",
"content",
"modeling",
"webcam",
"tusovki",
"legal"
)

foreach($f in $folders)
{
    if(Test-Path $f)
    {
        Remove-Item $f -Recurse -Force
    }
}

Write-Host "DONE"