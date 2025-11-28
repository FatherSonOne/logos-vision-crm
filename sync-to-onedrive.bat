@echo off
REM ========================================
REM Logos Vision CRM - OneDrive Sync Script
REM ========================================
REM
REM This script syncs your OneDrive copy with the latest changes from GitHub
REM Run this anytime you want to get the latest updates!
REM

echo.
echo ====================================
echo   Logos Vision CRM - Sync Tool
echo ====================================
echo.

REM Set the OneDrive path
set ONEDRIVE_PATH=C:\Users\Aegis{FM}\Onedrive\Documents\logos-vision-crm
set GITHUB_REPO=https://github.com/FatherSonOne/logos-vision-crm.git
set BRANCH=claude/backup-repo-onedrive-0171kP3Mk3qsh9oHbjn4pkzX

echo Checking if OneDrive directory exists...
if exist "%ONEDRIVE_PATH%" (
    echo [OK] Found existing directory
    echo.
    echo Updating from GitHub...
    cd /d "%ONEDRIVE_PATH%"

    REM Fetch latest changes
    git fetch origin %BRANCH%

    REM Show what will change
    echo.
    echo Changes available:
    git log HEAD..origin/%BRANCH% --oneline

    echo.
    echo Pulling latest changes...
    git pull origin %BRANCH%

    echo.
    echo [SUCCESS] OneDrive copy is now up to date!

) else (
    echo [INFO] OneDrive directory not found. Setting up for first time...
    echo.

    REM Create parent directory if needed
    if not exist "C:\Users\Aegis{FM}\Onedrive\Documents\" (
        mkdir "C:\Users\Aegis{FM}\Onedrive\Documents\"
    )

    cd /d "C:\Users\Aegis{FM}\Onedrive\Documents\"

    echo Cloning from GitHub...
    git clone %GITHUB_REPO%

    cd logos-vision-crm

    echo Checking out working branch...
    git checkout %BRANCH%

    echo.
    echo [SUCCESS] OneDrive copy created and synced!
)

echo.
echo Current status:
cd /d "%ONEDRIVE_PATH%"
git status
git log -1 --oneline

echo.
echo ====================================
echo   Sync Complete!
echo ====================================
echo.
echo Your OneDrive copy is now synced with GitHub.
echo Run this script anytime to get the latest updates!
echo.
pause
