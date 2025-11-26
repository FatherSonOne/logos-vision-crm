@echo off
echo ====================================
echo   LOGOS VISION CRM - Starting...
echo ====================================
echo.
echo Checking if API key is set...
findstr /C:"PLACEHOLDER_API_KEY" .env.local >nul
if %errorlevel%==0 (
    echo.
    echo WARNING: API key not set!
    echo Please edit .env.local and add your Gemini API key
    echo Get one at: https://aistudio.google.com/app/apikey
    echo.
    pause
    exit
)

echo API key found!
echo.
echo Starting development server...
echo Your CRM will open at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
npm run dev
