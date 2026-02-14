#!/usr/bin/env pwsh
# TimeTag Development Server Launcher

$Host.UI.RawUI.WindowTitle = "TimeTag Development"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Starting TimeTag Development" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to script directory
Set-Location $PSScriptRoot

# Check Node.js
Write-Host "[1/2] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  [OK] Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Node.js not found!" -ForegroundColor Red
    Write-Host "  Please install from https://nodejs.org/" -ForegroundColor Gray
    pause
    exit 1
}
Write-Host ""

# Start development server
Write-Host "[2/2] Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "TIP: The Electron window will open automatically" -ForegroundColor Gray
Write-Host "TIP: Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

npm run dev
