@echo off
REM ========================================
REM Create .env file for Supabase
REM ========================================

echo.
echo ====================================
echo   Creating .env file
echo ====================================
echo.

cd /d "%~dp0"

echo Creating .env file with your Supabase credentials...

(
echo # Supabase Configuration
echo VITE_SUPABASE_URL=https://psjgmdnrehcwvppbeqjy.supabase.co
echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzamdtZG5yZWhjd3ZwcGJlcWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NzU4OTksImV4cCI6MjA3OTE1MTg5OX0.IiB4YY9sB0fvEb6Vpm2O_t2YBQ9ORSy-yXtMsnOxZ4Q
) > .env

echo.
echo [SUCCESS] .env file created!
echo.
echo Your Supabase credentials have been configured.
echo.
echo ====================================
echo   Next Steps:
echo ====================================
echo.
echo 1. Set up database tables in Supabase
echo    - Open: https://psjgmdnrehcwvppbeqjy.supabase.co
echo    - Go to SQL Editor
echo    - Run the SQL from SUPABASE_QUICK_SETUP.sql
echo.
echo 2. Run the migration to populate data:
echo    npx tsx migrateProjectsActivities.ts
echo.
echo 3. Start your dev server:
echo    npm run dev
echo.
echo ====================================
echo.
pause
