# Lumina — Öğrenme Stilleri Keşif Platformu

Lumina, bireylerin kendi benzersiz öğrenme stillerini (Görsel, İşitsel, Okuyarak/Yazarak, Deneyimsel / Kinestetik) keşfetmelerine yardımcı olmak için geliştirilen modern, interaktif ve samimi bir dijital platformdur.

Tasarım dili; sıcak, eğlenceli ve samimi bir **"cartoon / doodle"** estetiği ile güçlü mikro etkileşimleri bir araya getirir.

---

## 🎯 Projenin Amacı ve Odak Alanları

Platform, öğrenmeyi bir kalıba sokmak yerine bireylerin bilgiyi nasıl en verimli şekilde edindiğini anlamalarını sağlar:
* 👁️ **Görsel Öğrenme (Visual):** İnfografikler, renk kodları, zihin haritaları ve şemalarla kavrama.
* 🎧 **İşitsel Öğrenme (Auditory):** Dinleme, sesli anlatım, tartışmalar ve ritimlerle öğrenme.
* 📖 **Okuyarak / Yazarak Öğrenme (Read/Write):** Not alma, listeleme, metin özetleme ve okuma odaklı yöntemler.
* 🛠️ **Deneyimsel / Kinestetik Öğrenme (Kinesthetic):** Dokunarak, yaparak, deneyimleyerek ve hareketle kavrama.

*(Not: İnteraktif test ve envanter soruları ilerleyen aşamada adım adım entegre edilecektir.)*

---

## 🏗️ Proje Mimarisi

```
lumina_onur/
├── server.py              # FastAPI ana sunucu giriş noktası, CORS, middleware, hata yönetimi
├── main.py                # Uvicorn alternatif başlatıcı
├── database.py            # SQLite + SQLAlchemy modelleri (lumina.db)
├── routes_api.py          # /api/contact, /api/newsletter, /api/health endpoint'leri
├── routes_html.py         # Sayfa yönlendirmeleri (Canlı şablon okuma)
├── html_404.py            # Özel 404 sayfası
├── templates/             # HTML şablonları
│   ├── index.html         # Ana sayfa (Hero, Öğrenme Stilleri, Hakkımızda, Yöntemler, İletişim)
│   ├── project_*.html     # Örnek vaka ve detay sayfaları
│   └── 404.html
├── static/                # %100 yerel statik varlıklar
│   ├── css/               # Ana stil dosyası (main.css)
│   ├── js/                # interactions.js, jquery.min.js, app.js
│   ├── images/            # Doodle illüstrasyonları, rozetler, SVG grafikler
│   └── fonts/             # CabinetGrotesk, Unicons ve Love Ya Like A Sister fontları
├── test_api.py            # Otomatik test paketi
├── requirements.txt       # Python bağımlılıkları
└── README.md              # Proje dokümantasyonu
```

---

## 🚀 Çalıştırma

```bash
# Bağımlılıkları yükleyin
pip install -r requirements.txt

# Geliştirme sunucusunu başlatın
python3 server.py
# veya
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

* **Canlı Site:** [http://localhost:8000](http://localhost:8000)
* **API Belgeleri:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🔮 Gelecek Yol Haritası

1. **İçerik & Metin Düzenlemesi:** Ana sayfa alanlarının tamamen öğrenme modelleri eksenine oturtulması.
2. **Cartoon / İllüstratif Görsel Dokunuşlar:** "Love Ya Like A Sister" tipografisi, daha belirgin çizgi film konturları ve eğlenceli mikro detaylar.
3. **GSAP ScrollTrigger:** Aşağı kaydırdıkça canlanan, çizgi film havasını pekiştiren pürüzsüz kaydırma animasyonları.
4. **Test & Analiz Modülü:** Öğrenme tarzını belirleyen etkileşimli soru akışının eklenmesi.
