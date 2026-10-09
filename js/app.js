// ===== Ortak Değişken (Herkes puanını buraya ekleyecek) =====
window.testSonuclari = {
    gorselPuan: 0,
    deneyimselPuan: 0,
    cevaplar: {}
};

// ===== Soruları Değiştiren Ana Fonksiyon =====
function sonrakiSoruyaGec(sonrakiSoruNo) {
    // Tüm soru kartlarını gizle
    const kartlar = document.querySelectorAll('.soru-kart');
    kartlar.forEach(kart => kart.classList.add('hidden'));

    // İstenen soruyu görünür yap
    const aktifSoru = document.getElementById(`soru-${sonrakiSoruNo}`);
    if (aktifSoru) {
        aktifSoru.classList.remove('hidden');
    } else {
        // Sorular bitti! Sonuç ekranını / Radar Grafiğini göster
        sonucEkraniGoster();
    }
}

// ===== Sonuç Ekranı / Radar Grafiği =====
function sonucEkraniGoster() {
    const sonuc = document.getElementById('sonuc-ekrani');
    if (sonuc) {
        sonuc.classList.remove('hidden');
    }

    const canvas = document.getElementById('radar-grafigi');
    if (!canvas || typeof Chart === 'undefined') return;

    new Chart(canvas, {
        type: 'radar',
        data: {
            labels: ['Görsel', 'Deneyimsel'],
            datasets: [{
                label: 'Puanlar',
                data: [
                    window.testSonuclari.gorselPuan,
                    window.testSonuclari.deneyimselPuan
                ],
                backgroundColor: 'rgba(79, 70, 229, 0.2)',
                borderColor: '#4f46e5',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    beginAtZero: true
                }
            }
        }
    });
}

// İlk soruyu başlat
document.addEventListener('DOMContentLoaded', () => {
    sonrakiSoruyaGec(1);
});
