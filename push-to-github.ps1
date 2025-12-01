# Logos Vision CRM - GitHub Push Script
# This script commits and pushes all changes to the main branch

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Logos Vision CRM - GitHub Push" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "ERROR: Not a git repository!" -ForegroundColor Red
    Write-Host "Please run 'git init' first or navigate to your project directory." -ForegroundColor Yellow
    exit 1
}

# Show current status
Write-Host "Current Git Status:" -ForegroundColor Yellow
git status
Write-Host ""

# Ask for commit message
$commitMessage = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

Write-Host ""
Write-Host "Adding all changes..." -ForegroundColor Green
git add .

Write-Host "Committing changes..." -ForegroundColor Green
git commit -m "$commitMessage"

Write-Host "Pushing to main branch..." -ForegroundColor Green
git push origin main

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Push completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
