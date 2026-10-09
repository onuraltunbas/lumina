// ===== 2. Soru =====
// HTML: index.html icindeki #soru-2 div'i

// 2. Soru Bittiğinde
function soru2Tamamla(gorsel, deneyimsel) {
    window.testSonuclari.gorselPuan += gorsel;
    window.testSonuclari.deneyimselPuan += deneyimsel;
    sonrakiSoruyaGec(3); // 3. soruya yonlendir
}
