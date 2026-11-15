@echo off
@chcp 65001 >nul
setlocal enabledelayedexpansion
title ExpiryGo - Expo Go LAN
set EXPO_NO_TELEMETRY=1
cd /d "%~dp0"

for /f "tokens=*" %%i in ('node get_ip.cjs 2^>nul') do set LAN_IP=%%i
if "%LAN_IP%"=="" set LAN_IP=192.168.1.6

echo ============================================================
echo   EXPIRYGO - EXPO GO (LAN MODE: %LAN_IP%:8081)
echo ============================================================
echo.
echo Freeing port 8081 if occupied...
node clean_ports.cjs 2>nul

echo.
echo Starting Expo Go with LAN host...
echo Ensure your phone is connected to the same Wi-Fi (%LAN_IP%)!
echo.
cd mobile
set REACT_NATIVE_PACKAGER_HOSTNAME=%LAN_IP%
npx expo start --go --host lan -c
pause
