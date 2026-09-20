@echo off
setlocal

:: Check if git is available in PATH or common install directories
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if exist "C:\Program Files\Git\cmd\git.exe" set "PATH=C:\Program Files\Git\cmd;%PATH%"
    if exist "%LOCALAPPDATA%\Programs\Git\cmd\git.exe" set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%PATH%"
    if exist "C:\Program Files (x86)\Git\cmd\git.exe" set "PATH=C:\Program Files (x86)\Git\cmd;%PATH%"
)

where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo =======================================================
    echo  [ERROR] Git is not installed on this computer!
    echo =======================================================
    echo.
    echo To install Git quickly:
    echo 1. Open PowerShell and run:
    echo      winget install --id Git.Git -e --source winget
    echo.
    echo 2. Or download the installer from:
    echo      https://git-scm.com/download/win
    echo.
    echo After installing, close and reopen your terminal/window,
    echo then run this script again.
    echo =======================================================
    echo.
    pause
    exit /b 1
)

echo [1/4] Initializing Git repository...
git init -b main

echo [2/4] Staging project files...
git add .

echo [3/4] Committing project files...
git commit -m "Initial commit: FoodWatch SDG 2 Zero Hunger Surplus Food Platform"

echo [4/4] Setting remote and pushing to https://github.com/zeaqc/FoodWatch-1m1b.git ...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/zeaqc/FoodWatch-1m1b.git
git push -u origin main

echo.
echo =======================================================
echo  Finished pushing to GitHub!
echo =======================================================
pause
