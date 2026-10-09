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

    // 1) "fotoğraf makinesi" varyasyonlari (space/aksan)

    // Analiz
    const DOGRU_L = ['semsiye', 'elma', 'fotoğraf makinesi', 'çorap', 'vida', 'kalem'];
    const yazdik = Array.from(cevaplar);

    const FOTO_VARYANT_SET = new Set([
        'fotograf makinesi',
        'fotoğraf makinesi',
        'foto makinesi',
        'fotograf makine',
        'fotoğraf makine',
        'fotografcik',
        'fotograf'
    ]);

    const yazilanKabul = new Set();
    yazdik.forEach(v => {
        if (v === 'semsiye') yazilanKabul.add('semsiye');
        if (v === 'elma') yazilanKabul.add('elma');
        if (FOTO_VARYANT_SET.has(v)) yazilanKabul.add('fotoğraf makinesi');
        if (v === 'corap') yazilanKabul.add('çorap');
        if (v === 'vida') yazilanKabul.add('vida');
        if (v === 'kalem') yazilanKabul.add('kalem');
    });

    const dogruListesi = [];
    const eksikListesi = [];
    DOGRU_L.forEach(d => {
        if (yazilanKabul.has(d)) dogruListesi.push(d);
        else eksikListesi.push(d);
    });

    const yanlisListesi = [];
    const farkli = [];
    yazdik.forEach(v => {
        let eslesti = false;
        if (v === 'semsiye' || v === 'elma' || v === 'çorap' || v === 'vida' || v === 'kalem') eslesti = true;
        if (FOTO_VARYANT_SET.has(v)) eslesti = true;
        if (!eslesti) {
            farkli.push(v);
            yanlisListesi.push(v);
        }
    });

    const dogruAdet = dogruListesi.length;
    const puan = Math.round((dogruAdet / 6) * 100);

    window.testSonuclari.cevaplar.soru3 = {
        cevaplar: Array.from(cevaplar),
        dogruAdet: dogruAdet,
        puan: puan,
        analiz: {
            yazdik: yazdik,
            dogru: dogruListesi,
            yanlis: yanlisListesi,
            eksik: eksikListesi
        }
    };

    // Sonuç ekranını göster
    document.getElementById('soru3-sorular').classList.add('hidden');
    const sonuc = document.getElementById('soru3-sonuc');
    if (sonuc) sonuc.classList.remove('hidden');

    const analizDiv = document.getElementById('soru3-analiz');
    if (analizDiv) {
        analizDiv.innerHTML = '';
        const ekle = (baslik, liste) => {
            if (!liste.length) return;
            const p = document.createElement('p');
            p.innerHTML = '<strong>' + baslik + ':</strong> ' + liste.join(', ');
            analizDiv.appendChild(p);
        };
        ekle('Doğru yazdıklarınız', dogruListesi);
        ekle('Eksik bıraktıklarınız (doğru ama yazmamışsınız)', eksikListesi);
        ekle('Yanlış yazdıklarınız', yanlisListesi);
        if (farkli.length) ekle('Diğer yazdıklarınız (farklı terimler)', farkli);
    }

    const puanEl = document.getElementById('soru3-puan');
    if (puanEl) puanEl.textContent = `Puanınız: ${puan} / 100 (Doğru: ${dogruAdet} / 6)`;

    const devamBtn = document.getElementById('soru3-devam');
    if (devamBtn) {
        devamBtn.onclick = () => soru3Tamamla(puan, 0);
    }
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
