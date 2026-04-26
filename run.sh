#!/bin/bash

# Hem macOS hem de Linux'te çalışan evrensel versiyon

echo "========================================"
echo "   FollowUp Pro Application Launcher"
echo "========================================"
echo ""

# Script dizinini al
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HTML_FILE="$SCRIPT_DIR/src/index.html"

if [[ ! -f "$HTML_FILE" ]]; then
    HTML_FILE="$SCRIPT_DIR/index.html"
    if [[ ! -f "$HTML_FILE" ]]; then
        echo "❌ index.html not found!"
        exit 1
    fi
fi

# İşletim sistemini tespit et
OS="$(uname)"
CHROME_CMD=""

if [[ "$OS" == "Darwin" ]]; then
    # macOS
    if [[ -f "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]]; then
        CHROME_CMD="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    elif [[ -f "/Applications/Chromium.app/Contents/MacOS/Chromium" ]]; then
        CHROME_CMD="/Applications/Chromium.app/Contents/MacOS/Chromium"
    else
        echo "❌ Chrome/Chromium not found!"
        exit 1
    fi
    echo "✅ macOS detected"
    
elif [[ "$OS" == "Linux" ]]; then
    # Linux
    if command -v google-chrome &> /dev/null; then
        CHROME_CMD="google-chrome"
    elif command -v google-chrome-stable &> /dev/null; then
        CHROME_CMD="google-chrome-stable"
    elif command -v chromium &> /dev/null; then
        CHROME_CMD="chromium"
    elif command -v chromium-browser &> /dev/null; then
        CHROME_CMD="chromium-browser"
    else
        echo "❌ Chrome/Chromium not found!"
        echo "Setup: sudo apt install chromium-browser"
        exit 1
    fi
    echo "✅ Linux tespit edildi"
else
    echo "❌ Unsupported operating system: $OS"
    exit 1
fi

# Uygulamayı başlat
echo "🚀 Initializing the application..."
echo "   File: $HTML_FILE"

"$CHROME_CMD" --app="file://$HTML_FILE" --window-size=900,700 --window-position=150,100 &

sleep 1
echo "✅ Ok!"
exit 0