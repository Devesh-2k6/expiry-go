@echo off
setlocal enabledelayedexpansion

title Meeva / ExpiryGo - Android Gradle Build for Deployment

echo ======================================================================
echo    EXPIRYGO / MEEVA - ANDROID GRADLE DEPLOYMENT BUILD TOOL
echo ======================================================================
echo.

:: 1. Detect or configure JAVA_HOME
if defined JAVA_HOME (
    echo [OK] Using JAVA_HOME: %JAVA_HOME%
) else if exist "C:\Program Files\Android\Android Studio\jbr" (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
    set "PATH=%JAVA_HOME%\bin;!PATH!"
    echo [OK] Auto-detected Android Studio JBR: %JAVA_HOME%
) else if exist "C:\Program Files\Java\jdk-21" (
    set "JAVA_HOME=C:\Program Files\Java\jdk-21"
    set "PATH=%JAVA_HOME%\bin;!PATH!"
    echo [OK] Auto-detected JDK: %JAVA_HOME%
) else if exist "C:\Program Files\Java\jdk-17" (
    set "JAVA_HOME=C:\Program Files\Java\jdk-17"
    set "PATH=%JAVA_HOME%\bin;!PATH!"
    echo [OK] Auto-detected JDK: %JAVA_HOME%
) else (
    echo [!] ERROR: JAVA_HOME is not set and no JDK was found in standard locations.
    echo Please install JDK 17/21 or Android Studio.
    pause
    exit /b 1
)

:: 2. Detect or configure ANDROID_HOME
if defined ANDROID_HOME (
    echo [OK] Using ANDROID_HOME: %ANDROID_HOME%
) else if exist "%LOCALAPPDATA%\Android\Sdk" (
    set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
    echo [OK] Auto-detected Android SDK: %ANDROID_HOME%
) else if exist "C:\Users\%USERNAME%\AppData\Local\Android\Sdk" (
    set "ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
    echo [OK] Auto-detected Android SDK: %ANDROID_HOME%
) else (
    echo [!] WARNING: Android SDK location could not be determined automatically.
)

:: 3. Ensure local.properties exists in mobile\android
if defined ANDROID_HOME (
    set "SDK_DIR_ESCAPED=%ANDROID_HOME:\=\\%"
    if not exist "mobile\android\local.properties" (
        echo sdk.dir=!SDK_DIR_ESCAPED!> "mobile\android\local.properties"
        echo [OK] Created mobile\android\local.properties
    )
)

:: 4. Verify Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] ERROR: Node.js was not found in PATH. Please install Node.js.
    pause
    exit /b 1
)

:: 5. Action Selection
set "ACTION=%~1"

if "%ACTION%"=="" (
    echo.
    echo Select an action:
    echo   [1] Build Release APK  - Direct install / Testing / Sideloading (assembleRelease)
    echo   [2] Build Release AAB  - Google Play Console Store Release (bundleRelease)
    echo   [3] Generate Release Keystore (for Play Store production signing)
    echo   [4] Clean Gradle Project (clean)
    echo.
    set /p "CHOICE=Enter choice [1-4, default 1]: "
    if "!CHOICE!"=="" set "CHOICE=1"
    if "!CHOICE!"=="1" set "ACTION=apk"
    if "!CHOICE!"=="2" set "ACTION=aab"
    if "!CHOICE!"=="3" set "ACTION=keystore"
    if "!CHOICE!"=="4" set "ACTION=clean"
)

:: Handle Keystore generation
if /i "%ACTION%"=="keystore" (
    echo.
    echo ======================================================================
    echo   Generating Production Release Keystore (release.keystore)
    echo ======================================================================
    if exist "mobile\android\app\release.keystore" (
        echo.
        echo [!] release.keystore already exists at mobile\android\app\release.keystore
        echo To avoid overwriting your production keys, delete it first if you want a fresh one.
        pause
        exit /b 0
    )
    
    cd mobile\android\app
    "%JAVA_HOME%\bin\keytool.exe" -genkeypair -v -storetype PKCS12 -keystore release.keystore -alias expirygo -keyalg RSA -keysize 2048 -validity 10000 -storepass expirygo -keypass expirygo -dname "CN=ExpiryGo App, OU=Mobile, O=ExpiryGo, L=New Delhi, ST=Delhi, C=IN"
    cd ..\..
    
    echo.
    echo [OK] Release Keystore created at mobile\android\app\release.keystore
    echo Password: expirygo
    echo Alias:    expirygo
    echo.
    echo (You can edit passwords and alias anytime in mobile\android\gradle.properties)
    pause
    exit /b 0
)

:: Handle Clean
if /i "%ACTION%"=="clean" (
    echo.
    echo ======================================================================
    echo   Cleaning Gradle Android Project
    echo ======================================================================
    cd mobile\android
    call gradlew.bat clean
    cd ..\..
    echo [OK] Clean completed.
    pause
    exit /b 0
)

:: Handle APK Build
if /i "%ACTION%"=="apk" (
    echo.
    echo ======================================================================
    echo   Building Production Release APK (assembleRelease)
    echo ======================================================================
    echo Starting Gradle build... This bundles JS code and native Android code.
    echo.
    
    cd mobile\android
    call gradlew.bat assembleRelease
    set "BUILD_STATUS=!errorlevel!"
    cd ..\..
    
    echo.
    if !BUILD_STATUS! equ 0 (
        echo ======================================================================
        echo   BUILD SUCCESSFUL! 🎉
        echo ======================================================================
        echo.
        echo Your release APK is ready:
        echo   mobile\android\app\build\outputs\apk\release\app-release.apk
        echo.
        if exist "mobile\android\app\build\outputs\apk\release\app-release.apk" (
            explorer /select,"mobile\android\app\build\outputs\apk\release\app-release.apk"
        )
    ) else (
        echo ======================================================================
        echo   BUILD FAILED (Exit Code !BUILD_STATUS!)
        echo ======================================================================
        echo Check the Gradle error messages above.
    )
    pause
    exit /b !BUILD_STATUS!
)

:: Handle AAB Build
if /i "%ACTION%"=="aab" (
    echo.
    echo ======================================================================
    echo   Building Production Release AAB Bundle (bundleRelease)
    echo ======================================================================
    echo Starting Gradle build for Google Play Console bundle...
    echo.
    
    cd mobile\android
    call gradlew.bat bundleRelease
    set "BUILD_STATUS=!errorlevel!"
    cd ..\..
    
    echo.
    if !BUILD_STATUS! equ 0 (
        echo ======================================================================
        echo   BUILD SUCCESSFUL! 🎉
        echo ======================================================================
        echo.
        echo Your release AAB (Android App Bundle) is ready for Google Play:
        echo   mobile\android\app\build\outputs\bundle\release\app-release.aab
        echo.
        if exist "mobile\android\app\build\outputs\bundle\release\app-release.aab" (
            explorer /select,"mobile\android\app\build\outputs\bundle\release\app-release.aab"
        )
    ) else (
        echo ======================================================================
        echo   BUILD FAILED (Exit Code !BUILD_STATUS!)
        echo ======================================================================
        echo Check the Gradle error messages above.
    )
    pause
    exit /b !BUILD_STATUS!
)

echo Unknown action: %ACTION%
pause
exit /b 1

