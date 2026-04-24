@echo off
setlocal enabledelayedexpansion

:: Chrome'un olası kurulum yolları
set "CHROME_PATHS[0]=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
set "CHROME_PATHS[1]=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
set "CHROME_PATHS[2]=%LocalAppData%\Google\Chrome\Application\chrome.exe"
set "CHROME_PATHS[3]=%ProgramW6432%\Google\Chrome\Application\chrome.exe"
set "CHROME_PATHS[4]=C:\Program Files\Google\Chrome\Application\chrome.exe"
set "CHROME_PATHS[5]=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

:: Chrome'u bul
set "CHROME_EXE="
for /L %%i in (0,1,5) do (
    if defined CHROME_PATHS[%%i] (
        if exist "!CHROME_PATHS[%%i]!" (
            set "CHROME_EXE=!CHROME_PATHS[%%i]!"
            goto :found
        )
    )
)

:: Chrome registry'den bulmayı dene
for /f "tokens=2*" %%a in ('reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" /ve 2^>nul') do set "CHROME_EXE=%%b"
if defined CHROME_EXE goto :found

for /f "tokens=2*" %%a in ('reg query "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" /ve 2^>nul') do set "CHROME_EXE=%%b"
if defined CHROME_EXE goto :found

:: Chrome bulunamadıysa hata ver
echo [ERROR] Chrome browser bulunamadi!
echo.
echo Lutfen Chrome'u kurdugunuzdan emin olun veya asagidaki yollardan birinde olsun:
echo   - %ProgramFiles%\Google\Chrome\Application\chrome.exe
echo   - %ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe
echo   - %LocalAppData%\Google\Chrome\Application\chrome.exe
echo.
pause
exit /b 1

:found
:: BAT dosyasının bulunduğu klasörü al
set "APP_DIR=%~dp0"
set "HTML_FILE=%APP_DIR%src/index.html"

:: HTML dosyasının varlığını kontrol et
if not exist "%HTML_FILE%" (
    echo [ERROR] index.html dosyasi bulunamadi!
    echo Beklenen konum: %HTML_FILE%
    echo.
    pause
    exit /b 1
)

:: Chrome'u app modunda başlat
echo [INFO] Chrome bulundu: %CHROME_EXE%
echo [INFO] Uygulama baslatiliyor: %HTML_FILE%
echo.

start "" "%CHROME_EXE%" --app="%HTML_FILE%" --window-size=900,700 --window-position=150,100 --resizable=0

:: Kısa bir gecikme ver ve çık
timeout /t 1 /nobreak >nul
exit