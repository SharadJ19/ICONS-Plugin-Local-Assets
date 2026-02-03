# ================================
# Clean state acknowledgement
# ================================
Clear-Host
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " Angular CSS/HTML Exporter for LLMs" -ForegroundColor Cyan
Write-Host " Clean state initialized" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# ================================
# Config
# ================================
$srcPath = "src"
$outputFile = "angular-css-html-export.txt"

# ONLY component CSS + HTML
$extensions = @(
    "*.component.css",
    "*.component.html"
)

# ================================
# Validation
# ================================
if (!(Test-Path $srcPath)) {
    Write-Host "ERROR: src folder not found!" -ForegroundColor Red
    exit
}

# ================================
# Collect files
# ================================
$files = Get-ChildItem -Path $srcPath -Recurse -File -Include $extensions
$total = $files.Count

if ($total -eq 0) {
    Write-Host "No component CSS/HTML files found." -ForegroundColor Yellow
    exit
}

Write-Host "Found $total component CSS/HTML files. Processing..." -ForegroundColor Yellow
Write-Host ""

# ================================
# Process files with progress
# ================================
$counter = 0
$builder = New-Object System.Text.StringBuilder
$srcRoot = (Resolve-Path $srcPath).Path

foreach ($file in $files) {
    $counter++

    $percent = [int](($counter / $total) * 100)
    Write-Progress -Activity "Exporting component CSS/HTML" `
                   -Status "$counter of $total ($percent%)" `
                   -PercentComplete $percent

    # Relative path
    $relativePath = $file.FullName.Substring($srcRoot.Length + 1)

    # Header
    $builder.AppendLine("====================================") | Out-Null
    $builder.AppendLine("// PATH: src/$relativePath") | Out-Null
    $builder.AppendLine("====================================") | Out-Null

    # File content
    $content = Get-Content $file.FullName -Raw
    $builder.AppendLine($content) | Out-Null
    $builder.AppendLine("`n") | Out-Null
}

# ================================
# Output
# ================================
$finalText = $builder.ToString()

# Save to file
$finalText | Set-Content $outputFile -Encoding UTF8

# Copy to clipboard
Set-Clipboard -Value $finalText

# ================================
# Done
# ================================

Write-Progress -Activity "Exporting component CSS/HTML" -Completed
Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host " Export completed successfully" -ForegroundColor Green
Write-Host " Output file: $outputFile" -ForegroundColor Green
Write-Host " Content copied to clipboard" -ForegroundColor Green
Write-Host " Ready to paste into ChatGPT / LLM" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green