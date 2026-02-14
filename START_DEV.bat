@echo off
chcp 65001 > nul
title TimeTag Development Server

echo.
echo ========================================
echo    Starting TimeTag Development
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] Checking Node.js...
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo OK Node.js is installed
echo.

echo [2/2] Starting development server...
echo.
echo TIP: The Electron window will open automatically
echo TIP: Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

npm run dev

pause
