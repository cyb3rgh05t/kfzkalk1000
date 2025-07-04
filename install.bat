@echo off
echo.
echo ========================================
echo    KFZKalk1000 Installation
echo ========================================
echo.

echo Pruefe Node.js Installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js ist nicht installiert!
    echo.
    echo Bitte installieren Sie Node.js von: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js gefunden
echo.

echo Installiere NPM Pakete...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Fehler bei der NPM Installation
    pause
    exit /b 1
)

echo.
echo Richte Datenbank ein...
call node setup.js
if %errorlevel% neq 0 (
    echo ❌ Fehler beim Datenbank Setup
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Installation erfolgreich! 🎉
echo ========================================
echo.
echo Verwenden Sie "start.bat" um die Anwendung zu starten
echo.
pause