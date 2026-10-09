# -*- coding: utf-8 -*-
"""
Lumina Studio - 404 Hata Sayfası Oluşturucu
"""

import os

_dir = os.path.dirname(os.path.abspath(__file__))
_template_404_path = os.path.join(_dir, "templates", "404.html")

def render_404(path: str = "") -> str:
    """
    404 hata sayfasını yükler ve döner.
    """
    if os.path.exists(_template_404_path):
        with open(_template_404_path, "r", encoding="utf-8") as f:
            return f.read()
    
    return f"""<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <title>404 - Sayfa Bulunamadı | Lumina Studio</title>
</head>
<body style="font-family:sans-serif;text-align:center;padding:50px;">
  <h1>404 - Sayfa Bulunamadı</h1>
  <p>Aradığınız sayfa bulunamadı: <code>{path}</code></p>
  <a href="/">Ana Sayfaya Dön</a>
</body>
</html>"""
