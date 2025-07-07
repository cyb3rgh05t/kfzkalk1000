@echo off
echo ========================================
echo    KFZKalk1000 Installation
echo ========================================
echo.
echo Installiere NPM Pakete...
call npm install
echo.
echo Setup ausfuehren...
call node setup.js
echo.
echo Installation abgeschlossen!
pause