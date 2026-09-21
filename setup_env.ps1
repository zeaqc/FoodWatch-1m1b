# FoodWatch - Environment Variables Setup Script
Write-Host "🌱 Setting up FoodWatch Environment Variables & Directories..." -ForegroundColor Green

$projectRoot = $PSScriptRoot
if (-not $projectRoot) { $projectRoot = Get-Location }

node "$projectRoot\setup_env.js"
