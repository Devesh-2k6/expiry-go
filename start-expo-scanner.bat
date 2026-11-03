@echo off
setlocal enabledelayedexpansion
title Meeva - Expo Go Scanner Launcher
echo ============================================================
echo   📱 MEEVA - EXPO GO SCANNER & MOBILE APP LAUNCHER
echo ============================================================
echo.

:: 1. Auto-detect Wi-Fi IP
for /f "tokens=*" %%i in ('node get_ip.cjs 2^>nul') do set LAN_IP=%%i
if "%LAN_IP%"=="" (
    for /f "tokens=*" %%i in ('python get_ip.py 2^>nul') do set LAN_IP=%%i
)
if "%LAN_IP%"=="" (
    set LAN_IP=172.23.27.186
)

echo [Detected Active Wi-Fi IP]: %LAN_IP%
echo.

:: 2. Clean Port 8081
echo [Ensuring Port 8081 is free]...
node clean_ports.cjs 2>nul
echo.

:: 3. Open Web Scanner Companion
echo [Opening Mobile & Scanner Hub in Browser]...
start http://localhost:3000/mobile 2>nul

:: 4. Start Expo Go Metro Server with QR Code
echo.
echo ============================================================
echo   Starting Expo Go Metro Server on exp://%LAN_IP%:8081
echo   Scan the QR code below with:
echo     - Android: Expo Go app -> Scan QR Code
echo     - iOS: Camera app -> Tap 'Open in Expo Go'
echo ============================================================
echo.

cd mobile
set REACT_NATIVE_PACKAGER_HOSTNAME=%LAN_IP%
npx expo start --go --host lan -c
pause

