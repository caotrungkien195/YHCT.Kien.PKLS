@echo off
chcp 65001 >nul
title Dong goi EXE - Chia Gio Lam Son
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo Chua cai Node.js. Tai tai: https://nodejs.org/
  pause
  exit /b 1
)

echo [1/2] Cai dat Electron...
call npm install --no-fund --no-audit
if errorlevel 1 (
  echo Loi npm install
  pause
  exit /b 1
)

echo [2/2] Dong goi file EXE portable...
call npm run dist
if errorlevel 1 (
  echo Loi dong goi
  pause
  exit /b 1
)

echo.
echo XONG! File EXE o thu muc dist\
dir /b dist\*.exe 2>nul
echo.
pause
