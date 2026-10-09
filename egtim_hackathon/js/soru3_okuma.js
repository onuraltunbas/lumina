// ===== 3. Soru: Okuyarak Öğrenme (Kronolojik Sıralama) =====
// Mantık: Zeynep'in 1. sorusu (Yemekhane süreci)

const SORU3_SURE = 20;                        // Okuma süresi (saniye)
const SORU3_DOGRU_SIRA = ['B', 'C', 'D', 'A']; // Doğru kronolojik sıra

let soru3KalanSure = SORU3_SURE;
let soru3TimerInterval = null;
let soru3OkumaPuan = 0;

function soru3OkumaBaslat() {
    const sayac = document.getElementById('soru3-sayac');
    const timerBar = document.getElementById('soru3-timer-bar');
    if (!sayac) return;

    soru3KalanSure = SORU3_SURE;
    sayac.textContent = soru3KalanSure;
    if (timerBar) timerBar.style.width = '100%';

    if (soru3TimerInterval) clearInterval(soru3TimerInterval);

    soru3TimerInterval = setInterval(() => {
        soru3KalanSure -= 1;
        sayac.textContent = Math.max(soru3KalanSure, 0);
        if (timerBar) timerBar.style.width = `${(Math.max(soru3KalanSure, 0) / SORU3_SURE) * 100}%`;

        if (soru3KalanSure <= 0) {
            clearInterval(soru3TimerInterval);
            soru3SiralamaGoster();
        }
    }, 1000);
}

let soru3BaslangicZamani = 0;

function soru3SiralamaGoster() {
    const okumaAlani = document.getElementById('soru3-okuma');
    const siralamaAlani = document.getElementById('soru3-siralama');
    if (okumaAlani) okumaAlani.classList.add('hidden');
    if (siralamaAlani) siralamaAlani.classList.remove('hidden');

    soru3BaslangicZamani = Date.now();

    const ilkKutu = document.querySelector('#soru3-siralama .sort-input');
    if (ilkKutu) ilkKutu.focus();
}

function soru3KutulariAyarla() {
    const kutular = document.querySelectorAll('#soru3-siralama .sort-input');

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

    const kontrolBtn = document.getElementById('soru3-kontrol-btn');
    if (kontrolBtn) kontrolBtn.addEventListener('click', soru3KontrolEt);
}

function soru3KontrolEt() {
    const kutular = document.querySelectorAll('#soru3-siralama .sort-input');
    const cevaplar = Array.from(kutular).map(k => k.value.trim().toUpperCase());

    const cozumSuresi = soru3BaslangicZamani > 0 ? (Date.now() - soru3BaslangicZamani) / 1000 : 0;

    // Bağlam (bağ) sayısını hesapla
    let dogruBagSayisi = 0;
    let islenecekDizi = cevaplar.slice(0, 4);
    if (new Set(islenecekDizi).size === islenecekDizi.length) {
        for (let i = 0; i < islenecekDizi.length - 1; i++) {
            let orjIndex = SORU3_DOGRU_SIRA.indexOf(islenecekDizi[i]);
            if (orjIndex !== -1 && orjIndex < SORU3_DOGRU_SIRA.length - 1) {
                if (SORU3_DOGRU_SIRA[orjIndex + 1] === islenecekDizi[i + 1]) dogruBagSayisi++;
            }
        }
    }

    const tamDogruMu = cevaplar.join('') === SORU3_DOGRU_SIRA.join('');

    soru3OkumaPuan = soru3_Hesapla(cevaplar, SORU3_DOGRU_SIRA, cozumSuresi);
    window.testSonuclari.okumaPuan = soru3OkumaPuan;
    window.testSonuclari.cevaplar.soru3 = {
        cevap: cevaplar.join(''),
        dogruSira: SORU3_DOGRU_SIRA.join(''),
        dogruBagSayisi: dogruBagSayisi,
        sure: cozumSuresi,
        puan: soru3OkumaPuan
    };

    kutular.forEach(k => k.disabled = true);
    const kontrolBtn = document.getElementById('soru3-kontrol-btn');
    if (kontrolBtn) kontrolBtn.classList.add('hidden');

    const puanText = document.getElementById('soru3-puan-text');
    if (puanText) {
        if (tamDogruMu) {
            puanText.innerHTML = `✅ <strong>3 bağlam doğru (Doğru sıralama)</strong>`;
        } else if (dogruBagSayisi > 0) {
            puanText.innerHTML = `✅ <strong>${dogruBagSayisi} bağlam doğru ama yerleri yanlış</strong>`;
        } else {
            puanText.innerHTML = `❌ <strong>0 bağlam doğru</strong>`;
        }
    }

    const sonuc = document.getElementById('soru3-sonuc');
    if (sonuc) sonuc.classList.remove('hidden');

    if (tamDogruMu && typeof confetti === 'function') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
}

function soru3Tamamla() {
    sonrakiSoruyaGec(4);
}

document.addEventListener('DOMContentLoaded', () => {
    soru3KutulariAyarla();

    const devamBtn = document.getElementById('soru3-devam-btn');
    if (devamBtn) {
        devamBtn.addEventListener('click', soru3Tamamla);
    }
});
