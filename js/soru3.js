// ===== 3. Soru: Dinleme + Bellek (Esnek Liste) =====
// HTML: index.html icindeki #soru-3 div'i

// Dogru cevaplar
const SORU3_DOGRU = new Set(['semsiye', 'elma', 'fotoğraf makinesi', 'çorap', 'vida', 'kalem']);

let soru3EklenenSayisi = 0;

function soru3Baslat() {
    const giris = document.getElementById('soru3-giris');
    if (giris) giris.classList.add('hidden');

    const dinleme = document.getElementById('soru3-dinleme');
    if (dinleme) dinleme.classList.remove('hidden');

    const ses = document.getElementById('soru3-ses');
    if (ses) {
        ses.currentTime = 0;
        ses.play().catch(() => { /* tarayici engelleyebilir */ });
    }
}

function soru3SesBitti() {
    const dinleme = document.getElementById('soru3-dinleme');
    if (dinleme) dinleme.classList.add('hidden');

    const sorular = document.getElementById('soru3-sorular');
    if (sorular) sorular.classList.remove('hidden');

    const ekleBtn = document.getElementById('soru3-ekle');
    if (ekleBtn) ekleBtn.focus();
}

function soru3EkleKutu() {
    const konteyner = document.getElementById('soru3-kutular');
    if (!konteyner) return;

    soru3EklenenSayisi += 1;
    const div = document.createElement('div');
    div.className = 'soru3-satir';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'soru3-kutu';
    input.placeholder = `Nesne ${soru3EklenenSayisi}`;
    input.autocomplete = 'off';

    div.appendChild(input);
    konteyner.appendChild(div);
    input.focus();
}

function soru3Normalizasyon(m) {
    return (m || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // aksanlari temizle
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function soru3Degerlendir() {
    const kutular = document.querySelectorAll('#soru3-kutular .soru3-kutu');
    const cevaplar = new Set();

    kutular.forEach(k => {
        const v = soru3Normalizasyon(k.value);
        if (v) cevaplar.add(v);
    });

    let dogruSayisi = 0;
    const dogruBulunan = new Set();

    // kesin eslestirme: semsiye, elma, fotograf makinesi, corap, vida, kalem
    SORU3_DOGRU.forEach(d => dogruBulunan.add(d));
    // fotograf makinesi varyasyon
    ['fotograf makinesi', 'fotograf makine', 'foto makinesi'].forEach(v => {
        if (cevaplar.has(v)) dogruSayisi += 1;
    });
    ['semsiye'].forEach(v => { if (cevaplar.has(v)) dogruSayisi += 1; });
    ['elma'].forEach(v => { if (cevaplar.has(v)) dogruSayisi += 1; });
    ['corap'].forEach(v => { if (cevaplar.has(v)) dogruSayisi += 1; });
    ['vida'].forEach(v => { if (cevaplar.has(v)) dogruSayisi += 1; });
    ['kalem'].forEach(v => { if (cevaplar.has(v)) dogruSayisi += 1; });

    // net puanlama: her dogru nesne 100/6
    const dogruFinal = new Set();
    cevaplar.forEach(v => {
        if (v === 'semsiye') dogruFinal.add('semsiye');
        if (v === 'elma') dogruFinal.add('elma');
        if (v === 'fotograf makinesi' || v === 'fotoğraf makinesi' || v === 'foto makinesi') dogruFinal.add('fotoğraf makinesi');
        if (v === 'corap') dogruFinal.add('çorap');
        if (v === 'vida') dogruFinal.add('vida');
        if (v === 'kalem') dogruFinal.add('kalem');
    });

    const dogruAdet = dogruFinal.size;
    const puan = Math.round((dogruAdet / 6) * 100);

    window.testSonuclari.cevaplar.soru3 = {
        cevaplar: Array.from(cevaplar),
        dogruAdet: dogruAdet,
        puan: puan
    };

    soru3Tamamla(puan, 0); // görsel puan olarak kaydet
}

function soru3Tamamla(gorsel, deneyimsel) {
    window.testSonuclari.gorselPuan += gorsel;
    window.testSonuclari.deneyimselPuan += deneyimsel;
    sonrakiSoruyaGec(4); // sonuç ekranına
}

document.addEventListener('DOMContentLoaded', () => {
    const basla = document.getElementById('soru3-basla');
    if (basla) basla.addEventListener('click', soru3Baslat);

    const ekle = document.getElementById('soru3-ekle');
    if (ekle) ekle.addEventListener('click', soru3EkleKutu);

    const tikla = document.getElementById('soru3-tamam');
    if (tikla) tikla.addEventListener('click', soru3Degerlendir);

    const ses = document.getElementById('soru3-ses');
    if (ses) ses.addEventListener('ended', soru3SesBitti);
});
