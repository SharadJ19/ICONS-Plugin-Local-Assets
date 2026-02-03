# ================================
# Angular Module Federation Exporter
# ================================
Clear-Host
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " Angular MF Context Exporter for LLMs" -ForegroundColor Cyan
Write-Host " Clean state initialized" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# ================================
# Config
# ================================
$rootPath = Get-Location
$outputFile = "angular-mf-export.txt"

# Folders to include
$foldersToInclude = @(
    "src",
    "projects"       # optional, safe for libraries / plugins
)

# Root-level files to include
$rootFiles = @(
    "angular.json",
    "package.json",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.base.json",
    "webpack.config.js",
    "webpack.prod.js",
    "module-federation.config.js"
)

# File extensions to include
$extensions = @(
    "*.ts",
    "*.html",
    "*.scss",
    "*.css",
    "*.json",
    "*.js"
)

# ================================
# Collect files
# ================================
$files = @()

foreach ($folder in $foldersToInclude) {
    if (Test-Path $folder) {
        $files += Get-ChildItem -Path $folder -Recurse -File -Include $extensions
    }
}

foreach ($file in $rootFiles) {
    if (Test-Path $file) {
        $files += Get-Item $file
    }
}

$files = $files | Sort-Object FullName
$total = $files.Count

if ($total -eq 0) {
    Write-Host "No files found to export." -ForegroundColor Red
    exit
}

Write-Host "Found $total files. Exporting..." -ForegroundColor Yellow
Write-Host ""

# ================================
# Process files
# ================================
$builder = New-Object System.Text.StringBuilder
$counter = 0

foreach ($file in $files) {
    $counter++
    $percent = [int](($counter / $total) * 100)

    Write-Progress -Activity "Exporting Angular MF context" `
                   -Status "$counter of $total ($percent%)" `
                   -PercentComplete $percent

    $relativePath = $file.FullName.Replace($rootPath.Path + "\", "")

    $builder.AppendLine("====================================") | Out-Null
    $builder.AppendLine("// FILE: $relativePath") | Out-Null
    $builder.AppendLine("====================================") | Out-Null

    $content = Get-Content $file.FullName -Raw
    $builder.AppendLine($content) | Out-Null
    $builder.AppendLine("`n") | Out-Null
}

# ================================
# Output
# ================================
$finalText = $builder.ToString()
$finalText | Set-Content $outputFile -Encoding UTF8
Set-Clipboard -Value $finalText

Write-Progress -Activity "Exporting Angular MF context" -Completed
Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host " Export completed successfully" -ForegroundColor Green
Write-Host " Output file: $outputFile" -ForegroundColor Green
Write-Host " Copied to clipboard (LLM-ready)" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
