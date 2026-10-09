// Ortak Değişken (Herkes puanını buraya ekleyecek)
window.testSonuclari = {
    gorselPuan: 0,
    deneyimselPuan: 0,
    cevaplar: {}
};

// Soruları Değiştiren Ana Fonksiyon
function sonrakiSoruyaGec(sonrakiSoruNo) {
    // Tüm soru kartlarını gizle
    const kartlar = document.querySelectorAll('.soru-kart');
    kartlar.forEach(kart => kart.classList.add('hidden'));

    // İstenen soruyu görünür yap
    const aktifSoru = document.getElementById(`soru-${sonrakiSoruNo}`);
    if (aktifSoru) {
        aktifSoru.classList.remove('hidden');
    } else {
        // Sorular bitti! Sonuç ekranını göster
        sonucEkraniGoster();
    }
}

function sonucEkraniGoster() {
    alert("Test tamamlandı! \nToplam Görsel Puan: " + window.testSonuclari.gorselPuan + "\nDeneyimsel Puan: " + window.testSonuclari.deneyimselPuan);
    console.log("Detaylı Sonuçlar:", window.testSonuclari);
}

// 1. Soru (Molekül Testi) Bittiğinde
function soru1Tamamla(gorsel, deneyimsel) {
    window.testSonuclari.gorselPuan += gorsel;
    window.testSonuclari.deneyimselPuan += deneyimsel;
    
    // Geçiş efekti için ufak bir gecikme
    setTimeout(() => {
        sonrakiSoruyaGec(2);
    }, 1500);
}
