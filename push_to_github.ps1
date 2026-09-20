# Set error action preference
$ErrorActionPreference = "Continue"

# Try to find git if not in PATH
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    $commonGitPaths = @(
        "C:\Program Files\Git\cmd\git.exe",
        "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe",
        "C:\Program Files (x86)\Git\cmd\git.exe"
    )
    foreach ($p in $commonGitPaths) {
        if (Test-Path $p) {
            $gitDir = Split-Path -Parent $p
            $env:Path = "$gitDir;$env:Path"
            Write-Host "Found Git at $p and added to session PATH." -ForegroundColor Yellow
            break
        }
    }
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host ""
    Write-Host "❌ Git is not installed on this computer." -ForegroundColor Red
    Write-Host "To install Git, run this in PowerShell:" -ForegroundColor Yellow
    Write-Host "   winget install --id Git.Git -e --source winget" -ForegroundColor Cyan
    Write-Host "Or download the installer from:" -ForegroundColor Yellow
    Write-Host "   https://git-scm.com/download/win" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "After installing, close and reopen your terminal, then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "🌾 Initializing Git repository..." -ForegroundColor Green
git init -b main

Write-Host "📦 Adding files to staging..." -ForegroundColor Green
git add .

Write-Host "📝 Committing project files..." -ForegroundColor Green
git commit -m "Initial commit: FoodWatch SDG 2 Zero Hunger Surplus Food Platform"

Write-Host "🔗 Configuring remote repository (FoodWatch-1m1b)..." -ForegroundColor Green
git remote remove origin 2>$null
git remote add origin https://github.com/zeaqc/FoodWatch-1m1b.git

Write-Host "🚀 Pushing to https://github.com/zeaqc/FoodWatch-1m1b.git ..." -ForegroundColor Cyan
git push -u origin main

Write-Host ""
Write-Host "🎉 Successfully pushed to GitHub!" -ForegroundColor Green
