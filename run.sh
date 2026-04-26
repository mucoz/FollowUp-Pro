#!/bin/bash

# Basit versiyon - Sadece varsayılan Chrome'u kullanır

echo "FollowUp Pro Baslatici"
echo "======================"

# Script dizinini al
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HTML_FILE="$SCRIPT_DIR/src/index.html"

# HTML dosyasını kontrol et
if [[ ! -f "$HTML_FILE" ]]; then
    HTML_FILE="$SCRIPT_DIR/index.html"
    if [[ ! -f "$HTML_FILE" ]]; then
        echo "Hata: index.html bulunamadi!"
        exit 1
    fi
fi

# macOS'ta Chrome'u bul
if [[ "$(uname)" == "Darwin" ]]; then
    CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    
    if [[ ! -f "$CHROME" ]]; then
        echo "Hata: Google Chrome bulunamadi!"
        echo "Lutfen Chrome'u /Applications klasorune kurun"
        exit 1
    fi
else
    # Linux
    CHROME=$(which google-chrome 2>/dev/null || which chromium 2>/dev/null)
    
    if [[ -z "$CHROME" ]]; then
        echo "Hata: Chrome/Chromium bulunamadi!"
        exit 1
    fi
fi

# Uygulamayı başlat
echo "Uygulama baslatiliyor: $HTML_FILE"
"$CHROME" --app="$HTML_FILE" --window-size=900,700 --window-position=150,100 &

echo "Tamam!"
exit 0