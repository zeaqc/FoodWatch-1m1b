@echo off
echo ========================================================
echo   FoodWatch - Zero Hunger Surplus Redistribution Platform
echo ========================================================
echo.

cd platform

echo [1/3] Checking environment files...
if not exist "server\.env" (
    echo Creating server\.env from .env.example...
    copy server\.env.example server\.env >nul
)
if not exist "client\.env" (
    echo Creating client\.env from .env.example...
    copy client\.env.example client\.env >nul
)

echo [2/3] Checking dependencies...
if not exist "node_modules" (
    echo Installing platform dependencies...
    call npm install
)
if not exist "server\node_modules" (
    echo Installing server dependencies...
    cd server && call npm install && cd ..
)
if not exist "client\node_modules" (
    echo Installing client dependencies...
    cd client && call npm install && cd ..
)

echo.
echo [3/3] Launching FoodWatch Platform (Client ^& Server)...
echo   - Client: http://localhost:3000
echo   - Server: http://localhost:5000
echo.
call npm run dev
pause
