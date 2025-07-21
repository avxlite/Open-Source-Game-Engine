@echo off
cd /d "%~dp0"

start "" cmd /k "npx http-server"

timeout /t 2 >nul

start chrome "http://localhost:8080/index.html"
