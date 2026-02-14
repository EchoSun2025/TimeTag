#!/usr/bin/env pwsh
# Quick Git Commit and Push

$Host.UI.RawUI.WindowTitle = "TimeTag - Git Commit"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Quick Git Commit" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot

# Show current changes
Write-Host "Current changes:" -ForegroundColor Yellow
Write-Host ""
git status -s
Write-Host ""

# Get commit message
$message = Read-Host "Enter commit message"

if ([string]::IsNullOrWhiteSpace($message)) {
    Write-Host ""
    Write-Host "[ERROR] Commit message cannot be empty" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "[1/3] Adding files..." -ForegroundColor Yellow
git add .

Write-Host "[2/3] Committing..." -ForegroundColor Yellow
git commit -m $message

Write-Host "[3/3] Pushing to GitHub..." -ForegroundColor Yellow
git push

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Done!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

pause
