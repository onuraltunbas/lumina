document.addEventListener('DOMContentLoaded', () => {
    
    // === BÖLÜM 1: MOLEKÜL DENEYİ (SÜRÜKLE BIRAK) ===
    
    const molecules = document.querySelectorAll('.molecule');
    const reactionZone = document.getElementById('reaction-zone');
    const reactionResult = document.getElementById('reaction-result');
    const btnFinishExperiment = document.getElementById('btn-finish-experiment');
    
    const molekulOyunuEkrani = document.getElementById('molekul-oyunu-ekrani');
    const soruKismi = document.getElementById('soru-kismi');
    
    let activeMoleculesInZone = []; // Alan içindeki moleküller
    let successfulReactions = 0;
    
    // Sürükleme Olayları
    molecules.forEach(mol => {
        mol.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', mol.dataset.type);
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => mol.classList.add('dragged'), 0);
        });
        
        mol.addEventListener('dragend', () => {
            mol.classList.remove('dragged');
        });
    });
    
    reactionZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        reactionZone.classList.add('drag-over');
    });
    
    reactionZone.addEventListener('dragleave', () => {
        reactionZone.classList.remove('drag-over');
    });
    
    reactionZone.addEventListener('drop', (e) => {
        e.preventDefault();
        reactionZone.classList.remove('drag-over');
        
        const type = e.dataTransfer.getData('text/plain');
        if (!type) return;
        
        // Eğer zaten bu tür bir molekül alanda varsa ekleme
        if (activeMoleculesInZone.includes(type)) return;
        
        // Sadece 2 molekül alabilir, 3. gelirse alanı temizle
        if (activeMoleculesInZone.length >= 2) {
            clearReactionZone();
        }
        
        // Orijinal molekülü palette görünmez yap
        const originalMol = document.querySelector(`.molecules-palette .molecule[data-type="${type}"]`);
        if (originalMol) {
            originalMol.style.visibility = 'hidden';
        }
        
        // Molekül bilgisini ve DOM elementini alana ekle
        activeMoleculesInZone.push({ type: type, original: originalMol });
        renderReactionZone();
        checkReaction();
    });
    
    function clearReactionZone() {
        activeMoleculesInZone = [];
        const droppedMoleculesContainer = document.getElementById('dropped-molecules');
        droppedMoleculesContainer.innerHTML = '';
        
        // Paletteki tüm molekülleri geri getir
        molecules.forEach(m => m.style.visibility = 'visible');
        reactionResult.className = 'reaction-result hidden';
        reactionResult.innerHTML = '';
        
        // Beherglas sıfırla
        const beakerFill = document.getElementById('beaker-fill');
        beakerFill.className = 'beaker-fill';
        
        // Efektleri sıfırla
        const reactionEffect = document.getElementById('reaction-effect');
        reactionEffect.className = 'reaction-effect';
        reactionEffect.innerHTML = '';
        
        document.getElementById('zone-text').style.display = 'block';
    }
    
    function renderReactionZone() {
        const droppedMoleculesContainer = document.getElementById('dropped-molecules');
        droppedMoleculesContainer.innerHTML = '';
        
        if (activeMoleculesInZone.length > 0) {
            document.getElementById('zone-text').style.display = 'none';
        }
        
        // Aktifleri çiz
        activeMoleculesInZone.forEach((molData) => {
            if(molData.original) {
                const clone = molData.original.cloneNode(true);
                clone.style.visibility = 'visible';
                clone.draggable = false;
                droppedMoleculesContainer.appendChild(clone);
            }
        });
    }
    
    function checkReaction() {
        if (activeMoleculesInZone.length !== 2) return;
        
        const combination = activeMoleculesInZone.map(m => m.type).sort().join('+'); // Örn: 'A+C'
        
        let resultType = null;
        let resultText = '';
        let resultClass = '';
        let fillClass = '';
        let effectHtml = '';
        let effectClass = '';
        
        if (combination === 'A+C') {
            resultType = 'water';
            resultText = '💧 MUHTEŞEM! SU (H2O) OLUŞTURDUNUZ!';
            resultClass = 'bg-water';
            fillClass = 'fill-water';
            effectHtml = '💧';
            effectClass = 'effect-water';
        } else if (combination === 'B+F') {
            resultType = 'fire';
            resultText = '🔥 DİKKAT! ALEV ÇIKTI!';
            resultClass = 'bg-fire';
            fillClass = 'fill-fire';
            effectHtml = '🔥';
            effectClass = 'effect-fire';
        } else if (combination === 'D+E') {
            resultType = 'gas';
            resultText = '☠️ TEHLİKE! ZEHİRLİ GAZ SALINIMI!';
            resultClass = 'bg-gas';
            fillClass = 'fill-gas';
            effectHtml = '☠️';
            effectClass = 'effect-skull';
        } else {
            resultText = '❌ Reaksiyon olmadı. Farklı bir kombinasyon dene.';
            resultClass = 'bg-dark';
            
            // 2 saniye sonra alanı temizle
            setTimeout(() => {
                clearReactionZone();
            }, 2000);
        }
        
        // Fill Beaker
        if (fillClass) {
            const beakerFill = document.getElementById('beaker-fill');
            beakerFill.className = `beaker-fill ${fillClass}`;
        }
        
        // Show Effect Overlay
        if (effectClass) {
            const reactionEffect = document.getElementById('reaction-effect');
            reactionEffect.innerHTML = effectHtml;
            reactionEffect.className = `reaction-effect ${effectClass}`;
        }
        
        reactionResult.innerHTML = resultText;
        reactionResult.className = `reaction-result ${resultClass}`;
        
        if (resultType) {
            successfulReactions++;
            
            // Eğer oyuncu kombinasyonları denediyse, soruya geçme butonunu aktif et
            btnFinishExperiment.disabled = false;
            
            // 4 saniye sonra deneyi tekrar baştan yapabilmesi için temizle
            setTimeout(() => {
                clearReactionZone();
            }, 4000);
        }
    }
    
    // Deneyi bitir ve Soruya geç
    btnFinishExperiment.addEventListener('click', () => {
        molekulOyunuEkrani.classList.add('hidden');
        soruKismi.classList.remove('hidden');
    });
    
    
    // === BÖLÜM 2: SORU VE DEĞERLENDİRME ===
    
    const optionBtns = document.querySelectorAll('.option-btn');
    const feedbackEl = document.getElementById('feedback');
    let answered = false;
    
    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (answered) return;
            answered = true;
            
            const isCorrect = btn.dataset.correct === "true";
            
            if (isCorrect) {
                btn.classList.add('correct');
                feedbackEl.textContent = "✅ Doğru Cevap! Harika bir hafızan var.";
                feedbackEl.className = "feedback success";
                if (typeof confetti === 'function') confetti({ particleCount: 100, spread: 70 });
                
                // Doğru cevaplandı, puan hesapla ve tamamla
                window.testSonuclari.cevaplar.soru1 = true;
                soru1Tamamla(100, 100); // 100 görsel, 100 deneyimsel tam puan
                
            } else {
                btn.classList.add('wrong');
                // Doğru olanı da göster
                document.querySelector('.option-btn[data-correct="true"]').classList.add('correct');
                
                feedbackEl.textContent = "❌ Yanlış Cevap. Doğru kombinasyon A ve C (Su) olmalıydı.";
                feedbackEl.className = "feedback error";
                
                window.testSonuclari.cevaplar.soru1 = false;
                soru1Tamamla(50, 20); // Yanlış olsa bile deneyimden puan alır
            }
        });
    });
});
