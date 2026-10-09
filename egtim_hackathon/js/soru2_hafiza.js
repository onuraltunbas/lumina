document.addEventListener('DOMContentLoaded', () => {
    
    // === BÖLÜM 2: HAFIZA OYUNU ===
    
    const btnBaslat = document.getElementById('btn-baslat-soru2');
    const hafizaIntro = document.getElementById('hafiza-intro');
    const hafizaGameArea = document.getElementById('hafiza-game-area');
    
    const timerBar = document.getElementById('timer-bar');
    const timerText = document.getElementById('timer-text');
    const flashOverlay = document.getElementById('flash-overlay');
    const cevapAlani = document.getElementById('soru2-cevap-alani');
    const btnCevapla = document.getElementById('btn-cevapla-soru2');
    const inputCevap = document.getElementById('eksik-nesne-input');
    const feedbackSoru2 = document.getElementById('feedback-soru2');
    
    let eksikNesne = null; 
    let timerInterval = null;
    let oyunBasladi = false;
    
    const traySurface = document.getElementById('tray-surface');
    
    // Nesnelerin verileri ve belirgin boyut oranları (0.64x ile 1.38x arası)
    const itemsData = [
        { id: 'kitap', name: 'Kitap', icon: 'fa-solid fa-book', baseScale: 1.38 },
        { id: 'kure', name: 'Küre', icon: 'fa-solid fa-globe', baseScale: 1.28 },
        { id: 'cetvel', name: 'Cetvel', icon: 'fa-solid fa-ruler', baseScale: 1.18 },
        { id: 'buyutec', name: 'Büyüteç', icon: 'fa-solid fa-magnifying-glass', baseScale: 1.10 },
        { id: 'makas', name: 'Makas', icon: 'fa-solid fa-scissors', baseScale: 1.00 },
        { id: 'pusula', name: 'Pusula', icon: 'fa-regular fa-compass', baseScale: 0.90 },
        { id: 'elma', name: 'Elma', icon: 'fa-solid fa-apple-whole', baseScale: 0.82 },
        { id: 'kalem', name: 'Kalem', icon: 'fa-solid fa-pencil', baseScale: 0.72 },
        { id: 'silgi', name: 'Silgi', icon: 'fa-solid fa-eraser', baseScale: 0.64 }
    ];
    
    // Fisher-Yates shuffle array
    function shuffleArray(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }
    
    // Eşyaları tepsiye serbest, üst üste binmeyecek ve sınırlardan taşmayacak şekilde rastgele yerleştir
    function renderItemsToTray(hideOne = false) {
        if (!traySurface) return;

        // Önceki eşyaları temizle (flash-overlay elemanını koru)
        traySurface.querySelectorAll('.tray-item').forEach(el => el.remove());
        
        let activeItems = [...itemsData];
        
        if (hideOne) {
            // Rastgele birini çıkar
            const randomIndex = Math.floor(Math.random() * activeItems.length);
            eksikNesne = activeItems[randomIndex].name;
            activeItems.splice(randomIndex, 1);
        }
        
        // Tepsinin kullanılabilir iç alan ölçüleri
        const surfaceWidth = traySurface.clientWidth || 540;
        const surfaceHeight = traySurface.clientHeight || 380;
        
        // Yerleştirme algoritması (büyük nesnelerden başlayarak sıkı ve güvenli paketleme)
        const sortedItems = [...activeItems].sort((a, b) => b.baseScale - a.baseScale);
        const placed = [];
        const baseRadius = 32;
        const margin = 20; // Tepsi ahşap sınırından güvenlik payı (asla dışarı taşmaz)
        let minGap = 16;   // Eşyalar arasındaki minimum boşluk mesafesi (üst üste binmeyi engeller)
        
        for (const item of sortedItems) {
            const scale = parseFloat((item.baseScale + (Math.random() * 0.06 - 0.03)).toFixed(2));
            const itemRadius = baseRadius * scale;
            const minX = itemRadius + margin;
            const maxX = Math.max(minX, surfaceWidth - itemRadius - margin);
            const minY = itemRadius + margin;
            const maxY = Math.max(minY, surfaceHeight - itemRadius - margin);
            
            let placedItem = null;
            
            // Rastgele serbest konum dene (çarpışma ve üst üste binme kontrolü ile)
            for (let attempt = 0; attempt < 500; attempt++) {
                const x = Math.random() * (maxX - minX) + minX;
                const y = Math.random() * (maxY - minY) + minY;
                
                const hasOverlap = placed.some(p => {
                    const dist = Math.hypot(x - p.x, y - p.y);
                    return dist < (itemRadius + p.radius + minGap);
                });
                
                if (!hasOverlap) {
                    // Doğal duruş için hafif rastgele açı (-35° ile +35° arası)
                    const rotation = Math.floor(Math.random() * 71) - 35;
                    placedItem = { item, x, y, radius: itemRadius, scale, rotation };
                    break;
                }
            }
            
            // Nadir durumda emniyetli fallback
            if (!placedItem) {
                const x = Math.random() * (maxX - minX) + minX;
                const y = Math.random() * (maxY - minY) + minY;
                const rotation = Math.floor(Math.random() * 71) - 35;
                placedItem = { item, x, y, radius: itemRadius, scale, rotation };
            }
            
            placed.push(placedItem);
        }
        
        // DOM elementlerini oluştur ve yüzdelik konumlarla ekle (ekran boyutlandırmalarına duyarlı)
        placed.forEach(({ item, x, y, scale, rotation }) => {
            const el = document.createElement('div');
            el.className = 'tray-item';
            el.dataset.id = item.id;
            el.dataset.name = item.name;
            
            const leftPercent = ((x / surfaceWidth) * 100).toFixed(2);
            const topPercent = ((y / surfaceHeight) * 100).toFixed(2);
            
            el.style.left = `${leftPercent}%`;
            el.style.top = `${topPercent}%`;
            el.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`;
            el.innerHTML = `<i class="${item.icon}"></i>`;
            
            traySurface.appendChild(el);
        });
    }
    
    // Başlangıçta render hazırla
    renderItemsToTray(false);
    
    // Süreyi Başlat Butonu
    btnBaslat.addEventListener('click', () => {
        if (oyunBasladi) return;
        oyunBasladi = true;
        
        // Ekran geçişi
        hafizaIntro.classList.add('hidden');
        hafizaGameArea.classList.remove('hidden');
        
        // Tepsi görünür olunca gerçek piksel ölçülerine göre eşyaları serbest yerleştir
        renderItemsToTray(false);
        
        let timeLeft = 10;
        timerText.textContent = timeLeft;
        timerBar.style.width = '100%';
        
        // 1 saniyelik interval
        timerInterval = setInterval(() => {
            timeLeft--;
            timerText.textContent = timeLeft;
            timerBar.style.width = `${(timeLeft / 10) * 100}%`;
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                zamanDoldu();
            }
        }, 1000);
    });
    
    function zamanDoldu() {
        flashOverlay.classList.add('active');
        
        setTimeout(() => {
            // Bir nesneyi eksilt ve kalanları yeniden serbestçe diz
            renderItemsToTray(true);
            
            flashOverlay.classList.remove('active');
            cevapAlani.classList.remove('hidden');
            inputCevap.focus();
            
        }, 500); // Flaş süresi
    }
    
    // Kullanıcının metin formatını temizleme fonksiyonu
    function temizleMetin(metin) {
        return metin
            .toLowerCase() // Küçük harfe çevir
            .replace(/\s+/g, '') // Tüm boşlukları sil
            .replace(/ı/g, 'i') // Türkçe karakter toleransı
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c');
    }
    
    let soru2Cevaplandi = false;
    
    // Cevapla Butonu
    btnCevapla.addEventListener('click', () => {
        if (soru2Cevaplandi) return;
        
        const kullaniciCevabi = inputCevap.value;
        if (!kullaniciCevabi.trim()) {
            feedbackSoru2.textContent = "Lütfen bir cevap yazın.";
            feedbackSoru2.className = "feedback error";
            return;
        }
        
        const temizKullaniciCevabi = temizleMetin(kullaniciCevabi);
        const temizDogruCevap = temizleMetin(eksikNesne);
        
        soru2Cevaplandi = true;
        inputCevap.disabled = true;
        btnCevapla.disabled = true;
        
        if (temizKullaniciCevabi === temizDogruCevap || temizKullaniciCevabi.includes(temizDogruCevap) || temizDogruCevap.includes(temizKullaniciCevabi)) {
            // DOĞRU
            feedbackSoru2.innerHTML = `✅ Tebrikler! (1 / 1) - Doğru cevap: <strong>${eksikNesne}</strong>`;
            feedbackSoru2.className = "feedback success";
            
            window.testSonuclari.cevaplar.soru2 = { cevap: kullaniciCevabi, dogru: true, eksikNesne };
            window.testSonuclari.gorselPuan = Math.min(100, (window.testSonuclari.gorselPuan || 0) + 50);
            
            if (typeof confetti === 'function') confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            
            setTimeout(() => {
                if (typeof sonrakiSoruyaGec === 'function') {
                    sonrakiSoruyaGec(3); 
                }
            }, 2500);
            
        } else {
            // YANLIŞ
            feedbackSoru2.innerHTML = `❌ Yanlış. (0 / 1) - Eksik olan nesne <strong>${eksikNesne}</strong> idi.`;
            feedbackSoru2.className = "feedback error";
            
            window.testSonuclari.cevaplar.soru2 = { cevap: kullaniciCevabi, dogru: false, eksikNesne };
            
            setTimeout(() => {
                if (typeof sonrakiSoruyaGec === 'function') {
                    sonrakiSoruyaGec(3);
                }
            }, 2500);
        }
    });
    
    // Enter'a basınca da çalışsın
    inputCevap.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            btnCevapla.click();
        }
    });
});
