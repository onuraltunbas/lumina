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

// 1. Soru (Molekül Testi) Tamamlandığında
function soru1Tamamla(gorsel, deneyimsel) {
    window.testSonuclari.gorselPuan += gorsel;
    window.testSonuclari.deneyimselPuan += deneyimsel;
    
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
            // Sitenizin istatistik/sonuç sayfasına buradan yönlendirme veya olay bağlayabilirsiniz:
            // window.location.href = "https://siteniz.com/istatistikler";
        };
    }
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
