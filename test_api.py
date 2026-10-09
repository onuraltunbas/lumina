#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Lumina Studio - API ve Sayfa Entegrasyon Testleri
FastAPI TestClient kullanılarak doğrudan doğrulanır.
"""

import sys
from fastapi.testclient import TestClient
from server import app

client = TestClient(app)

def test_endpoints():
    print("🧪 [Test Başlangıcı] Lumina Studio Testleri Başlatılıyor...")

    # 1. Health Check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check başarısız: {res.status_code}"
    print("  ✅ [200 OK] /api/health ->", res.json()["status"])

    # 2. Ana Sayfa
    res = client.get("/")
    assert res.status_code == 200, f"Ana sayfa yüklenemedi: {res.status_code}"
    assert "Lumina" in res.text, "Ana sayfa içeriğinde Lumina başlığı bulunamadı"
    assert "/static/css/main.css" in res.text
    assert "/static/js/interactions.js" in res.text
    print("  ✅ [200 OK] / (Ana Sayfa) -> Başarıyla render edildi")

    # 3. Portföy Sayfaları
    projects = [
        "sandbox-banking-application-website",
        "morello-company-networking-website",
        "snowlake-social-media-website",
        "creatink-creative-agency-website"
    ]
    for p in projects:
        res = client.get(f"/project/{p}")
        assert res.status_code == 200, f"Proje {p} yüklenemedi: {res.status_code}"
        print(f"  ✅ [200 OK] /project/{p}")

    # 4. Dokümantasyon ve Şablon Sayfaları
    templates = ["changelog", "license", "style-guide"]
    for t in templates:
        res = client.get(f"/template/{t}")
        assert res.status_code == 200, f"Şablon {t} yüklenemedi: {res.status_code}"
        print(f"  ✅ [200 OK] /template/{t}")

    # 5. İletişim Formu POST
    contact_data = {
        "name": "Onur Altunbaş",
        "email": "onur@example.com",
        "message": "Yeni bir proje için görüşmek istiyoruz."
    }
    res = client.post("/api/contact", json=contact_data)
    assert res.status_code == 200, f"Contact POST başarısız: {res.status_code}"
    resp_json = res.json()
    assert resp_json["success"] is True
    print("  ✅ [200 OK] POST /api/contact ->", resp_json["message"])

    # 6. Mesaj Listesi GET
    res = client.get("/api/contact/messages")
    assert res.status_code == 200
    msgs = res.json()["data"]
    assert len(msgs) > 0
    print(f"  ✅ [200 OK] GET /api/contact/messages -> Toplam {len(msgs)} kayıt doğrulandı")

    # 7. Bülten Aboneliği POST
    res = client.post("/api/newsletter", json={"email": "newsletter@example.com"})
    assert res.status_code == 200
    print("  ✅ [200 OK] POST /api/newsletter ->", res.json()["message"])

    # 8. 404 Sayfası
    res = client.get("/olmayan-bir-sayfa-404")
    assert res.status_code == 404
    assert "404" in res.text or "Not Found" in res.text
    print("  ✅ [404 Not Found] /olmayan-bir-sayfa-404 -> Özel 404 şablonu render edildi")

    print("\n🎉 Tüm testler başarıyla tamamlandı! (100% PASS)")

if __name__ == "__main__":
    test_endpoints()
