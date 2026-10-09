# Lumina — Creative Design Studio & Portfolio (FastAPI)

Modern, yüksek performanslı ve interaktif tasarım stüdyosu portföy web sitesi.
FastAPI tabanlı asenkron backend, SQLite (SQLAlchemy) veritabanı, özel SVG animasyonları ve zengin tipografi desteği ile inşa edilmiştir.

Mimari yapısı `/home/onur/opc-lisans-sunucu` referans alınarak modüler, genişletilebilir ve temiz bir şekilde yapılandırılmıştır.

---

## 🏗️ Proje Mimarisi

```
lumina_onur/
├── server.py              # FastAPI ana uygulama giriş noktası, CORS, middleware, hata yakalayıcılar
├── main.py                # Uvicorn alternatif başlatıcı (uvicorn main:app)
├── database.py            # SQLite veritabanı bağlantısı, SQLAlchemy ORM modelleri (lumina.db)
├── routes_api.py          # /api/contact, /api/newsletter, /api/health endpoint'leri
├── routes_html.py         # /, /project/{slug}, /template/* HTML route'ları
├── html_404.py            # Özel 404 sayfası render modülü
├── templates/             # HTML şablonları
│   ├── index.html         # Ana sayfa (Hero, Services, About, Testimonials, Portfolio, Contact)
│   ├── project_sandbox.html
│   ├── project_morello.html
│   ├── project_snowlake.html
│   ├── project_creatink.html
│   ├── changelog.html
│   ├── license.html
│   ├── style_guide.html
│   └── 404.html
├── static/                # Tüm statik varlıklar (Yerel ve %100 bağımsız)
│   ├── css/               # Ana stil dosyası (main.css)
│   ├── js/                # İnteraktif animasyon motoru (interactions.js), jquery.min.js, app.js
│   ├── images/            # İllüstrasyonlar, SVG ikonlar, proje görselleri
│   └── fonts/             # CabinetGrotesk, Unicons ve Love Ya Like A Sister fontları
├── test_api.py            # Otomatik test süiti (Tüm sayfalar ve API'lar)
├── requirements.txt       # Bağımlılıklar listesi
└── README.md              # Proje dokümantasyonu
```

---

## 🚀 Başlatma ve Çalıştırma

### 1. Bağımlılıkları Yükleme
```bash
pip install -r requirements.txt
```

### 2. Geliştirme Sunucusunu Başlatma
```bash
python3 server.py
# veya
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

Sunucu ayağa kalktıktan sonra:
* **Ana Sayfa:** [http://localhost:8000](http://localhost:8000)
* **API Dokümantasyonu (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
* **Sağlık Durumu:** [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 🧪 Testleri Çalıştırma

Tüm sayfaların ve API'ların doğruluğunu test etmek için:
```bash
python3 test_api.py
```

---

## ✨ Özellikler ve Fonksiyonlar

* **İnteraktif Arayüz & Animasyonlar:**
  * Yumuşak geçişler, kaydırma efektleri ve duyarlı buton animasyonları.
  * Mobil uyumlu hamburger menü ve yumuşak kaydırma (`smooth scroll`) navigasyonu.
  * İndirilen özel Google Fontu: **Love Ya Like A Sister** (`/static/fonts/LoveYaLikeASister.*`) dahil edilmiştir.
* **Fonksiyonel İletişim Formu (FastAPI + SQLite):**
  * Ziyaretçi formu gönderdiğinde AJAX (`/api/contact`) ile veriler SQLite veritabanına kaydedilir.
  * Başarı ve hata bildirimleri dinamik olarak ekranda gösterilir.
* **Portföy Vaka İnceleme (Case Study) Sayfaları:**
  * Sandbox Banking Application
  * Morello Company Networking
  * Snowlake Social Media
  * Creatink Creative Agency
* **Tamamen Bağımsız & Yerel Kaynaklar:**
  * Tüm CSS, JS, font ve SVG varlıkları doğrudan `/static/` altından yerel olarak sunulur.
