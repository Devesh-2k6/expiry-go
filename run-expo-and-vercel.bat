@echo off
@chcp 65001 >nul
setlocal enabledelayedexpansion
title ExpiryGo - Expo Go and Vercel Synchronizer
set EXPO_NO_TELEMETRY=1
cd /d "%~dp0"

echo ============================================================
echo   EXPIRYGO - EXPO GO + VERCEL PRODUCTION LAUNCHER
echo ============================================================
echo.
echo [1/3] Detecting local Wi-Fi IP and syncing configuration...
for /f "tokens=*" %%i in ('node get_ip.cjs 2^>nul') do set LAN_IP=%%i
if "%LAN_IP%"=="" set LAN_IP=192.168.1.6
echo       Active LAN IP:   %LAN_IP%
echo       Vercel Live URL: https://expirygo.vercel.app
echo.

echo [2/3] Freeing Port 8081 if occupied...
node clean_ports.cjs 2>nul
echo.

echo [3/3] Opening Vercel Production Web App in your browser...
start https://expirygo.vercel.app
start https://expirygo.vercel.app/mobile
echo.

echo ============================================================
echo Select Expo Go Connection Mode:
echo   [1] Tunnel Mode (RECOMMENDED - Worldwide access on any Wi-Fi or cellular)
echo   [2] LAN Mode    (Fastest - Phone must be connected to same Wi-Fi: %LAN_IP%)
echo   [3] Web Mode    (Run Mobile App in PC browser side-by-side with Vercel)
echo ============================================================
echo.

set MODE=%1
if not "%MODE%"=="" goto RUN_MODE

choice /C 123 /N /T 6 /D 1 /M "Select mode [1=Tunnel, 2=LAN, 3=Web] (Auto-defaults to 1 in 6s): "
if errorlevel 3 set MODE=web
if errorlevel 2 if not "!MODE!"=="web" set MODE=lan
if errorlevel 1 if not "!MODE!"=="web" if not "!MODE!"=="lan" set MODE=tunnel

:RUN_MODE
if /i "%MODE%"=="1" set MODE=tunnel
if /i "%MODE%"=="2" set MODE=lan
if /i "%MODE%"=="3" set MODE=web

cd mobile
if /i "%MODE%"=="web" (
    echo.
    echo Starting Expo Mobile in Web Mode at http://localhost:8081...
    echo.
    npx expo start --web
) else if /i "%MODE%"=="lan" (
    echo.
    echo Starting Expo Go in LAN Mode on exp://%LAN_IP%:8081...
    echo.
    set REACT_NATIVE_PACKAGER_HOSTNAME=%LAN_IP%
    npx expo start --go --host lan -c
) else (
    echo.
    echo Starting Expo Go in TUNNEL Mode - Worldwide Access...
    echo.
    npx expo start --go --tunnel ngrok -c
)

pause
