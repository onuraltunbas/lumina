# 🧠 Lumina — Kişisel Bilişsel Gelişim ve Öğrenme Stilleri Platformu

Lumina, bireylerin kendilerine özgü öğrenme yöntemlerini keşfetmelerini, bilişsel farkındalık kazanmalarını ve çalışma süreçlerini optimize etmelerini sağlayan modern ve etkileşimli bir web platformudur.

Platform; pedagojik modelleri **3D WebGL nöral simülasyonlar**, kullanıcı dostu neo-brutalist arayüz ve güvenli bir dijital altyapı ile bir araya getirir.

---

## 🚀 Temel Özellikler

* **🎨 5 Temel Öğrenme Modeli:** Görsel, İşitsel, Yazarak, Okuyarak ve Deneyimsel öğrenme yaklaşımlarının detaylı pedagojik analizi.
* **🧠 3D İnteraktif Nöral Model:** Three.js destekli, öğrenme modellerinin bilişsel odak alanlarını temsil eden dinamik 3D beyin ve lob simülasyonu.
* **👤 Bireysel Kullanıcı Paneli:** Güvenli kimlik doğrulama, bağımsız öğrenme skorları (%0-100) ve kişiselleştirilmiş rehberlik alanı.
* **🌓 Karanlık / Aydınlık Mod:** Neo-brutalist tasarım diliyle tam uyumlu, sistem tercihlerine duyarlı tema desteği.
* **🛡️ KVKK & Gizlilik Uyumlu Altyapı:** Sıfır üçüncü taraf takip çerezi; şeffaf çerez tercih yönetimi ve mevzuata tam uyum.
* **📱 Mobil ve Masaüstü Uyumu:** Tüm cihazlarda akıcı, duyarlı ve optimize edilmiş kullanıcı deneyimi.

---

## 🛠️ Teknoloji Mimarisi

* **Backend:** Python 3, FastAPI, SQLAlchemy, Uvicorn
* **Veritabanı:** SQLite
* **Frontend:** Semantik HTML5, Modern CSS3, Vanilla JavaScript (ES6+)
* **3D & Animasyon:** Three.js (WebGL), GSAP, ScrollTrigger
* **Güvenlik:** HTTP-Only Session Cookies, Güçlü Parola Doğrulama, Rate Limiting, KVKK Uyumu

---

## ⚡ Hızlı Başlangıç

### 1. Bağımlılıkları Yükleyin
```bash
pip install -r requirements.txt
```

### 2. Uygulamayı Başlatın
```bash
python3 -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

Uygulama varsayılan olarak `http://localhost:8000` adresinde çalışacaktır.

---

## 📜 Lisans

Bu proje açık kaynak topluluğu lisans standartlarına uygun olarak geliştirilmiştir. Ayrıntılar için platform içi `/license` sayfasını ziyaret edebilirsiniz.
