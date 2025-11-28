@echo off
REM ========================================
REM Logos Vision CRM - Development Server
REM ========================================

echo.
echo ====================================
echo   Starting Logos Vision CRM
echo ====================================
echo.

REM Set the OneDrive path
set PROJECT_PATH=C:\Users\Aegis{FM}\Onedrive\Documents\logos-vision-crm

echo Navigating to project directory...
cd /d "%PROJECT_PATH%"

REM Check if node_modules exists
if not exist "node_modules\" (
    echo.
    echo [INFO] First time setup detected...
    echo Installing dependencies... (this may take 1-2 minutes)
    echo.
    npm install
    echo.
    echo [SUCCESS] Dependencies installed!
    echo.
)

echo Starting development server...
echo.
echo ====================================
echo   Server will start shortly...
echo   Look for: http://localhost:5173/
echo ====================================
echo.
echo Once you see the URL above, open it in your browser!
echo.
echo Press Ctrl+C to stop the server when done.
echo.

REM Start the dev server
npm run dev
