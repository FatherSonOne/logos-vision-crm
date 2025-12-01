@echo off
REM ============================================
REM GitHub Push Script for Logos Vision CRM
REM ============================================

echo.
echo ============================================
echo  Logos Vision CRM - GitHub Push
echo ============================================
echo.

REM Get the current directory
cd /d "%~dp0"

REM Check if there are changes to commit
echo Checking for changes...
git status

echo.
echo ============================================
echo  Step 1: Add all changes
echo ============================================
git add .

echo.
echo ============================================
echo  Step 2: Commit changes
echo ============================================
set /p commit_message="Enter your commit message: "
git commit -m "%commit_message%"

echo.
echo ============================================
echo  Step 3: Push to main branch
echo ============================================
git push origin main

echo.
echo ============================================
echo  Push Complete!
echo ============================================
echo.
echo Your changes have been pushed to GitHub!
echo Repository: https://github.com/FatherSonOne/logos-vision-crm
echo.

pause
