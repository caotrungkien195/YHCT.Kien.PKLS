@echo off
chcp 65001 >nul
title Phong Kham Lam Son - Chia Gio
cd /d "%~dp0"

set "HTML=%~dp0app\index.html"
if not exist "%HTML%" (
  echo Khong tim thay app\index.html
  pause
  exit /b 1
)

set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE%" (
  start "" "%EDGE%" --app="file:///%HTML:\=/%" --disable-extensions
  exit /b 0
)

set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if exist "%CHROME%" (
  start "" "%CHROME%" --app="file:///%HTML:\=/%" --disable-extensions
  exit /b 0
)

start "" "%HTML%"
