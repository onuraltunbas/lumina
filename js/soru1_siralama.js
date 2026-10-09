// ===== 1. Soru: Kronolojik Sıralama (Metinden hatırlama) =====
// HTML: index.html icindeki #soru-1 div'i

const SORU1_SURE = 20;                        // okuma suresi (saniye)
const SORU1_DOGRU_SIRA = ['B', 'C', 'D', 'A']; // dogru kronolojik sira

let soru1KalanSure = SORU1_SURE;
let soru1Gorsel = 0;
let soru1Deneyimsel = 0;

// Okuma alanini goster, geri sayimi baslat
function soru1OkumaBaslat() {
    const sayac = document.getElementById('soru1-sayac');
    if (!sayac) return;

    soru1KalanSure = SORU1_SURE;
    sayac.textContent = soru1KalanSure;

    const zamanlayici = setInterval(() => {
        soru1KalanSure -= 1;
        sayac.textContent = Math.max(soru1KalanSure, 0);

        if (soru1KalanSure <= 0) {
            clearInterval(zamanlayici);
            soru1SiralamaGoster(); // sure bitince metni gizle, kutulari ac
        }
    }, 1000);
}

// Metni gizle, siralama kutularini goster
function soru1SiralamaGoster() {
    const okumaAlani = document.getElementById('soru1-okuma');
    const siralamaAlani = document.getElementById('soru1-siralama');
    if (okumaAlani) okumaAlani.classList.add('hidden');
    if (siralamaAlani) siralamaAlani.classList.remove('hidden');

    const ilkKutu = document.querySelector('#soru1-siralama .soru1-kutu');
    if (ilkKutu) ilkKutu.focus();
}

// Kutulara sadece A-D harfi girilmesini sagla ve otomatik ilerle
function soru1KutulariAyarla() {
    const kutular = document.querySelectorAll('#soru1-siralama .soru1-kutu');

    kutular.forEach((kutu, i) => {
        kutu.addEventListener('input', () => {
            kutu.value = kutu.value.toUpperCase().replace(/[^A-D]/g, '').slice(0, 1);
            if (kutu.value && i < kutular.length - 1) {
                kutular[i + 1].focus();
            }
        });

        kutu.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !kutu.value && i > 0) {
                kutular[i - 1].focus();
            }
        });
    });

    const kontrolBtn = document.getElementById('soru1-kontrol');
    if (kontrolBtn) kontrolBtn.addEventListener('click', soru1KontrolEt);
}

// Cevaplari kontrol et, dogru cevabi goster
function soru1KontrolEt() {
    const kutular = document.querySelectorAll('#soru1-siralama .soru1-kutu');
    const cevaplar = Array.from(kutular).map(k => k.value.trim().toUpperCase());

    let dogruSayisi = 0;
    cevaplar.forEach((harf, i) => {
        if (harf === SORU1_DOGRU_SIRA[i]) dogruSayisi += 1;
    });

    window.testSonuclari.cevaplar.soru1 = {
        cevap: cevaplar.join(''),
        dogruSira: SORU1_DOGRU_SIRA.join(''),
        dogruSayisi: dogruSayisi
    };

    soru1Gorsel = dogruSayisi * 25; // 4 x 25 = 100 puan
    soru1Deneyimsel = 0;

    kutular.forEach(k => k.disabled = true);
    const kontrolBtn = document.getElementById('soru1-kontrol');
    if (kontrolBtn) kontrolBtn.classList.add('hidden');

    const puan = document.getElementById('soru1-puan');
    if (puan) puan.textContent = `Doğru sayısı: ${dogruSayisi} / 4`;

    const sonuc = document.getElementById('soru1-sonuc');
    if (sonuc) sonuc.classList.remove('hidden');
}

// 1. Soru Bittiğinde
function soru1Tamamla(gorsel, deneyimsel) {
    window.testSonuclari.gorselPuan += gorsel;
    window.testSonuclari.deneyimselPuan += deneyimsel;
    sonrakiSoruyaGec(2); // 2. soruya yonlendir
}

// Baslat
document.addEventListener('DOMContentLoaded', () => {
    soru1OkumaBaslat();
    soru1KutulariAyarla();

    const devamBtn = document.getElementById('soru1-devam');
    if (devamBtn) {
        devamBtn.addEventListener('click', () => soru1Tamamla(soru1Gorsel, soru1Deneyimsel));
    }
});
