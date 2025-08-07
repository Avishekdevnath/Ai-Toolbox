@echo off
echo Clearing all Node.js processes...
taskkill /f /im node.exe >nul 2>&1

echo Waiting for ports to clear...
timeout /t 2 /nobreak >nul

echo Checking ports 3000, 3001, 3002...
netstat -ano | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo Port 3000 is still in use, killing process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1
)

netstat -ano | findstr :3001 >nul 2>&1
if %errorlevel% equ 0 (
    echo Port 3001 is still in use, killing process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do taskkill /f /pid %%a >nul 2>&1
)

netstat -ano | findstr :3002 >nul 2>&1
if %errorlevel% equ 0 (
    echo Port 3002 is still in use, killing process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002') do taskkill /f /pid %%a >nul 2>&1
)

echo All ports cleared!
echo Starting development server...
npm run dev 