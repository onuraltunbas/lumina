// ===== 4. Soru: Yazarak Öğrenme (Kurgusal Metin & Boşluk Doldurma) =====
// Mantık: Zeynep'in 2. sorusu (Zeta-4 Biyo-Polimeri)

const SORU4_SURESI = {
    telefon: 50,
    bilgisayar: 65,
    kagit: 90
};
const SORU4_CEVAP_SURE = 15; // Cevaplama süresi (saniye)

let soru4SecilenMod = 'kagit';
let soru4OkumaSuresi = SORU4_SURESI.kagit;
let soru4MetinKaymaSuresi = 18; // süresi / 5 (8. Kural)
let soru4KalanOkuma = soru4OkumaSuresi;
let soru4KalanCevap = SORU4_CEVAP_SURE;
let soru4OkumaZamanlayici = null;
let soru4CevapZamanlayici = null;
let soru4MetinZamanlayici = null;

const SORU4_METIN_PARCALARI = [
    'Yeni sentezlenen Zeta-4 polimeri,',
    'yüksek sıcaklık altında aşamalı bir tepkime gösterir.',
    'Sıcaklık 140°C seviyesine ulaştığında',
    'malzeme iç yapısındaki kristal bağlar gevşeyerek',
    'esnek forma geçer.'
];

let soru4YazarakPuan = 0;

function soru4Baslat(mod) {
    soru4SecilenMod = mod;
    soru4OkumaSuresi = SORU4_SURESI[mod] || SORU4_SURESI.kagit;
    soru4MetinKaymaSuresi = soru4OkumaSuresi / 5; // Her yazma şekline göre süresi / 5 olarak kaysın

    const giris = document.getElementById('soru4-giris');
    if (giris) giris.classList.add('hidden');

    const yazmaAlani = document.getElementById('soru4-yazma-alani');
    if (yazmaAlani) {
        if (mod === 'kagit') {
            yazmaAlani.classList.add('hidden');
        } else {
            yazmaAlani.classList.remove('hidden');
        }
    }

    const okuma = document.getElementById('soru4-okuma');
    if (okuma) okuma.classList.remove('hidden');
    
    soru4MetinAkisiniBaslat();
    soru4OkumaBaslat();
}

function soru4MetinAkisiniBaslat() {
    const kap = document.getElementById('soru4-metin');
    if (!kap) return;
    kap.innerHTML = '';

    let i = 0;
    const parcaGoster = () => {
        if (i >= SORU4_METIN_PARCALARI.length) {
            clearInterval(soru4MetinZamanlayici);
            return;
        }
        const parca = document.createElement('span');
        parca.className = 'scrolling-text-item';
        parca.textContent = SORU4_METIN_PARCALARI[i];
        kap.appendChild(parca);

        // Aynı anda en fazla 2 satır görünsün
        while (kap.children.length > 2) {
            kap.removeChild(kap.firstElementChild);
        }

        i += 1;
    };

    parcaGoster();
    soru4MetinZamanlayici = setInterval(parcaGoster, soru4MetinKaymaSuresi * 1000);
}

function soru4OkumaBaslat() {
    const sayac = document.getElementById('soru4-sayac-okuma');
    const timerBar = document.getElementById('soru4-timer-bar-okuma');
    if (!sayac) return;

    soru4KalanOkuma = soru4OkumaSuresi;
    sayac.textContent = soru4KalanOkuma;
    if (timerBar) timerBar.style.width = '100%';

    if (soru4OkumaZamanlayici) clearInterval(soru4OkumaZamanlayici);

    soru4OkumaZamanlayici = setInterval(() => {
        soru4KalanOkuma -= 1;
        sayac.textContent = Math.max(soru4KalanOkuma, 0);
        if (timerBar) timerBar.style.width = `${(Math.max(soru4KalanOkuma, 0) / soru4OkumaSuresi) * 100}%`;

        if (soru4KalanOkuma <= 0) {
            clearInterval(soru4OkumaZamanlayici);
            if (soru4MetinZamanlayici) clearInterval(soru4MetinZamanlayici);

            const okuma = document.getElementById('soru4-okuma');
            if (okuma) okuma.classList.add('hidden');

            // 9. Kural: Kağıt seçeneğini seçenler için ara uyarı
            if (soru4SecilenMod === 'kagit') {
                const kagitUyari = document.getElementById('soru4-kagit-uyari');
                if (kagitUyari) {
                    kagitUyari.classList.remove('hidden');
                } else {
                    soru4SorulariGoster();
                }
            } else {
                soru4SorulariGoster();
            }
        }
    }, 1000);
}

let soru4BaslangicZamani = 0;

function soru4SorulariGoster() {
    if (soru4MetinZamanlayici) clearInterval(soru4MetinZamanlayici);

    const okuma = document.getElementById('soru4-okuma');
    const kagitUyari = document.getElementById('soru4-kagit-uyari');
    const sorular = document.getElementById('soru4-sorular');

    if (okuma) okuma.classList.add('hidden');
    if (kagitUyari) kagitUyari.classList.add('hidden');
    if (sorular) sorular.classList.remove('hidden');

    soru4BaslangicZamani = Date.now();

    const ilkKutu = document.getElementById('soru4-cevap1');
    if (ilkKutu) ilkKutu.focus();
}

function soru4Normalize(metin) {
    return (metin || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function soru4Cevapla() {
    if (soru4CevapZamanlayici) clearInterval(soru4CevapZamanlayici);

    const input1 = document.getElementById('soru4-cevap1');
    const input2 = document.getElementById('soru4-cevap2');
    const cevap1 = soru4Normalize(input1 ? input1.value : '');
    const cevap2 = soru4Normalize(input2 ? input2.value : '');

    const dogru1 = cevap1.includes('140');
    const dogru2 = cevap2.includes('kristal') || cevap2.includes('bağ') || cevap2.includes('bag');

    const cozumSuresi = soru4BaslangicZamani > 0 ? (Date.now() - soru4BaslangicZamani) / 1000 : 0;
    const dogruSayisi = (dogru1 ? 1 : 0) + (dogru2 ? 1 : 0);
    soru4YazarakPuan = soru4_Hesapla(dogru1, dogru2, cozumSuresi);

    window.testSonuclari.yazarakPuan = soru4YazarakPuan;
    window.testSonuclari.cevaplar.soru4 = {
        cevap1,
        cevap2,
        dogru1,
        dogru2,
        dogruSayisi,
        sure: cozumSuresi,
        puan: soru4YazarakPuan
    };

    if (input1) input1.disabled = true;
    if (input2) input2.disabled = true;

    const sorular = document.getElementById('soru4-sorular');
    if (sorular) sorular.classList.add('hidden');

    const puanText = document.getElementById('soru4-puan-text');
    if (puanText) puanText.innerHTML = `✅ Doğru sayısı: <strong>${dogruSayisi} / 2</strong>`;

    const sonuc = document.getElementById('soru4-sonuc');
    if (sonuc) sonuc.classList.remove('hidden');

    if (dogruSayisi === 2 && typeof confetti === 'function') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
}

function soru4Tamamla() {
    sonrakiSoruyaGec(5);
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.method-card').forEach(btn => {
        btn.addEventListener('click', () => soru4Baslat(btn.dataset.mod));
    });

    const kagitUyariBtn = document.getElementById('soru4-kagit-uyari-btn');
    if (kagitUyariBtn) {
        kagitUyariBtn.addEventListener('click', soru4SorulariGoster);
    }

    const cevaplaBtn = document.getElementById('soru4-cevapla-btn');
    if (cevaplaBtn) cevaplaBtn.addEventListener('click', soru4Cevapla);

    const devamBtn = document.getElementById('soru4-devam-btn');
    if (devamBtn) devamBtn.addEventListener('click', soru4Tamamla);
});
