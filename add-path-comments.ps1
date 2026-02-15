param(
    [string]$SrcPath = "src",
    [switch]$Preview,
    [switch]$ForceUpdate,
    [switch]$Verbose
)

Clear-Host
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host " Angular Comment-Aware Path Injector" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

if (!(Test-Path $SrcPath)) {
    Write-Host "ERROR: src folder not found." -ForegroundColor Red
    return
}

$files = Get-ChildItem -Path $SrcPath -Recurse -File -Include *.ts,*.html,*.css,*.scss |
Where-Object {
    $_.FullName -notmatch "\\(node_modules|dist|\.angular|\.git|assets)\\"
}

if ($files.Count -eq 0) {
    Write-Host "No matching files found." -ForegroundColor Yellow
    return
}

$total = $files.Count
$count = 0
$added = 0
$updated = 0
$skipped = 0

foreach ($file in $files) {

    $count++
    Write-Progress -Activity "Injecting PATH comments" `
                   -Status "$count of $total" `
                   -PercentComplete ([int](($count/$total)*100))

    $rootResolved = (Resolve-Path $SrcPath).Path
    $relativePath = $file.FullName.Substring($rootResolved.Length + 1)

    # Determine comment style based on extension
    switch ($file.Extension.ToLower()) {
        ".ts"   { $expected = "// PATH: src/$relativePath" }
        ".css"  { $expected = "/* PATH: src/$relativePath */" }
        ".scss" { $expected = "/* PATH: src/$relativePath */" }
        ".html" { $expected = "<!-- PATH: src/$relativePath -->" }
        default { continue }
    }

    $raw = Get-Content $file.FullName -Raw
    $lines = $raw -split "`n"

    # Only inspect first 5 lines
    $topLimit = [Math]::Min(5, $lines.Count)
    $topBlock = ($lines[0..($topLimit-1)] -join "`n")

    # Generic PATH detection for any style
    $existingMatch = $topBlock -match 'PATH:\s*src/.*'

    if ($existingMatch) {

        if ($topBlock -match [regex]::Escape($expected)) {
            $skipped++
            continue
        }

        if ($ForceUpdate) {
            $newContent = $raw -replace 'PATH:\s*src/.*', ($expected -replace '^\S+\s*|\s*\S+$','')
            $newContent = $expected + "`n" + ($raw -replace '.*PATH:\s*src/.*','')
            if (-not $Preview) {
                Set-Content $file.FullName $newContent
            }
            $updated++
        }
        else {
            $skipped++
        }

    }
    else {

        $newContent = $expected + "`n" + $raw

        if (-not $Preview) {
            Set-Content $file.FullName $newContent
        }

        $added++
    }

    if ($Verbose) {
        Write-Host "$relativePath processed"
    }
}

Write-Progress -Activity "Injecting PATH comments" -Completed

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host " Injection Complete" -ForegroundColor Green
Write-Host " Files processed : $total" -ForegroundColor Green
Write-Host " Added           : $added" -ForegroundColor Green
Write-Host " Updated         : $updated" -ForegroundColor Green
Write-Host " Skipped         : $skipped" -ForegroundColor Green
Write-Host " Preview mode    : $Preview" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
