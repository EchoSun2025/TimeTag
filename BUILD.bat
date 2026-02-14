@echo off
chcp 65001 > nul
title TimeTag - Build Production

echo.
echo ========================================
echo    Building TimeTag
echo ========================================
echo.

cd /d "%~dp0"

echo Select build target:
echo.
echo 1. Windows Portable (Recommended)
echo 2. Linux AppImage
echo 3. Both Windows and Linux
echo.

set /p choice="Enter choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo Building Windows Portable...
    npm run build:win
) else if "%choice%"=="2" (
    echo.
    echo Building Linux AppImage...
    npm run build:linux
) else if "%choice%"=="3" (
    echo.
    echo Building for both platforms...
    npm run build:all
) else (
    echo Invalid choice!
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Build Complete!
echo ========================================
echo.
echo Output location: dist/
echo.

pause
