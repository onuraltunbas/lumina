// ===== 2. Soru: Yazarak Öğrenme =====
// HTML: index.html icindeki #soru-2 div'i

const SORU2_OKUMA_SURE = 90; // okuma + yazma suresi (saniye)
const SORU2_CEVAP_SURE = 15; // cevaplama suresi (saniye)

let soru2KalanOkuma = SORU2_OKUMA_SURE;
let soru2KalanCevap = SORU2_CEVAP_SURE;
let soru2OkumaZamanlayici = null;
let soru2CevapZamanlayici = null;

let soru2Gorsel = 0;
let soru2Deneyimsel = 0;

// Yönergeden okuma alanına geç
function soru2Baslat() {
    const giris = document.getElementById('soru2-giris');
    const okuma = document.getElementById('soru2-okuma');
    if (giris) giris.classList.add('hidden');
    if (okuma) okuma.classList.remove('hidden');
    soru2OkumaBaslat();
}

// 90 saniyelik okuma/yazma geri sayımı
function soru2OkumaBaslat() {
    const sayac = document.getElementById('soru2-sayac-okuma');
    if (!sayac) return;

    soru2KalanOkuma = SORU2_OKUMA_SURE;
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
    const baslaBtn = document.getElementById('soru2-basla');
    if (baslaBtn) baslaBtn.addEventListener('click', soru2Baslat);

    const cevaplaBtn = document.getElementById('soru2-cevapla');
    if (cevaplaBtn) cevaplaBtn.addEventListener('click', soru2Cevapla);

    const devamBtn = document.getElementById('soru2-devam');
    if (devamBtn) {
        devamBtn.addEventListener('click', () => soru2Tamamla(soru2Gorsel, soru2Deneyimsel));
    }
});
