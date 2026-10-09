#!/bin/bash
set -e

# Cloudflared yoksa otomatik indir ve yetkilendir
if ! command -v cloudflared &> /dev/null; then
    echo "Cloudflared indiriliyor..."
    curl -L -s https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
    chmod +x /usr/local/bin/cloudflared
    echo "Cloudflared başarıyla kuruldu!"
fi

echo "=========================================================="
echo "Lumina için Cloudflare Tüneli başlatılıyor..."
echo "Aşağıda 'https://...trycloudflare.com' şeklinde bir link çıkacak."
echo "O linke tıklayarak sitene her yerden girebilirsin!"
echo "=========================================================="
echo ""

cloudflared tunnel --url http://127.0.0.1:8002
