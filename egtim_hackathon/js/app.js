// ===== LUMINA & EDTECH HACKATHON: ANA TEST KONTROLCÜSÜ =====
// 5 Temel Öğrenme Stili Entegrasyonu:
// 1. Deneyimsel (Molekül Laboratuvarı)
// 2. Görsel Hafıza (Ahşap Tepsi & Nesneler)
// 3. Okuyarak (Kronolojik Sıralama)
// 4. Yazarak (Zeta-4 Biyo-Polimeri)
// 5. İşitsel (Ses Kaydı Dinleme & Bellek)

window.testSonuclari = {
    deneyimselPuan: 0,
    gorselPuan: 0,
    okumaPuan: 0,
    yazarakPuan: 0,
    isitselPuan: 0,
    cevaplar: {}
};

// Soru Geçiş Fonksiyonu
function sonrakiSoruyaGec(sonrakiSoruNo) {
    const kartlar = document.querySelectorAll('.soru-kart');
    kartlar.forEach(kart => kart.classList.add('hidden'));

    // İlerleme göstergesini güncelle
    adimGostergesiniGuncelle(sonrakiSoruNo);

    if (sonrakiSoruNo > 5) {
        sonucEkraniGoster();
        return;
    }

    const aktifSoru = document.getElementById(`soru-${sonrakiSoruNo}`);
    if (aktifSoru) {
        aktifSoru.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 3. Soruya gelindiğinde okuma sayacını otomatik tetikle
        if (sonrakiSoruNo === 3 && typeof soru3OkumaBaslat === 'function') {
            soru3OkumaBaslat();
        }
    } else {
        sonucEkraniGoster();
    }
}

// Üst Adım Göstergesi
function adimGostergesiniGuncelle(adimNo) {
    const adimlar = document.querySelectorAll('.step-indicator-item');
    adimlar.forEach((adim, index) => {
        const adimIndex = index + 1;
        adim.classList.remove('active', 'completed');
        if (adimIndex < adimNo) {
            adim.classList.add('completed');
        } else if (adimIndex === adimNo) {
            adim.classList.add('active');
        }
    });

    const progressContainer = document.getElementById('test-progress-bar-container');
    if (progressContainer) {
        if (adimNo > 5) {
            progressContainer.classList.add('hidden');
        } else {
            progressContainer.classList.remove('hidden');
        }
    }
}

// ==========================================
// PUANLAMA ALGORİTMALARI
// ==========================================

// ==========================================
// PUANLAMA ALGORİTMALARI (GÜNCEL)
// ==========================================

// 1. Soru
function soru1_Hesapla(dogruMu, cozumSuresi) {
    if (!Boolean(dogruMu)) return 0;

    cozumSuresi = isNaN(cozumSuresi) || cozumSuresi < 0 ? 0 : Number(cozumSuresi);
    let hamPuan = 100;
    let ceza = cozumSuresi > 5 ? Math.floor(cozumSuresi - 5) * 3 : 0;

    return Math.max(0, hamPuan - ceza);
}

// 2. Soru (Göreli Kutu Sıralaması)
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
        let ceza = cozumSuresi > 5 ? Math.floor(cozumSuresi - 5) * 1 : 0;

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

// 1. Soru (Molekül Testi) Tamamlandığında
function soru1Tamamla(puan) {
    window.testSonuclari.deneyimselPuan = puan;
    
    setTimeout(() => {
        sonrakiSoruyaGec(2);
    }, 1200);
}

// Sonuç Raporu Ekranı
function sonucEkraniGoster() {
    const sonucKart = document.getElementById('sonuc-ekrani');
    if (!sonucKart) return;

    sonucKart.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 5 Saniye "Bilgileriniz Analiz Ediliyor..." Buton Geri Sayımı
    let kalanSure = 5;
    const btnAnaliz = document.getElementById('btn-analiz-durum');
    const yaziEl = document.getElementById('analiz-btn-yazi');
    const iconEl = document.getElementById('analiz-icon');

    if (btnAnaliz && yaziEl) {
        btnAnaliz.disabled = true;
        btnAnaliz.style.cursor = 'not-allowed';
        btnAnaliz.style.opacity = '0.85';
        yaziEl.textContent = `Bilgileriniz Analiz Ediliyor (${kalanSure}s)`;

        const timer = setInterval(() => {
            kalanSure -= 1;
            if (kalanSure > 0) {
                yaziEl.textContent = `Bilgileriniz Analiz Ediliyor (${kalanSure}s)`;
            } else {
                clearInterval(timer);
                yaziEl.textContent = 'Analiz Tamamlandı - Sonuçları Gör';
                if (iconEl) iconEl.className = 'fa-solid fa-arrow-right';
                btnAnaliz.disabled = false;
                btnAnaliz.style.cursor = 'pointer';
                btnAnaliz.style.opacity = '1';

                if (typeof confetti === 'function') {
                    confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
                }
            }
        }, 1000);

        btnAnaliz.onclick = () => {
            if (btnAnaliz.disabled) return;
            console.log("Test sonuçları:", window.testSonuclari);
            testPuanTablosunuDoldur();
        };
    }
}

function testPuanTablosunuDoldur() {
    const tbody = document.getElementById('test-puan-tbody');
    const testEkrani = document.getElementById('test-puan-ekrani');
    if (!tbody || !testEkrani) return;

    const c1 = window.testSonuclari.cevaplar.soru1 || {};
    const c2 = window.testSonuclari.cevaplar.soru2 || {};
    const c3 = window.testSonuclari.cevaplar.soru3 || {};
    const c4 = window.testSonuclari.cevaplar.soru4 || {};
    const c5 = window.testSonuclari.cevaplar.soru5 || {};

    const p1 = window.testSonuclari.deneyimselPuan || 0;
    const p2 = window.testSonuclari.gorselPuan || 0;
    const p3 = window.testSonuclari.okumaPuan || 0;
    const p4 = window.testSonuclari.yazarakPuan || 0;
    const p5 = window.testSonuclari.isitselPuan || 0;

    tbody.innerHTML = `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
            <td style="padding: 10px 8px; font-weight: 600; color: #818cf8;">1. Molekül Testi</td>
            <td style="padding: 10px 8px;">${c1.dogru ? '✓ Doğru (A+C)' : '✗ Yanlış'}</td>
            <td style="padding: 10px 8px;">${c1.sure ? c1.sure.toFixed(1) + ' sn' : '-'}</td>
            <td style="padding: 10px 8px; text-align: right; font-weight: 700; color: #34d399;">${p1} Puan</td>
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
            <td style="padding: 10px 8px; font-weight: 600; color: #818cf8;">2. Kim's Game</td>
            <td style="padding: 10px 8px;">"${c2.cevap || ''}" (${c2.dogru ? '✓ Doğru' : '✗ Yanlış, Doğru: ' + (c2.eksikNesne || '')})</td>
            <td style="padding: 10px 8px; color: var(--text-muted);">Zaman cezası yok</td>
            <td style="padding: 10px 8px; text-align: right; font-weight: 700; color: #34d399;">${p2} Puan</td>
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
            <td style="padding: 10px 8px; font-weight: 600; color: #818cf8;">3. Metin İnceleme</td>
            <td style="padding: 10px 8px;">Sıralama: "${c3.cevap || ''}" (${c3.dogruBagSayisi !== undefined ? c3.dogruBagSayisi : 0}/3 Bağlam Doğru)</td>
            <td style="padding: 10px 8px;">${c3.sure ? c3.sure.toFixed(1) + ' sn' : '-'}</td>
            <td style="padding: 10px 8px; text-align: right; font-weight: 700; color: #34d399;">${p3} Puan</td>
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
            <td style="padding: 10px 8px; font-weight: 600; color: #818cf8;">4. Zeta-4 (Yazarak)</td>
            <td style="padding: 10px 8px;">1: "${c4.cevap1 || ''}" (${c4.dogru1 ? '✓' : '✗'}), 2: "${c4.cevap2 || ''}" (${c4.dogru2 ? '✓' : '✗'})</td>
            <td style="padding: 10px 8px;">${c4.sure ? c4.sure.toFixed(1) + ' sn' : '-'}</td>
            <td style="padding: 10px 8px; text-align: right; font-weight: 700; color: #34d399;">${p4} Puan</td>
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
            <td style="padding: 10px 8px; font-weight: 600; color: #818cf8;">5. Seçici Dinleme</td>
            <td style="padding: 10px 8px;">Hatırlanan: ${(c5.hatirlananlar || []).join(', ') || 'Yok'} (${c5.dogruAdet || 0}/6)</td>
            <td style="padding: 10px 8px; color: var(--text-muted);">Zaman cezası yok</td>
            <td style="padding: 10px 8px; text-align: right; font-weight: 700; color: #34d399;">${p5} Puan</td>
        </tr>
    `;

    testEkrani.classList.remove('hidden');
    testEkrani.scrollIntoView({ behavior: 'smooth' });
}

function setBar(id, val) {
    const bar = document.getElementById(`bar-${id}`);
    const valText = document.getElementById(`val-${id}`);
    if (bar) bar.style.width = `${val}%`;
    if (valText) valText.textContent = `%${val}`;
}

// Testi Baştan Başlat
function testiSifirla() {
    window.testSonuclari = {
        deneyimselPuan: 0,
        gorselPuan: 0,
        okumaPuan: 0,
        yazarakPuan: 0,
        isitselPuan: 0,
        cevaplar: {}
    };
    window.location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
    const btnTekrar = document.getElementById('btn-tekrar-test');
    if (btnTekrar) {
        btnTekrar.addEventListener('click', testiSifirla);
    }

    const btnTesteBasla = document.getElementById('btn-teste-basla');
    if (btnTesteBasla) {
        btnTesteBasla.addEventListener('click', () => {
            const giris = document.getElementById('test-giris');
            if (giris) giris.classList.add('hidden');
            sonrakiSoruyaGec(1);
        });
    }

    // Başlangıçta test intro ekranı görüneceği için adım göstergesini gizle
    const progressContainer = document.getElementById('test-progress-bar-container');
    if (progressContainer) {
        progressContainer.classList.add('hidden');
    }
});
