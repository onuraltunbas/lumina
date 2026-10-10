# Lumina Platformu: Bilisel Ogrenme Stilleri ve Dinamik Noral Model Analizi

Lumina, bireylerin bilissel ogrenme egilimlerini ampirik test modelleriyle olcen, elde edilen verileri dinamik bir 3D noral lob simulasyonu uzerinde gorsellestiren ve kisisellestirilmis rehberlik saglayan analitik bir platformdur.

Platform; ogrencilerin bilgi isleme reflekslerini, calisma bellegi kapasitelerini ve stres altinda karar alma dinamiklerini degerlendirerek bes temel ogrenme boyutunda bagimsiz yetkinlik skorlari uretir.

---

## 1. Proje Mimarisi ve Temel Prensipler

Platformun tasarim felsefesi ve teknik altyapisi uc ana sutun uzerine kurulmustur:

### 1.1. Bagimsiz Yetkinlik Puanlama Modeli
Geleneksel ogrenme stili testleri kullaniciyi yalnizca tek bir kategoriye indirger ve toplam puani yuzde 100 uzerinden paylastirir. Lumina ise coklu zeka ve bilissel esneklik teorilerini temel alir:
* Bes ogrenme stili (Gorsel, Isitsel, Yazarak, Okuyarak, Deneyimsel) yuzde 0 ile yuzde 100 arasinda birbirini dislamayan bagimsiz skalalarda degerlendirilir.
* Bir kullanici ayni anda yuzde 95 Isitsel, yuzde 90 Gorsel ve yuzde 75 Deneyimsel beceri gosterebilir. Bir modelin yuksek olmasi digerlerinin puanini dusurmez.

### 1.2. 48 Saatlik Bekleme ve Dinamik Periyot Mimarisi (Cooldown)
Bilissel performans testlerinde kisa araliklarla ayni olcumlerin yapilmasi ezberleme etkisine (practice effect) yol acar. Olcumlerin guvenilirligini ve tutarliligini korumak amaciyla:
* Kullanicilar iki test oturumu arasinda asgari 48 saat beklemek zorundadir.
* Arka planda calisan API katmani, son test tarihinden itibaren 48 saat dolmadan gelen yeni sonuclari reddeder.
* Kullanici panelinde sonraki test oturumuna kalan sure canli olarak sayac halinde gosterilir.

### 1.3. Etkilesimli 3D Noral Ag Simulasyonu
Three.js tabanli ozel render motoru, 2400 noron dugumu ve dinamik akson baglantilarindan olusan spiral bir beyin geometrisi uretir:
* Test tamamlandiginda kullanicinin baskin modeli tespit edilir.
* Baskin modele karsilik gelen anatomik loblar (Oksipital Lob, Isitsel Korteks, Motor Korteks, Temporal Bolge vb.) gercek zamanli isik ve nabiz (pulsing) animasyonuyla aydinlatilir.
* Arayuz uzerindeki skor kartlarina temas edildiginde ilgili lob bolgeleri etkilesimli olarak odaklanir.

---

## 2. Bilisel Test Senaryolari ve Degerlendirme Metodolojisi

Test modulu, klasik coktan secmeli anket yapisinin otesinde, kullanicinin dogrudan eyleme gectigi 5 interaktif deneyim adimindan olusur:

### 2.1. Deneyimsel Ogrenme: Molekul Laboratuvari
* **Olcum Amaci:** Hipotez kurma, eylem-sonuc iliskisini bizzat test etme ve kinestetik geri bildirim alma refleksi.
* **Mekanik:** Kullanici laboratuvar ortaminda molekulleri beherin icine surukleyerek tepkimeleri gozlemler (Su, Ates, Gaz). Ardindan olusan reaksiyona dair teknik parametreyi yanitlar.

### 2.2. Gorsel Hafiza: Kim's Game
* **Olcum Amaci:** Gorsel dikkat taramasi, mekansal bellek ve nesne degisimlerini kisa sureli hafizada tutma.
* **Mekanik:** Ahsap tepsi uzerinde 9 farkli nesne 10 saniye boyunca sergilenir. Sure doldugunda sahne kararir, bir nesne eksiltilir ve kalanlar karistirilir. Kullanici eksik nesneyi serbest metin olarak yazar.

### 2.3. Okuyarak Ogrenme: Kronolojik Semantik Analiz
* **Olcum Amaci:** Metin ici baglaclari, zaman zarflarini ve olay orgusunu zihinsel olarak haritalandirma yetenegi.
* **Mekanik:** Yemekhane senaryosu uzerinden 4 karisik eylem kullaniciya 20 saniye sureyle gosterilir. Kullanici metin kapandiktan sonra dogru kronolojik akisi (B - C - D - A) goreli baglantilarla dizer.

### 2.4. Yazarak Ogrenme: Motor Kodlama ve Teknik Rapor
* **Olcum Amaci:** Bilgiyi pasif okumanin otesinde motor yazma refleksiyle calisma bellegine isleme.
* **Mekanik:** Kullanici giris ekraninda not alma yontemini (Telefon: 50s, Bilgisayar: 65s, Kagit & Kalem: 90s) secer. Zeta-4 Biyo-Polimeri metni kayarak gecer. Metin kapandiginda kullanici 140 derece esik sicakligini ve kristal baglar parametresini yanitlar.

### 2.5. Isitsel Ogrenme: Secici Dinleme ve Filtreleme
* **Olcum Amaci:** Gurultulu arka plan icerisinde kritik bilgiyi filtreleme (cocktail party effect) ve isitsel calisma bellegi.
* **Mekanik:** Kafe ortamindaki ses kaydi calinir. Konusmaci masada bulunan 6 daginik nesneden (semsiye, elma, fotograf makinesi, corap, vida, kalem) bahsederken celdiriciler de sunulur. Kullanici hatirladigi nesneleri dinamik kutucuklara yazar.

---

## 3. Matematiksel Puanlama Algoritmalari ve Formuller

Her bir sorunun puanlamasi mutlak dogru-yanlis mantiginin otesinde sure, goreli bag analizi ve durtu kontrolu faktorerini icerir:

### 3.1. 1. Soru (Deneyimsel) Formulu
* Yanlis cevap verilmesi durumunda puan 0'dir.
* Dogru cevap durumunda taban puan 100'dur.
* Ilk 5 saniye cezasiz tolerans suresidir.
* 5 saniyeyi asan her tam saniye icin 3 puan ceza kesilir:
  `Puan = max(0, 100 - floor(Sure - 5) * 3)`

### 3.2. 2. ve 3. Soru (Goreli Bag Analizi ve Hile Korumasi)
Siralama sorularinda ogrencinin elemanlari rastgele dagitmasi veya ayni elemani birden fazla yazmasi durumunda hile korumasi (anti-cheat) devreye girer. Tekrarlanan eleman varsa puan dogrudan 0 verilir.
* Toplam bag sayisi: N - 1 (3. soru icin 3 bag).
* Dogru bag sayisi: Kullanici diziliminde birbiri ardina gelen elemanlarin gercek dizilimde de ardil olma durumu.
* Ham puan: `(DogruBagSayisi / ToplamBagSayisi) * 100`
* Kademeli Zaman Cezasi:
  * Sure <= 5 saniye: Ceza = 0
  * 5 < Sure <= 15 saniye: `Ceza = floor(Sure - 5) * 1`
  * Sure > 15 saniye: `Ceza = 10 + floor(Sure - 15) * 3`
  * `Net Puan = max(0, HamPuan - Ceza)`

### 3.3. 4. Soru (Yazarak) Formulu
* Iki alt teknik soru icerir (140 derece esik ve kristal baglar).
* Her dogru soru 50 puan degerindedir (Ham Puan = 0, 50 veya 100).
* Ham puan 0 ise zaman cezasi isletilmez.
* Ham puan pozitifse 5 saniyeyi asan her saniye icin 1 puan kesilir:
  `Net Puan = max(0, HamPuan - floor(Sure - 5) * 1)`

### 3.4. 5. Soru (Isitsel Hafiza ve Durtu Kontrolu) Formulu
Kullanicinin girdigi serbest metinler turkce karakter duyarsizligi ve yazim toleranslariyla analiz edilir:
* 6 hedef nesnenin her biri esit agirliga sahiptir (Hedef basi 16.67 puan).
* Hatirlanan her dogru nesne toplam puana eklenir.
* Sinav kaygisi veya rastgele kutu doldurma durtusunu olcmek uzere yanlis cevaplara kademeli ceza uygulanir:
  * Ilk 6 yanlisin her biri icin 3 puan kesilir.
  * 6'yi asan sonraki her yanlis icin 5 puan kesilir.
  * Sonuc sinirlamasi: `Puan = clamp(ToplamPuan, 0, 100)`

---

## 4. Sistem Mimarisi ve Teknoloji Yigini

Platform modern, yuksek performansli ve asenkron standartlar gozetilerek insa edilmistir:

| Katman | Teknoloji | Aciklama |
| :--- | :--- | :--- |
| Backend | FastAPI (Python 3.10+) | Asenkron RESTful mimari, Pydantic sema dogrulama |
| Veritabani | SQLite & SQLAlchemy | ORM tabanli iliskisel veri yonetimi, migration destegi |
| Guvenlik & Auth | Passlib (Bcrypt) & HTTPOnly Cookies | Guvenli oturum yonetimi, brute-force korumasi |
| Frontend | HTML5, CSS3, ES6+ JavaScript | Neo-Brutalist Comic tasarim sistemi, ozel animasyonlar |
| 3D Motoru | Three.js & WebGL | 2400 noron dugumlu dinamik beyin modeli |
| Yapay Zeka Asistani | Google Gemini (GenAI SDK) | Lumi sohbet asistani, kisilik yonetimi ve rehberlik |
| Sunucu & SSL | Nginx & Let's Encrypt / DuckDNS | Ters vekil sunucu, guvenli HTTPS terminasyonu |

---

## 5. Git Dallari ve Ekip Calisma Mimarisi

Proje deposundaki branch yapisi ve moduler gorev dagilimi asagidaki sekildedir:

### 5.1. main
Uretim ortamina dagitilan ana daldir. Tum bilissel test motoru, 48 saatlik bekleme sistemi, responsive comic arayuz, 3D beyin entegrasyonu ve guvenlik testlerini eksiksiz olarak barindirir.

### 5.2. gokce
Bilisel test senaryolarinin, refleks sure esiklerinin (5s ve 15s kistaslari), Kim's Game hafiza tepsisinin ve molekul laboratuvari oyun mekaniklerinin ilk kurgulandigi daldan meydana gelir.

### 5.3. zeynep
Goreli siralama mantigi, hile engelleme kontrolleri, semantik metin analizi, isitsel celdirici filtreleme ve matematiksel puanlama formullerinin olusturuldugu daldan meydana gelir.

### 5.4. onur
Sunucu barindirma, Nginx reverse proxy yapilandirmasi, `teamlumina.duckdns.org` uzerindeki SSL sertifikasyonlari, systemd servis yonetimi ve veritabani semasinin tasarlandigi daldan meydana gelir.

### 5.5. lumi
Sitenin etkilesimli yapay zeka maskotu olan Lumi'nin (shimeji mekanikleri, cizgilerde yurume, balonla inis, karanlik modda boynuz aydinlatmasi) gelistirildigi daldan meydana gelir.

---

## 6. Kurulum ve Yerel Calistirma

Yerel gelistirme ortaminda calistirmak icin asagidaki adimlari izleyiniz:

### 6.1. Bagimliliklarin Kurulmasi
```bash
git clone https://github.com/onuraltunbas/lumina.git
cd lumina
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 6.2. Uygulamanin Baslatilmasi
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Uygulama baslatildiginda `http://localhost:8000` adresinden arayuze, `http://localhost:8000/test` adresinden bilissel test modülune erisilebilir.

### 6.3. Dogrulama ve Test Kosumu
Platformun guvenlik, oturum, KVKK ve API entegrasyonlarini dogrulamak icin:
```bash
python3 test_api.py
```

---

## 7. Uretim Ortami ve Dagitim Bilgileri

Canli ortamdaki sunucu guncellemeleri icin standart dagitim proseduru:
```bash
git pull origin main
systemctl restart lumina
```

Nginx ve SSL yonetimi `teamlumina.duckdns.org` alan adi uzerinden 8000 portuna yonlendirilecek sekilde ters vekil ile yapilandirilmistir.
