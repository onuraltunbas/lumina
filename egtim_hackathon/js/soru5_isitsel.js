// ===== 5. Soru: İşitsel Öğrenme (Dinleme & Çoklu Liste Belleği) =====
// Mantık: Zeynep'in 3. sorusu (Vivienne Ses Kaydı & Kafe Nesneleri)

const SORU5_DOGRU_NESNELER = ['şemsiye', 'elma', 'fotoğraf makinesi', 'çorap', 'vida', 'kalem'];

let soru5EklenenSayisi = 1;
let soru5IsitselPuan = 0;

function soru5Baslat() {
    const giris = document.getElementById('soru5-giris');
    if (giris) giris.classList.add('hidden');

    const dinleme = document.getElementById('soru5-dinleme');
    if (dinleme) dinleme.classList.remove('hidden');

    const ses = document.getElementById('soru5-ses');
    if (ses) {
        ses.currentTime = 0;
        ses.play().catch(err => {
            console.warn("Otomatik oynatma tarayıcı tarafından engellendi:", err);
        });
    }
}

function soru5SesBitti() {
    const dinleme = document.getElementById('soru5-dinleme');
    if (dinleme) dinleme.classList.add('hidden');

    const sorular = document.getElementById('soru5-sorular');
    if (sorular) sorular.classList.remove('hidden');

    const ilkKutu = document.querySelector('#soru5-kutular .soru5-kutu');
    if (ilkKutu) ilkKutu.focus();
}

function soru5EkleKutu() {
    const konteyner = document.getElementById('soru5-kutular');
    if (!konteyner) return;

    const mevcutKutuSayisi = document.querySelectorAll('#soru5-kutular .soru5-kutu').length;
    if (mevcutKutuSayisi >= 6) {
        const ekleBtn = document.getElementById('soru5-ekle-btn');
        if (ekleBtn) ekleBtn.style.display = 'none';
        return;
    }

    const yeniSayisi = mevcutKutuSayisi + 1;
    const div = document.createElement('div');
    div.className = 'input-line';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'soru5-kutu glass-input';
    input.placeholder = `Nesne ${yeniSayisi}`;
    input.autocomplete = 'off';

    div.appendChild(input);
    konteyner.appendChild(div);
    input.focus();

    if (yeniSayisi >= 6) {
        const ekleBtn = document.getElementById('soru5-ekle-btn');
        if (ekleBtn) ekleBtn.style.display = 'none';
    }
}

function soru5Normalizasyon(m) {
    return (m || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function soru5Degerlendir() {
    const kutular = document.querySelectorAll('#soru5-kutular .soru5-kutu');
    const girilenCevaplar = new Set();

    kutular.forEach(k => {
        const v = soru5Normalizasyon(k.value);
        if (v) girilenCevaplar.add(v);
    });

    const FOTO_VARYANT = new Set([
        'fotograf makinesi',
        'fotoğraf makinesi',
        'foto makinesi',
        'fotograf makine',
        'fotoğraf makine',
        'fotografcik',
        'fotograf'
    ]);

    const dogruFinal = new Set();

    girilenCevaplar.forEach(v => {
        if (v === 'semsiye') dogruFinal.add('şemsiye');
        if (v === 'elma') dogruFinal.add('elma');
        if (FOTO_VARYANT.has(v)) dogruFinal.add('fotoğraf makinesi');
        if (v === 'corap') dogruFinal.add('çorap');
        if (v === 'vida') dogruFinal.add('vida');
        if (v === 'kalem') dogruFinal.add('kalem');
    });

    const dogruAdet = dogruFinal.size;
    soru5IsitselPuan = Math.round((dogruAdet / 6) * 100);

    window.testSonuclari.isitselPuan = soru5IsitselPuan;
    window.testSonuclari.cevaplar.soru5 = {
        girilenler: Array.from(girilenCevaplar),
        hatirlananlar: Array.from(dogruFinal),
        dogruAdet: dogruAdet,
        puan: soru5IsitselPuan
    };

    const sorular = document.getElementById('soru5-sorular');
    if (sorular) sorular.classList.add('hidden');

    const puanText = document.getElementById('soru5-puan-text');
    if (puanText) {
        puanText.innerHTML = `✅ Hatırlanan hedef nesne sayısı: <strong>${dogruAdet} / 6</strong>`;
    }

    const sonuc = document.getElementById('soru5-sonuc');
    if (sonuc) sonuc.classList.remove('hidden');

    if (dogruAdet >= 4 && typeof confetti === 'function') {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
}

function soru5Tamamla() {
    sonrakiSoruyaGec(6); // Sonuç raporu ekranı
}

document.addEventListener('DOMContentLoaded', () => {
    const baslaBtn = document.getElementById('soru5-basla-btn');
    if (baslaBtn) baslaBtn.addEventListener('click', soru5Baslat);

    const ekleBtn = document.getElementById('soru5-ekle-btn');
    if (ekleBtn) ekleBtn.addEventListener('click', soru5EkleKutu);

    const tamamBtn = document.getElementById('soru5-tamam-btn');
    if (tamamBtn) tamamBtn.addEventListener('click', soru5Degerlendir);

    const ses = document.getElementById('soru5-ses');
    if (ses) ses.addEventListener('ended', soru5SesBitti);

    const devamBtn = document.getElementById('soru5-devam-btn');
    if (devamBtn) devamBtn.addEventListener('click', soru5Tamamla);
});
