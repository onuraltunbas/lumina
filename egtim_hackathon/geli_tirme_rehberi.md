# EdTech Hackathon - Geliştirme ve Mimari Rehberi

Mimaride API ve chatbot kısmını şimdilik bir kenara bırakıp sadece test arayüzüne odaklanıyoruz. Ekip arkadaşınla kod birleştirirken (merge) çıldırmamak ve çakışma (conflict) yaşamamak için standartları baştan koyuyoruz.

---

### 1. Hangi Dilleri ve Kütüphaneleri Kullanmalısınız?
Testlerin tarayıcıda sorunsuz, akıcı ve animasyonlu çalışması için saf web teknolojileri (**Vanilla Stack**) en hızlısıdır:

* **HTML5:** Test sayfalarının iskeleti ve Canvas (molekül oyunu için).
* **CSS3 / Bootstrap veya Tailwind CSS:** Görsel şıklık ve responsive (mobil/ekran) uyum için.
* **JavaScript (ES6+):** Sürükle-bırak, sayaçlar, animasyonlar ve puanlama mantığı için.
* **Yardımcı JS Kütüphaneleri (CDN ile ekleyin):**
  * **SortableJS:** Sürükle-bırak sıralama soruları için.
  * **Chart.js:** Test sonundaki Radar Grafiği (Spider Chart) için.

---

### 2. Ekip Arkadaşınla Uyumsuzluk Yaşamamak İçin 3 Altın Şart
İki farklı kişi iki farklı soruyu kodlarken çakışma yaşamamak için şu kurallarda anlaşın:

#### A. Ortak Veri Yapısı (Global Score Object)
Her soru bittiğinde puanı nereye yazacağınızı ortak bir JavaScript nesnesinde (`Object`) tutun. Tek bir `app.js` dosyasında şu değişken tanımlı olsun:

```javascript
// Ortak Değişken (Herkes puanını buraya ekleyecek)
window.testSonuclari = {
    gorselPuan: 0,
    deneyimselPuan: 0,
    cevaplar: {}
};
```

#### B. Fonksiyon İsimlendirme Standardı
Her sorunun kendine ait bir "Soru Tamamlandı" fonksiyonu olsun. Ekip arkadaşın kendi sorusunu bitirince bu ortak formattaki fonksiyonu çağrısın:

```javascript
// 1. Soru (Molekül Testi) Bittiğinde
function soru1Tamamla(gorsel, deneyimsel) {
    window.testSonuclari.gorselPuan += gorsel;
    window.testSonuclari.deneyimselPuan += deneyimsel;
    sonrakiSoruyaGec(2); // 2. soruya yönlendir
}

// 2. Soru (Sürükle Bırak) Bittiğinde
function soru2Tamamla(gorsel, deneyimsel) {
    window.testSonuclari.gorselPuan += gorsel;
    window.testSonuclari.deneyimselPuan += deneyimsel;
    sonrakiSoruyaGec(3); // 3. soruya yönlendir
}
```

#### C. HTML Modülerliği (Div İzolasyonu)
Projeyi birleştirirken herkes kendi sorusunun kodunu tek bir `div` içine yazsın. Diğer arkadaşının koduna dokunmasın:

```html
<!-- index.html -->
<main id="test-container">

    <!-- 1. SORU (Gökçe'nin Kodu) -->
    <div id="soru-1" class="soru-kart">
        <!-- Molekül Oyunu HTML ve Canvas Kodları -->
    </div>

    <!-- 2. SORU (Arkadaşının Kodu) -->
    <div id="soru-2" class="soru-kart hidden">
        <!-- Arkadaşının Hazırladığı Soru Kodları -->
    </div>

    <!-- 3. SORU ... -->

</main>
```

---

### 3. Klasör ve Dosya Yapınız Nasıl Olmalı?
GitHub veya dosya paylaşımı yaparken projenizi şu sade klasör yapısıyla yönetin:

```text
/edtech-hackathon/
│
├── index.html          <-- Tüm soruların toplandığı ana sayfa
├── css/
│   └── style.css       <-- Ortak tasarım ve gizleme (hidden) sınıfları
│
└── js/
    ├── app.js          <-- Sorular arası geçişi ve genel puanı tutan ana JS
    ├── soru1_molekul.js<-- Molekül simülasyonu JS kodu
    └── soru2_test.js   <-- Arkadaşının yazdığı sorunun JS kodu
```

---

### 4. Sorular Arası Geçiş Mantığı (Ekran Yöneticisi)
`app.js` dosyanızda sadece şu 5 satırlık geçiş mantığı duracak. Sorular bittikçe bu fonksiyon çağrılacak:

```javascript
// Soruları Değiştiren Ana Fonksiyon
function sonrakiSoruyaGec(sonrakiSoruNo) {
    // Tüm soru kartlarını gizle
    const kartlar = document.querySelectorAll('.soru-kart');
    kartlar.forEach(kart => kart.classList.add('hidden'));

    // İstenen soruyu görünür yap
    const aktifSoru = document.getElementById(`soru-${sonrakiSoruNo}`);
    if (aktifSoru) {
        aktifSoru.classList.remove('hidden');
    } else {
        // Sorular bitti! Sonuç ekranını / Radar Grafiğini göster
        sonucEkraniGoster();
    }
}
```

CSS'te ise sadece tek bir gizleme kuralı olması yeterlidir:

```css
.hidden {
    display: none !important;
}
```

Bu yapıyı kurarsanız, arkadaşın kendi JS dosyasında çalışıp sorusunu bitirdiğinde, onun kodunu `index.html` içine yapıştırmak sadece 1 dakikanızı alır ve hiçbir kod çakışması yaşamazsınız.