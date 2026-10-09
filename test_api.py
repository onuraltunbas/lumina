#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Lumina Studio - API, Kimlik Doğrulama ve Sayfa Entegrasyon Testleri
FastAPI TestClient kullanılarak doğrudan doğrulanır.
"""

import sys
import uuid
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

    # 9. KİMLİK DOĞRULAMA (AUTH) TESTLERİ
    print("\n🔐 [Kimlik Doğrulama Testleri]")

    # 9a. /auth sayfası render testi (Oturum açmamış kullanıcı)
    res = client.get("/auth")
    assert res.status_code == 200
    assert "Kayıt Ol" in res.text and "Giriş Yap" in res.text
    print("  ✅ [200 OK] GET /auth -> Kayıt ve Giriş sekme şablonu render edildi")

    # 9b. /dashboard sayfasına yetkisiz erişim (Yönlendirme kontrolü)
    res = client.get("/dashboard", follow_redirects=False)
    assert res.status_code in [302, 303, 307]
    assert "/auth" in res.headers.get("location", "")
    print("  ✅ [303 Redirect] GET /dashboard (Anonim) -> /auth sayfasına başarıyla yönlendirildi")

    # 9c. Yeni Kullanıcı Kaydı POST /api/auth/register
    test_user = f"test_{uuid.uuid4().hex[:8]}"
    test_pass = "GuvenliSifre123"

    res = client.post("/api/auth/register", json={"username": test_user, "password": test_pass})
    assert res.status_code == 200, f"Kayıt başarısız: {res.text}"
    reg_data = res.json()
    assert reg_data["success"] is True
    assert reg_data["user"]["username"] == test_user
    print(f"  ✅ [200 OK] POST /api/auth/register -> '{test_user}' başarıyla kaydedildi")

    # Çerez oluşturuldu mu?
    assert "lumina_session" in client.cookies, "Oturum çerezi atanamadı"
    print("  ✅ [Cookie OK] lumina_session çerezi oluşturuldu ve kaydedildi")

    # 9d. Aynı kullanıcı adıyla tekrar kayıt engellemesi
    res = client.post("/api/auth/register", json={"username": test_user, "password": "baskasifre"})
    assert res.status_code == 400
    print("  ✅ [400 Bad Request] Mükerrer kullanıcı adı kaydı başarıyla engellendi")

    # 9e. /api/auth/me ile aktif kullanıcı bilgilerini doğrulama
    res = client.get("/api/auth/me")
    assert res.status_code == 200
    me_data = res.json()
    assert me_data["authenticated"] is True
    assert me_data["user"]["username"] == test_user
    print("  ✅ [200 OK] GET /api/auth/me -> Kullanıcı oturumu doğrulandı")

    # 9f. Oturumu olan kullanıcının /dashboard erişimi
    res = client.get("/dashboard")
    assert res.status_code == 200
    assert "Lumina" in res.text
    assert "dashboard-grid" in res.text
    print("  ✅ [200 OK] GET /dashboard (Giriş Yapmış) -> Kontrol paneli başarıyla yüklendi")

    # 9g. Oturumu olan kullanıcının /auth erişiminde dashboard'a yönlendirilmesi
    res = client.get("/auth", follow_redirects=False)
    assert res.status_code in [302, 303, 307]
    assert "/dashboard" in res.headers.get("location", "")
    print("  ✅ [303 Redirect] GET /auth (Zaten Giriş Yapmış) -> /dashboard sayfasına yönlendirildi")

    # 9h. Test Sonucu Kaydetme (Bağımsız %0-100 Puanlama)
    result_payload = {
        "score_gorsel": 100.0,
        "score_isitsel": 50.0,
        "score_yazarak": 40.0,
        "score_okuyarak": 65.0,
        "score_deneyimsel": 85.0,
        "dominant_style": "gorsel",
        "details_json": '{"test": "demo"}'
    }
    res = client.post("/api/auth/results", json=result_payload)
    assert res.status_code == 200
    assert res.json()["result"]["score_gorsel"] == 100.0
    assert res.json()["result"]["dominant_style"] == "gorsel"
    print("  ✅ [200 OK] POST /api/auth/results -> Bağımsız %0-100 sonuç veritabanına kaydedildi")

    # 9i. Kullanıcı test sonuçlarını listeleme
    res = client.get("/api/auth/results")
    assert res.status_code == 200
    results_list = res.json()["data"]
    assert len(results_list) >= 1
    print(f"  ✅ [200 OK] GET /api/auth/results -> Toplam {len(results_list)} test kaydı doğrulandı")

    # 9j. Çıkış Yapma POST /api/auth/logout
    res = client.post("/api/auth/logout")
    assert res.status_code == 200
    print("  ✅ [200 OK] POST /api/auth/logout -> Oturum sonlandırıldı")

    # 9k. Çıkış sonrası /api/auth/me kontrolü
    res = client.get("/api/auth/me")
    assert res.status_code == 200
    assert res.json()["authenticated"] is False
    print("  ✅ [200 OK] GET /api/auth/me (Çıkış sonrası) -> Oturum kapalı olduğu doğrulandı")

    # 9l. Hatalı Şifreyle Giriş Denemesi
    res = client.post("/api/auth/login", json={"username": test_user, "password": "YanlisSifre"})
    assert res.status_code == 401
    print("  ✅ [401 Unauthorized] Hatalı şifre denemesi başarıyla reddedildi")

    # 9m. Doğru Şifre ve Beni Hatırla ile Giriş
    res = client.post("/api/auth/login", json={"username": test_user, "password": test_pass, "remember_me": True})
    assert res.status_code == 200
    assert res.json()["success"] is True
    print("  ✅ [200 OK] POST /api/auth/login -> 'Beni Hatırla' ile giriş başarılı")

    print("\n🎉 Tüm testler (Sayfalar, API'ler, Auth, Oturum, Bağımsız Skorlama) başarıyla tamamlandı! (100% PASS)")

if __name__ == "__main__":
    test_endpoints()
