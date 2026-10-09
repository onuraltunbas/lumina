#!/bin/bash
set -e

echo "[1/4] Nginx konfigürasyonu ayarlanıyor..."
cp nginx_teamlumina.conf /etc/nginx/sites-available/teamlumina
ln -sf /etc/nginx/sites-available/teamlumina /etc/nginx/sites-enabled/

echo "[2/4] Nginx test ediliyor..."
nginx -t

echo "[3/4] Nginx yeniden yükleniyor..."
systemctl reload nginx

echo "[4/4] SSL (HTTPS) sertifikası alınıyor..."
if ! command -v certbot &> /dev/null; then
    apt-get update -y && apt-get install -y certbot python3-certbot-nginx
fi

certbot --nginx -d teamlumina.duckdns.org --non-interactive --agree-tos -m onnuraltunbass@gmail.com --redirect || certbot --nginx -d teamlumina.duckdns.org

echo ""
echo "=========================================================="
echo "🎉 TEBRİKLER! Siten kalıcı ve SSL korumalı olarak hazır:"
echo "👉 https://teamlumina.duckdns.org"
echo "=========================================================="
