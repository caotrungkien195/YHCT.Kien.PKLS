@echo off
chcp 65001 >nul
cd /d "%~dp0"
title YHCT API Server - Phong kham Lam Son

echo.
echo ========================================
echo   Khoi dong YHCT API Server
echo ========================================
echo.
echo   Thu muc: %cd%
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [LOI] Chua cai Node.js hoac chua co trong PATH.
    echo Tai ban LTS tai: https://nodejs.org
    echo.
    pause
    exit /b 1
)

if not exist "server.js" (
    echo [LOI] Khong thay server.js trong thu muc nay.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules\express" (
    echo [1/2] Dang cai package...
    call npm install
    if errorlevel 1 (
        echo Cai dat that bai.
        pause
        exit /b 1
    )
) else (
    echo [1/2] Package da san sang.
)

echo [2/2] Dang chay server...
echo.
echo   Base URL trong app:  http://localhost:3000
echo   De TAT server: nhan Ctrl+C
echo ========================================
echo.

node server.js

echo.
echo Server da dung.
pause