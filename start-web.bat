@echo off
setlocal enabledelayedexpansion
title Meeva Web Ecosystem (Backend + Frontend)
echo ============================================================
echo   🚀 MEEVA - FULL-STACK WEB LAUNCHER (FRONTEND + BACKEND)
echo ============================================================
echo.

:: 1. Auto-detect Wi-Fi / Local LAN IP
for /f "tokens=*" %%i in ('node get_ip.cjs 2^>nul') do set LAN_IP=%%i
if "%LAN_IP%"=="" (
    for /f "tokens=*" %%i in ('python get_ip.py 2^>nul') do set LAN_IP=%%i
)
if "%LAN_IP%"=="" (
    set LAN_IP=172.23.27.186
)

echo [Network Detection]
echo   • Localhost:       http://localhost:3000
echo   • Wi-Fi / LAN IP:  http://%LAN_IP%:3000
echo   • Backend API:     http://localhost:8000
echo   • API Swagger:     http://localhost:8000/docs
echo.

:: 2. Clean Ports
node clean_ports.cjs 2>nul

:: 3. Start Backend FastAPI Server
echo [1/2] Starting FastAPI Backend Server on port 8000...
start "Meeva Backend API (Port 8000)" cmd /k "title Meeva Backend API && cd backend && python run_server.py"
echo.

:: 4. Start Web Server
echo [2/2] Starting Web Server on port 3000...
start "Meeva Web Frontend (Port 3000)" cmd /k "title Meeva Web Frontend && node serve_web.cjs"
echo.

:: 5. Open Web Browser
timeout /t 2 /nobreak >nul
start http://localhost:3000/auth

echo ============================================================
echo   ✅ SUCCESS! Application is Live:
echo.
echo   🌐 Web Auth:        http://localhost:3000/auth
echo   📱 Mobile Devices:  http://%LAN_IP%:3000/mobile
echo   🔌 Backend API:     http://localhost:8000
echo   📖 API Docs:        http://localhost:8000/docs
echo ============================================================
echo.
pause
