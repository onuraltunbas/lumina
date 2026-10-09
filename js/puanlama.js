// 1. Soru
function soru1_Hesapla(dogruMu, cozumSuresi) {
    if (!Boolean(dogruMu)) return 0; 

    cozumSuresi = isNaN(cozumSuresi) || cozumSuresi < 0 ? 0 : Number(cozumSuresi);
    let hamPuan = 100;
    let ceza = cozumSuresi > 5 ? Math.floor(cozumSuresi - 5) * 3 : 0;

    return Math.max(0, hamPuan - ceza); 
}

// 2. Soru
function soru2_Hesapla(kullaniciSiralama, dogruSiralama, cozumSuresi) {
    if (!Array.isArray(kullaniciSiralama) || !Array.isArray(dogruSiralama) || dogruSiralama.length < 2) return 0;

    let dogruBagSayisi = 0;
    let toplamBagSayisi = dogruSiralama.length - 1;
    let islenecekDizi = kullaniciSiralama.slice(0, dogruSiralama.length);
    if (new Set(islenecekDizi).size !== islenecekDizi.length) return 0;

    for (let i = 0; i < islenecekDizi.length - 1; i++) {
        let orjIndex = dogruSiralama.indexOf(islenecekDizi[i]);
        if (orjIndex !== -1 && orjIndex < dogruSiralama.length - 1) {
            if (dogruSiralama[orjIndex + 1] === islenecekDizi[i + 1]) dogruBagSayisi++;
        }
    }

    let hamPuan = (dogruBagSayisi / toplamBagSayisi) * 100;
    
    if (hamPuan > 0) {
        cozumSuresi = isNaN(cozumSuresi) || cozumSuresi < 0 ? 0 : Number(cozumSuresi);
        let ceza = 0;
        if (cozumSuresi > 15) ceza = 10 + (Math.floor(cozumSuresi - 15) * 3);
        else if (cozumSuresi > 5) ceza = Math.floor(cozumSuresi - 5) * 1;
        
        hamPuan -= ceza;
    }

    return Number(Math.max(0, hamPuan).toFixed(2)); 
}

// 3. Soru (4 harf sıralama - göreli)
function soru3_Hesapla(kullaniciSiralama, dogruSiralama, cozumSuresi) {
    if (!Array.isArray(kullaniciSiralama) || !Array.isArray(dogruSiralama) || dogruSiralama.length !== 4) return 0;

    let dogruBagSayisi = 0;
    let toplamBagSayisi = 3;
    let islenecekDizi = kullaniciSiralama.slice(0, 4);
    if (new Set(islenecekDizi).size !== islenecekDizi.length) return 0;

    for (let i = 0; i < islenecekDizi.length - 1; i++) {
        let orjIndex = dogruSiralama.indexOf(islenecekDizi[i]);
        if (orjIndex !== -1 && orjIndex < dogruSiralama.length - 1) {
            if (dogruSiralama[orjIndex + 1] === islenecekDizi[i + 1]) dogruBagSayisi++;
        }
    }

    let hamPuan = (dogruBagSayisi / toplamBagSayisi) * 100;

    if (hamPuan > 0) {
        cozumSuresi = isNaN(cozumSuresi) || cozumSuresi < 0 ? 0 : Number(cozumSuresi);
        let ceza = 0;
        if (cozumSuresi > 15) ceza = 10 + (Math.floor(cozumSuresi - 15) * 3);
        else if (cozumSuresi > 5) ceza = Math.floor(cozumSuresi - 5) * 1;
        hamPuan -= ceza;
    }

    return Number(Math.max(0, hamPuan).toFixed(2));
}

// 4. Soru
function soru4_Hesapla(dogruA, dogruB, cozumSuresi) {
    let hamPuan = (Boolean(dogruA) ? 50 : 0) + (Boolean(dogruB) ? 50 : 0);

    if (hamPuan > 0) {
        cozumSuresi = isNaN(cozumSuresi) || cozumSuresi < 0 ? 0 : Number(cozumSuresi);
        let ceza = 0;
        if (cozumSuresi > 15) ceza = 10 + (Math.floor(cozumSuresi - 15) * 3);
        else if (cozumSuresi > 5) ceza = Math.floor(cozumSuresi - 5) * 1;

        hamPuan -= ceza;
    }

    return Math.max(0, hamPuan); 
}

// 5. Soru
function soru5_Hesapla(kullaniciCevapDizisi, hedefCevaplar) {
    if (!Array.isArray(kullaniciCevapDizisi) || !Array.isArray(hedefCevaplar) || hedefCevaplar.length === 0) return 0;

    let temizKullaniciCevaplari = [...new Set(
        kullaniciCevapDizisi
            .filter(c => typeof c === 'string' && c.trim() !== '')
            .map(c => c.toLocaleLowerCase('tr-TR').trim())
    )];

    let temizHedefCevaplar = hedefCevaplar
        .filter(c => typeof c === 'string')
        .map(c => c.toLocaleLowerCase('tr-TR').trim());

    let dogruPuanToplami = 0;
    let cezaToplami = 0;
    let basariDegeri = 100 / temizHedefCevaplar.length; 

    temizKullaniciCevaplari.forEach((cevap, index) => {
        if (temizHedefCevaplar.includes(cevap)) {
            dogruPuanToplami += basariDegeri;
        } else {
            if (index < 6) cezaToplami += 3;
            else cezaToplami += 5;
        }
    });

    let hesaplananPuan = dogruPuanToplami - cezaToplami;

    return Number(Math.max(0, Math.min(100, hesaplananPuan)).toFixed(2));
}
