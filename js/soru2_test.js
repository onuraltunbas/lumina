// ===== 2. Soru: Yazarak Öğrenme =====
// HTML: index.html icindeki #soru-2 div'i

const SORU2_SURESI = {
    telefon: 50,
    bilgisayar: 65,
    kagit: 90
};
const SORU2_CEVAP_SURE = 15; // cevaplama suresi (saniye)

let soru2OkumaSuresi = SORU2_SURESI.kagit;
let soru2KalanOkuma = soru2OkumaSuresi;
let soru2KalanCevap = SORU2_CEVAP_SURE;
let soru2OkumaZamanlayici = null;
let soru2CevapZamanlayici = null;
let soru2MetinZamanlayici = null;

// Metin 10 sn'de bir, parça parça (kayarak) görünür
const SORU2_METIN_PARCALARI = [
    'Yeni sentezlenen Zeta-4 polimeri,',
    'yüksek sıcaklık altında aşamalı bir tepkime gösterir.',
    'Sıcaklık 140°C seviyesine ulaştığında',
    'malzeme iç yapısındaki kristal bağlar gevşeyerek',
    'esnek forma geçer.'
];
const SORU2_PARCA_SURE = 10; // her parça 10 saniye arayla görünür

let soru2Gorsel = 0;
let soru2Deneyimsel = 0;

// Seçilen yazım yöntemine göre okuma alanına geç
function soru2Baslat(mod) {
    soru2OkumaSuresi = SORU2_SURESI[mod] || SORU2_SURESI.kagit;

    const giris = document.getElementById('soru2-giris');
    if (giris) giris.classList.add('hidden');

    const yazmaAlani = document.getElementById('soru2-yazma-alani');
    if (yazmaAlani) {
        if (mod === 'kagit') {
            yazmaAlani.classList.add('hidden'); // kagida yazacak, ekran kutusu gerekmez
        } else {
            yazmaAlani.classList.remove('hidden');
        }
    }

    const okuma = document.getElementById('soru2-okuma');
    if (okuma) okuma.classList.remove('hidden');
    soru2MetinAkisiniBaslat();
    soru2OkumaBaslat();
}

// Metni parça parça ekrana kaydır
function soru2MetinAkisiniBaslat() {
    const kap = document.getElementById('soru2-metin');
    if (!kap) return;
    kap.innerHTML = '';

    let i = 0;
    const parcaGoster = () => {
        if (i >= SORU2_METIN_PARCALARI.length) {
            clearInterval(soru2MetinZamanlayici);
            return;
        }
        const parca = document.createElement('span');
        parca.className = 'soru2-metin-parca';
        parca.textContent = SORU2_METIN_PARCALARI[i];
        kap.appendChild(parca);

        // Aynı anda en fazla 2 satır görünsün; yeni satır gelince en üstteki silinsin
        while (kap.children.length > 2) {
            kap.removeChild(kap.firstElementChild);
        }

        i += 1;
    };

    parcaGoster(); // ilk parça hemen görünür
    soru2MetinZamanlayici = setInterval(parcaGoster, SORU2_PARCA_SURE * 1000);
}

// 90 saniyelik okuma/yazma geri sayımı
function soru2OkumaBaslat() {
    const sayac = document.getElementById('soru2-sayac-okuma');
    if (!sayac) return;

    soru2KalanOkuma = soru2OkumaSuresi;
    sayac.textContent = soru2KalanOkuma;

    soru2OkumaZamanlayici = setInterval(() => {
        soru2KalanOkuma -= 1;
        sayac.textContent = Math.max(soru2KalanOkuma, 0);

        if (soru2KalanOkuma <= 0) {
            clearInterval(soru2OkumaZamanlayici);
            soru2SorulariGoster(); // metin ve yazma kutusu kapanır
        }
    }, 1000);
}

// Metni gizle, soruları ve 15 sn geri sayımı başlat
function soru2SorulariGoster() {
    if (soru2MetinZamanlayici) clearInterval(soru2MetinZamanlayici);

    const okuma = document.getElementById('soru2-okuma');
    const sorular = document.getElementById('soru2-sorular');
    if (okuma) okuma.classList.add('hidden');
    if (sorular) sorular.classList.remove('hidden');

    const ilkKutu = document.getElementById('soru2-cevap1');
    if (ilkKutu) ilkKutu.focus();

    soru2CevapBaslat();
}

// 15 saniyelik cevaplama geri sayımı
function soru2CevapBaslat() {
    const sayac = document.getElementById('soru2-sayac-cevap');
    if (!sayac) return;

    soru2KalanCevap = SORU2_CEVAP_SURE;
    sayac.textContent = soru2KalanCevap;

    soru2CevapZamanlayici = setInterval(() => {
        soru2KalanCevap -= 1;
        sayac.textContent = Math.max(soru2KalanCevap, 0);

        if (soru2KalanCevap <= 0) {
            clearInterval(soru2CevapZamanlayici);
            soru2Cevapla(); // sure bitince otomatik degerlendir
        }
    }, 1000);
}

// Cevap metnini karsilastirma icin sadele
function soru2Normalize(metin) {
    return (metin || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

// Cevaplari kontrol et, dogru cevaplari goster
function soru2Cevapla() {
    if (soru2CevapZamanlayici) clearInterval(soru2CevapZamanlayici);

    const cevap1 = soru2Normalize(document.getElementById('soru2-cevap1').value);
    const cevap2 = soru2Normalize(document.getElementById('soru2-cevap2').value);

    const dogru1 = cevap1.includes('140'); // eşik sıcaklık değeri
    const dogru2 = cevap2.includes('kristal') || cevap2.includes('bağ') || cevap2.includes('bag');

    const dogruSayisi = (dogru1 ? 1 : 0) + (dogru2 ? 1 : 0);

    window.testSonuclari.cevaplar.soru2 = {
        cevap1: cevap1,
        cevap2: cevap2,
        dogru1: dogru1,
        dogru2: dogru2,
        dogruSayisi: dogruSayisi
    };

    soru2Gorsel = 0;
    soru2Deneyimsel = dogruSayisi * 50; // 2 x 50 = 100 puan

    document.getElementById('soru2-cevap1').disabled = true;
    document.getElementById('soru2-cevap2').disabled = true;
    document.getElementById('soru2-cevapla').classList.add('hidden');
    document.getElementById('soru2-sorular').classList.add('hidden');

    const puan = document.getElementById('soru2-puan');
    if (puan) puan.textContent = `Doğru sayısı: ${dogruSayisi} / 2`;

    const sonuc = document.getElementById('soru2-sonuc');
    if (sonuc) sonuc.classList.remove('hidden');
}

// 2. Soru Bittiğinde
function soru2Tamamla(gorsel, deneyimsel) {
    window.testSonuclari.gorselPuan += gorsel;
    window.testSonuclari.deneyimselPuan += deneyimsel;
    sonrakiSoruyaGec(3); // 3. soruya (yoksa sonuç ekranına) yonlendir
}

// Baslat
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.soru2-secim').forEach(btn => {
        btn.addEventListener('click', () => soru2Baslat(btn.dataset.mod));
    });

    const cevaplaBtn = document.getElementById('soru2-cevapla');
    if (cevaplaBtn) cevaplaBtn.addEventListener('click', soru2Cevapla);

    const devamBtn = document.getElementById('soru2-devam');
    if (devamBtn) {
        devamBtn.addEventListener('click', () => soru2Tamamla(soru2Gorsel, soru2Deneyimsel));
    }
});
