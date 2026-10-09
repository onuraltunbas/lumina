#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Lumina Platform - API, Güvenlik, KVKK, Kimlik Doğrulama ve Sayfa Entegrasyon Testleri
FastAPI TestClient kullanılarak doğrudan doğrulanır.
"""

import sys
import uuid
from fastapi.testclient import TestClient
from server import app

client = TestClient(app)

def test_endpoints():
    print("🧪 [Test Başlangıcı] Lumina Platform Güvenlik ve Entegrasyon Testleri Başlatılıyor...")

    # 1. Health Check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check başarısız: {res.status_code}"
    print("  ✅ [200 OK] /api/health ->", res.json()["status"])

    # 2. Ana Sayfa (Başlık ve Meta Doğrulama)
    res = client.get("/")
    assert res.status_code == 200, f"Ana sayfa yüklenemedi: {res.status_code}"
    assert "Kişisel Öğrenme Stilleri" in res.text, "Ana sayfa güncel başlığı bulunamadı"
    assert "Pedagojik &amp; Temsili Görselleştirme" in res.text, "3D beyin bilimsel bilgilendirme notu bulunamadı"
    assert "/static/css/main.css" in res.text
    print("  ✅ [200 OK] / (Ana Sayfa) -> Başarıyla render edildi (Eğitsel başlık ve bilimsel not doğrulandı)")

    # 3. Şablon Kalıntılarının Temizlendiğinin Doğrulanması (404 Kontrolü)
    removed_projects = [
        "sandbox-banking-application-website",
        "morello-company-networking-website",
        "snowlake-social-media-website",
        "creatink-creative-agency-website"
    ]
    for p in removed_projects:
        res = client.get(f"/project/{p}")
        assert res.status_code == 404, f"Şablon kalıntısı /project/{p} kaldırılmamış!"
    print("  ✅ [404 Not Found] Şablon portföy sayfaları (/project/*) başarıyla temizlendi")

    # 4. Lisans Sayfası (Türkçe ve Lumina'ya Özgü)
    res = client.get("/license")
    assert res.status_code == 200
    assert "Lumina Platformu Lisans Koşulları" in res.text
    assert "this template" not in res.text.lower(), "İngilizce şablon kalıntısı bulundu!"
    print("  ✅ [200 OK] /license -> Türkçe telif ve lisans sayfası başarıyla doğrulandı")

    # 5. API Dokümantasyonu Güvenlik Kontrolü (/docs kapalı olmalı)
    res = client.get("/docs")
    assert res.status_code == 404, "/docs herkese açık, güvenlik açığı!"
    print("  ✅ [404 Not Found] /docs Swagger dokümantasyonu üretim modunda güvenle kapatıldı")

    # 6. İletişim Formu POST
    contact_data = {
        "name": "Onur Altunbaş",
        "email": "onur@example.com",
        "message": "Öğrenme stilleri testi hakkında bilgi almak istiyorum."
    }
    res = client.post("/api/contact", json=contact_data)
    assert res.status_code == 200, f"Contact POST başarısız: {res.status_code}"
    resp_json = res.json()
    assert resp_json["success"] is True
    print("  ✅ [200 OK] POST /api/contact ->", resp_json["message"])

    # 7. KVKK Güvenlik Testi: Yetkisiz GET /api/contact/messages Engeli
    res = client.get("/api/contact/messages")
    assert res.status_code == 401, "KVKK İHLALİ: Oturumu olmayan kişi iletişim mesajlarını çekebiliyor!"
    print("  ✅ [401 Unauthorized] GET /api/contact/messages yetkisiz erişim başarıyla engellendi (KVKK Uyumu)")

    # 8. Bülten Aboneliği POST
    res = client.post("/api/newsletter", json={"email": "newsletter@example.com"})
    assert res.status_code == 200
    print("  ✅ [200 OK] POST /api/newsletter ->", res.json()["message"])

    # 9. 404 Sayfası
    res = client.get("/olmayan-bir-sayfa-404")
    assert res.status_code == 404
    assert "404" in res.text or "Not Found" in res.text
    print("  ✅ [404 Not Found] /olmayan-bir-sayfa-404 -> Özel 404 şablonu render edildi")

    # 10. KİMLİK DOĞRULAMA (AUTH) & GÜVENLİK TESTLERİ
    print("\n🔐 [Kimlik Doğrulama & Güvenlik Testleri]")

    # 10a. Şifre Uzunluk Politikası Kontrolü (En az 8 karakter)
    res = client.post("/api/auth/register", json={"username": "kisa_test", "password": "123"})
    assert res.status_code == 400 or res.status_code == 422, "Zayıf şifre (123) kabul edildi, güvenlik açığı!"
    print("  ✅ [400 Bad Request] 8 karakterden kısa zayıf şifre başarıyla reddedildi")

    # 10b. /auth sayfası render testi (Oturum açmamış kullanıcı)
    res = client.get("/auth")
    assert res.status_code == 200
    assert "Kayıt Ol" in res.text and "Giriş Yap" in res.text
    print("  ✅ [200 OK] GET /auth -> Kayıt ve Giriş sekme şablonu render edildi")

    # 10c. /dashboard sayfasına yetkisiz erişim (Yönlendirme kontrolü)
    res = client.get("/dashboard", follow_redirects=False)
    assert res.status_code in [302, 303, 307]
    assert "/auth" in res.headers.get("location", "")
    print("  ✅ [303 Redirect] GET /dashboard (Anonim) -> /auth sayfasına başarıyla yönlendirildi")

    # 10d. Yeni Kullanıcı Kaydı POST /api/auth/register (Güçlü şifre ile)
    test_user = f"test_{uuid.uuid4().hex[:8]}"
    test_pass = "GucluSifre2026!"

    res = client.post("/api/auth/register", json={"username": test_user, "password": test_pass})
    assert res.status_code == 200, f"Kayıt başarısız: {res.text}"
    reg_data = res.json()
    assert reg_data["success"] is True
    assert reg_data["user"]["username"] == test_user
    print(f"  ✅ [200 OK] POST /api/auth/register -> '{test_user}' güçlü şifreyle başarıyla kaydedildi")

    # Çerez oluşturuldu mu?
    assert "lumina_session" in client.cookies, "Oturum çerezi atanamadı"
    print("  ✅ [Cookie OK] lumina_session çerezi oluşturuldu ve kaydedildi")

    # 10e. Oturumu olan kullanıcının GET /api/contact/messages erişimi
    res = client.get("/api/contact/messages")
    assert res.status_code == 200
    assert res.json()["success"] is True
    print("  ✅ [200 OK] GET /api/contact/messages (Yetkili Oturum) -> Mesajlar güvenle listelendi")

    # 10f. /api/auth/me ile aktif kullanıcı bilgilerini doğrulama
    res = client.get("/api/auth/me")
    assert res.status_code == 200
    me_data = res.json()
    assert me_data["authenticated"] is True
    assert me_data["user"]["username"] == test_user
    print("  ✅ [200 OK] GET /api/auth/me -> Kullanıcı oturumu doğrulandı")

    # 10g. Oturumu olan kullanıcının /dashboard erişimi
    res = client.get("/dashboard")
    assert res.status_code == 200
    assert "Lumina" in res.text
    assert "Pedagojik &amp; Temsili Simülasyon" in res.text, "Dashboard 3D beyin bilimsel notu bulunamadı"
    print("  ✅ [200 OK] GET /dashboard (Giriş Yapmış) -> Kontrol paneli ve bilimsel not başarıyla yüklendi")

    # 10h. Test Sonucu Kaydetme (Bağımsız %0-100 Puanlama)
    result_payload = {
        "score_gorsel": 95.0,
        "score_isitsel": 75.0,
        "score_yazarak": 60.0,
        "score_okuyarak": 80.0,
        "score_deneyimsel": 85.0,
        "dominant_style": "gorsel",
        "details_json": '{"test": "demo"}'
    }
    res = client.post("/api/auth/results", json=result_payload)
    assert res.status_code == 200
    assert res.json()["result"]["score_gorsel"] == 95.0
    print("  ✅ [200 OK] POST /api/auth/results -> Bağımsız %0-100 sonuç veritabanına kaydedildi")

    # 10i. Çıkış Yapma POST /api/auth/logout
    res = client.post("/api/auth/logout")
    assert res.status_code == 200
    print("  ✅ [200 OK] POST /api/auth/logout -> Oturum sonlandırıldı")

    # 10j. Hatalı Şifreyle Giriş Denemesi
    res = client.post("/api/auth/login", json={"username": test_user, "password": "YanlisSifre123!"})
    assert res.status_code == 401
    print("  ✅ [401 Unauthorized] Hatalı şifre denemesi başarıyla reddedildi")

    # 10k. Doğru Şifre ve Giriş
    res = client.post("/api/auth/login", json={"username": test_user, "password": test_pass, "remember_me": True})
    assert res.status_code == 200
    assert res.json()["success"] is True
    print("  ✅ [200 OK] POST /api/auth/login -> Doğru şifre ile giriş başarılı")

    print("\n🎉 Tüm testler (Güvenlik, KVKK, Sayfalar, API'ler, Auth, Oturum, Bağımsız Skorlama) başarıyla tamamlandı! (100% PASS)")

if __name__ == "__main__":
    test_endpoints()
