@echo off
chcp 65001 > nul
title TimeTag - Quick Git Commit

echo.
echo ========================================
echo    Quick Git Commit
echo ========================================
echo.

cd /d "%~dp0"

echo Current changes:
echo.
git status -s
echo.

set /p message="Enter commit message: "

if "%message%"=="" (
    echo ERROR: Commit message cannot be empty
    pause
    exit /b 1
)

echo.
echo [1/3] Adding files...
git add .

echo [2/3] Committing...
git commit -m "%message%"

echo [3/3] Pushing to GitHub...
git push

echo.
echo ========================================
echo    Done!
echo ========================================
echo.

pause
