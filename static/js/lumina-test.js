/**
 * Lumina Studio - Bilişsel Öğrenme Stili Test Motoru
 * egtim_hackathon mantığı & formülleri %100 korunarak Lumina Comic platformuna entegre edilmiştir.
 */
(function() {
  'use strict';

  // Global Test Sonuçları Deposu
  window.testSonuclari = {
    deneyimselPuan: 0,
    gorselPuan: 0,
    okumaPuan: 0,
    yazarakPuan: 0,
    isitselPuan: 0,
    cevaplar: {}
  };

  // =====================================================================
  // ORİJİNAL PUANLAMA VE CEZA FORMÜLLERİ (DEĞİŞTİRİLMEZ)
  // =====================================================================

  // 1. Soru Puanlama (Deneyimsel)
  function soru1_Hesapla(dogruMu, cozumSuresi) {
    if (!Boolean(dogruMu)) return 0;
    cozumSuresi = isNaN(cozumSuresi) || cozumSuresi < 0 ? 0 : Number(cozumSuresi);
    let hamPuan = 100;
    let ceza = cozumSuresi > 5 ? Math.floor(cozumSuresi - 5) * 3 : 0;
    return Math.max(0, hamPuan - ceza);
  }

  // 2. Soru Puanlama (Görsel Hafıza)
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

  // 3. Soru Puanlama (Okuyarak)
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

  // 4. Soru Puanlama (Yazarak)
  function soru4_Hesapla(dogruA, dogruB, cozumSuresi) {
    let hamPuan = (Boolean(dogruA) ? 50 : 0) + (Boolean(dogruB) ? 50 : 0);
    if (hamPuan > 0) {
      cozumSuresi = isNaN(cozumSuresi) || cozumSuresi < 0 ? 0 : Number(cozumSuresi);
      let ceza = cozumSuresi > 5 ? Math.floor(cozumSuresi - 5) * 1 : 0;
      hamPuan -= ceza;
    }
    return Math.max(0, hamPuan);
  }

  // 5. Soru Puanlama (İşitsel)
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

  // =====================================================================
  // ADIM GEÇİŞLERİ VE GÖSTERGE YÖNETİMİ
  // =====================================================================
  window.luminaSonrakiSoruyaGec = function(sonrakiSoruNo) {
    const panels = document.querySelectorAll('.lumina-soru-paneli');
    panels.forEach(p => p.classList.add('test-hidden'));

    // Stepper güncelle
    const dots = document.querySelectorAll('.stepper-dot');
    dots.forEach((dot, idx) => {
      const stepNum = idx + 1;
      dot.classList.remove('active', 'completed');
      if (stepNum < sonrakiSoruNo) {
        dot.classList.add('completed');
      } else if (stepNum === sonrakiSoruNo) {
        dot.classList.add('active');
      }
    });

    const stepperBar = document.getElementById('test-stepper-bar');
    if (stepperBar) {
      if (sonrakiSoruNo > 5 || sonrakiSoruNo < 1) {
        stepperBar.classList.add('test-hidden');
      } else {
        stepperBar.classList.remove('test-hidden');
      }
    }

    if (sonrakiSoruNo > 5) {
      sonucEkraniGoster();
      return;
    }

    const aktifPanel = document.getElementById(`soru-${sonrakiSoruNo}`);
    if (aktifPanel) {
      aktifPanel.classList.remove('test-hidden');
      
      // 3. Soru için okuma sayacını başlat
      if (sonrakiSoruNo === 3 && typeof window.soru3OkumaBaslat === 'function') {
        window.soru3OkumaBaslat();
      }
    } else {
      sonucEkraniGoster();
    }
  };

  // =====================================================================
  // SORU 1: MOLEKÜL LABORATUVARI MOTORU
  // =====================================================================
  function initSoru1() {
    const molecules = document.querySelectorAll('.molecule');
    const reactionZone = document.getElementById('reaction-zone');
    const reactionResult = document.getElementById('reaction-result');
    const btnFinishExperiment = document.getElementById('btn-finish-experiment');
    const molekulOyunuEkrani = document.getElementById('molekul-oyunu-ekrani');
    const soruKismi = document.getElementById('soru-kismi');

    if (!reactionZone) return;

    let activeMoleculesInZone = [];
    let soru1BaslangicZamani = 0;

    molecules.forEach(mol => {
      mol.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', mol.dataset.type);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => mol.classList.add('dragged'), 0);
      });
      mol.addEventListener('dragend', () => mol.classList.remove('dragged'));
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

      if (activeMoleculesInZone.some(m => m.type === type)) return;

      if (activeMoleculesInZone.length >= 2) {
        clearReactionZone();
      }

      const originalMol = document.querySelector(`.molecules-palette .molecule[data-type="${type}"]`);
      if (originalMol) originalMol.style.visibility = 'hidden';

      activeMoleculesInZone.push({ type: type, original: originalMol });
      renderReactionZone();
      checkReaction();
    });

    function clearReactionZone() {
      activeMoleculesInZone = [];
      const droppedContainer = document.getElementById('dropped-molecules');
      if (droppedContainer) droppedContainer.innerHTML = '';
      molecules.forEach(m => m.style.visibility = 'visible');
      if (reactionResult) {
        reactionResult.className = 'reaction-result test-hidden';
        reactionResult.innerHTML = '';
      }
      const beakerFill = document.getElementById('beaker-fill');
      if (beakerFill) beakerFill.className = 'beaker-fill';
      const zoneText = document.getElementById('zone-text');
      if (zoneText) zoneText.style.display = 'block';
    }

    function renderReactionZone() {
      const droppedContainer = document.getElementById('dropped-molecules');
      if (!droppedContainer) return;
      droppedContainer.innerHTML = '';
      const zoneText = document.getElementById('zone-text');
      if (activeMoleculesInZone.length > 0 && zoneText) {
        zoneText.style.display = 'none';
      }
      activeMoleculesInZone.forEach(molData => {
        if (molData.original) {
          const clone = molData.original.cloneNode(true);
          clone.style.visibility = 'visible';
          clone.draggable = false;
          droppedContainer.appendChild(clone);
        }
      });
    }

    function checkReaction() {
      if (activeMoleculesInZone.length !== 2) return;
      const combination = activeMoleculesInZone.map(m => m.type).sort().join('+');

      let resultText = '';
      let resultClass = '';
      let fillClass = '';

      if (combination === 'A+C') {
        resultText = '💧 MUHTEŞEM! SU (H2O) OLUŞTURDUNUZ!';
        resultClass = 'bg-water';
        fillClass = 'fill-water';
      } else if (combination === 'B+F') {
        resultText = '🔥 DİKKAT! ALEV ÇIKTI!';
        resultClass = 'bg-fire';
        fillClass = 'fill-fire';
      } else if (combination === 'D+E') {
        resultText = '☠️ TEHLİKE! ZEHİRLİ GAZ SALINIMI!';
        resultClass = 'bg-gas';
        fillClass = 'fill-gas';
      } else {
        resultText = '❌ Reaksiyon olmadı. Farklı bir kombinasyon dene.';
        resultClass = 'bg-dark';
        setTimeout(() => clearReactionZone(), 2000);
      }

      const beakerFill = document.getElementById('beaker-fill');
      if (fillClass && beakerFill) {
        beakerFill.className = `beaker-fill ${fillClass}`;
      }

      if (reactionResult) {
        reactionResult.innerHTML = resultText;
        reactionResult.className = `reaction-result ${resultClass}`;
      }

      if (fillClass) {
        if (btnFinishExperiment) btnFinishExperiment.disabled = false;
        setTimeout(() => clearReactionZone(), 3500);
      }
    }

    if (btnFinishExperiment) {
      btnFinishExperiment.addEventListener('click', () => {
        if (molekulOyunuEkrani) molekulOyunuEkrani.classList.add('test-hidden');
        if (soruKismi) soruKismi.classList.remove('test-hidden');
        soru1BaslangicZamani = Date.now();
      });
    }

    const optionBtns = document.querySelectorAll('.soru1-opt-btn, #soru-1 .comic-option-btn, #soru-1 .option-btn, .option-btn');
    const feedbackEl = document.getElementById('feedback-soru1');
    let answered = false;

    optionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;

        const isCorrect = btn.dataset.correct === "true";
        const cozumSuresi = soru1BaslangicZamani > 0 ? (Date.now() - soru1BaslangicZamani) / 1000 : 0;
        const puan = soru1_Hesapla(isCorrect, cozumSuresi);

        if (isCorrect) {
          btn.classList.add('correct');
          if (feedbackEl) {
            feedbackEl.innerHTML = "✅ Doğru Cevap! (1 / 1)";
            feedbackEl.className = "comic-feedback show success";
          }
          if (typeof confetti === 'function') confetti({ particleCount: 100, spread: 70 });
        } else {
          btn.classList.add('wrong');
          const correctBtn = document.querySelector('.soru1-opt-btn[data-correct="true"], #soru-1 .comic-option-btn[data-correct="true"], #soru-1 .option-btn[data-correct="true"], .option-btn[data-correct="true"]');
          if (correctBtn) correctBtn.classList.add('correct');
          if (feedbackEl) {
            feedbackEl.innerHTML = "❌ Yanlış Cevap. (0 / 1) Doğru kombinasyon A ve C (Su) olmalıydı.";
            feedbackEl.className = "comic-feedback show error";
          }
        }

        window.testSonuclari.deneyimselPuan = puan;
        window.testSonuclari.cevaplar.soru1 = { dogru: isCorrect, sure: cozumSuresi, puan: puan };

        setTimeout(() => {
          window.luminaSonrakiSoruyaGec(2);
        }, 1800);
      });
    });
  }

  // =====================================================================
  // SORU 2: KIM'S GAME (GÖRSEL HAFIZA & TEPSİ)
  // =====================================================================
  function initSoru2() {
    const btnBaslat = document.getElementById('btn-baslat-soru2');
    const hafizaIntro = document.getElementById('hafiza-intro');
    const hafizaGameArea = document.getElementById('hafiza-game-area');
    const timerBar = document.getElementById('timer-bar-soru2');
    const timerText = document.getElementById('timer-text-soru2');
    const flashOverlay = document.getElementById('flash-overlay');
    const cevapAlani = document.getElementById('soru2-cevap-alani');
    const btnCevapla = document.getElementById('btn-cevapla-soru2');
    const inputCevap = document.getElementById('eksik-nesne-input');
    const feedbackSoru2 = document.getElementById('feedback-soru2');
    const traySurface = document.getElementById('tray-surface');

    if (!traySurface) return;

    let eksikNesne = null;
    let timerInterval = null;
    let oyunBasladi = false;
    let soru2Cevaplandi = false;

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

    function renderItemsToTray(hideOne) {
      if (!traySurface) return;
      traySurface.querySelectorAll('.tray-item').forEach(el => el.remove());

      let activeItems = [...itemsData];
      if (hideOne) {
        const randomIndex = Math.floor(Math.random() * activeItems.length);
        eksikNesne = activeItems[randomIndex].name;
        activeItems.splice(randomIndex, 1);
      }

      const surfaceWidth = traySurface.clientWidth || 540;
      const surfaceHeight = traySurface.clientHeight || 380;
      const sortedItems = [...activeItems].sort((a, b) => b.baseScale - a.baseScale);
      const placed = [];
      const baseRadius = 30;
      const margin = 20;
      let minGap = 16;

      for (const item of sortedItems) {
        const scale = parseFloat((item.baseScale + (Math.random() * 0.06 - 0.03)).toFixed(2));
        const itemRadius = baseRadius * scale;
        const minX = itemRadius + margin;
        const maxX = Math.max(minX, surfaceWidth - itemRadius - margin);
        const minY = itemRadius + margin;
        const maxY = Math.max(minY, surfaceHeight - itemRadius - margin);

        let placedItem = null;
        for (let attempt = 0; attempt < 500; attempt++) {
          const x = Math.random() * (maxX - minX) + minX;
          const y = Math.random() * (maxY - minY) + minY;
          const hasOverlap = placed.some(p => Math.hypot(x - p.x, y - p.y) < (itemRadius + p.radius + minGap));
          if (!hasOverlap) {
            const rotation = Math.floor(Math.random() * 71) - 35;
            placedItem = { item, x, y, radius: itemRadius, scale, rotation };
            break;
          }
        }
        if (!placedItem) {
          const x = Math.random() * (maxX - minX) + minX;
          const y = Math.random() * (maxY - minY) + minY;
          placedItem = { item, x, y, radius: itemRadius, scale, rotation: 0 };
        }
        placed.push(placedItem);
      }

      placed.forEach(({ item, x, y, scale, rotation }) => {
        const el = document.createElement('div');
        el.className = 'tray-item';
        el.dataset.id = item.id;
        el.dataset.name = item.name;
        el.style.left = `${((x / surfaceWidth) * 100).toFixed(2)}%`;
        el.style.top = `${((y / surfaceHeight) * 100).toFixed(2)}%`;
        el.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`;
        el.innerHTML = `<i class="${item.icon}"></i>`;
        traySurface.appendChild(el);
      });
    }

    renderItemsToTray(false);

    if (btnBaslat) {
      btnBaslat.addEventListener('click', () => {
        if (oyunBasladi) return;
        oyunBasladi = true;
        if (hafizaIntro) hafizaIntro.classList.add('test-hidden');
        if (hafizaGameArea) hafizaGameArea.classList.remove('test-hidden');
        renderItemsToTray(false);

        let timeLeft = 10;
        if (timerText) timerText.textContent = timeLeft;
        if (timerBar) timerBar.style.width = '100%';

        timerInterval = setInterval(() => {
          timeLeft--;
          if (timerText) timerText.textContent = timeLeft;
          if (timerBar) timerBar.style.width = `${(timeLeft / 10) * 100}%`;

          if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (flashOverlay) flashOverlay.classList.add('active');
            setTimeout(() => {
              renderItemsToTray(true);
              if (flashOverlay) flashOverlay.classList.remove('active');
              if (cevapAlani) cevapAlani.classList.remove('test-hidden');
              if (inputCevap) inputCevap.focus();
            }, 500);
          }
        }, 1000);
      });
    }

    function temizleMetin(metin) {
      return (metin || '')
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c');
    }

    function cevaplaSoru2() {
      if (soru2Cevaplandi || !inputCevap) return;
      const kullaniciCevabi = inputCevap.value;
      if (!kullaniciCevabi.trim()) {
        if (feedbackSoru2) {
          feedbackSoru2.textContent = "Lütfen bir nesne adı yazın.";
          feedbackSoru2.className = "comic-feedback show error";
        }
        return;
      }

      const temizKullanici = temizleMetin(kullaniciCevabi);
      const temizDogru = temizleMetin(eksikNesne);
      soru2Cevaplandi = true;
      inputCevap.disabled = true;
      if (btnCevapla) btnCevapla.disabled = true;

      const isCorrect = (temizKullanici === temizDogru || temizKullanici.includes(temizDogru) || temizDogru.includes(temizKullanici));
      const puan = isCorrect ? 100 : 0;
      window.testSonuclari.gorselPuan = puan;
      window.testSonuclari.cevaplar.soru2 = { cevap: kullaniciCevabi, dogru: isCorrect, eksikNesne, puan };

      if (feedbackSoru2) {
        if (isCorrect) {
          feedbackSoru2.innerHTML = `✅ Tebrikler! (1 / 1) - Doğru cevap: <strong>${eksikNesne}</strong>`;
          feedbackSoru2.className = "comic-feedback show success";
          if (typeof confetti === 'function') confetti({ particleCount: 120, spread: 80 });
        } else {
          feedbackSoru2.innerHTML = `❌ Yanlış. (0 / 1) - Eksik olan nesne <strong>${eksikNesne}</strong> idi.`;
          feedbackSoru2.className = "comic-feedback show error";
        }
      }

      setTimeout(() => {
        window.luminaSonrakiSoruyaGec(3);
      }, 2200);
    }

    if (btnCevapla) btnCevapla.addEventListener('click', cevaplaSoru2);
    if (inputCevap) {
      inputCevap.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') cevaplaSoru2();
      });
    }
  }

  // =====================================================================
  // SORU 3: METİN İNCELEME (OKUYARAK ÖĞRENME)
  // =====================================================================
  function initSoru3() {
    const SORU3_SURE = 20;
    const SORU3_DOGRU_SIRA = ['B', 'C', 'D', 'A'];
    let soru3KalanSure = SORU3_SURE;
    let soru3TimerInterval = null;
    let soru3BaslangicZamani = 0;

    window.soru3OkumaBaslat = function() {
      const sayac = document.getElementById('soru3-sayac');
      const timerBar = document.getElementById('soru3-timer-bar');
      if (!sayac) return;

      soru3KalanSure = SORU3_SURE;
      sayac.textContent = soru3KalanSure;
      if (timerBar) timerBar.style.width = '100%';

      if (soru3TimerInterval) clearInterval(soru3TimerInterval);

      soru3TimerInterval = setInterval(() => {
        soru3KalanSure -= 1;
        sayac.textContent = Math.max(soru3KalanSure, 0);
        if (timerBar) timerBar.style.width = `${(Math.max(soru3KalanSure, 0) / SORU3_SURE) * 100}%`;

        if (soru3KalanSure <= 0) {
          clearInterval(soru3TimerInterval);
          const okumaAlani = document.getElementById('soru3-okuma');
          const siralamaAlani = document.getElementById('soru3-siralama');
          if (okumaAlani) okumaAlani.classList.add('test-hidden');
          if (siralamaAlani) siralamaAlani.classList.remove('test-hidden');
          soru3BaslangicZamani = Date.now();
          const ilkKutu = document.querySelector('#soru3-siralama .sort-input');
          if (ilkKutu) ilkKutu.focus();
        }
      }, 1000);
    };

    const kutular = document.querySelectorAll('#soru3-siralama .sort-input');
    kutular.forEach((kutu, i) => {
      kutu.addEventListener('input', () => {
        kutu.value = kutu.value.toUpperCase().replace(/[^A-D]/g, '').slice(0, 1);
        if (kutu.value && i < kutular.length - 1) {
          kutular[i + 1].focus();
        }
      });
      kutu.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !kutu.value && i > 0) {
          kutular[i - 1].focus();
        }
      });
    });

    const kontrolBtn = document.getElementById('soru3-kontrol-btn');
    if (kontrolBtn) {
      kontrolBtn.addEventListener('click', () => {
        const cevaplar = Array.from(kutular).map(k => k.value.trim().toUpperCase());
        const cozumSuresi = soru3BaslangicZamani > 0 ? (Date.now() - soru3BaslangicZamani) / 1000 : 0;

        let dogruBagSayisi = 0;
        let islenecekDizi = cevaplar.slice(0, 4);
        if (new Set(islenecekDizi).size === islenecekDizi.length) {
          for (let i = 0; i < islenecekDizi.length - 1; i++) {
            let orjIndex = SORU3_DOGRU_SIRA.indexOf(islenecekDizi[i]);
            if (orjIndex !== -1 && orjIndex < SORU3_DOGRU_SIRA.length - 1) {
              if (SORU3_DOGRU_SIRA[orjIndex + 1] === islenecekDizi[i + 1]) dogruBagSayisi++;
            }
          }
        }

        const tamDogruMu = cevaplar.join('') === SORU3_DOGRU_SIRA.join('');
        const puan = soru3_Hesapla(cevaplar, SORU3_DOGRU_SIRA, cozumSuresi);

        window.testSonuclari.okumaPuan = puan;
        window.testSonuclari.cevaplar.soru3 = {
          cevap: cevaplar.join(''),
          dogruSira: SORU3_DOGRU_SIRA.join(''),
          dogruBagSayisi,
          sure: cozumSuresi,
          puan
        };

        kutular.forEach(k => k.disabled = true);
        kontrolBtn.classList.add('test-hidden');

        const puanText = document.getElementById('soru3-puan-text');
        if (puanText) {
          if (tamDogruMu) {
            puanText.innerHTML = `✅ <strong>3 bağlam doğru (Mükemmel sıralama)</strong>`;
          } else if (dogruBagSayisi > 0) {
            puanText.innerHTML = `✅ <strong>${dogruBagSayisi} bağlam doğru</strong>`;
          } else {
            puanText.innerHTML = `❌ <strong>0 bağlam doğru</strong>`;
          }
        }

        const sonuc = document.getElementById('soru3-sonuc');
        if (sonuc) sonuc.classList.remove('test-hidden');

        if (tamDogruMu && typeof confetti === 'function') {
          confetti({ particleCount: 100, spread: 70 });
        }
      });
    }

    const devamBtn = document.getElementById('soru3-devam-btn');
    if (devamBtn) {
      devamBtn.addEventListener('click', () => {
        window.luminaSonrakiSoruyaGec(4);
      });
    }
  }

  // =====================================================================
  // SORU 4: YAZARAK ÖĞRENME (ZETA-4)
  // =====================================================================
  function initSoru4() {
    const SORU4_SURESI = { telefon: 50, bilgisayar: 65, kagit: 90 };
    const SORU4_METIN_PARCALARI = [
      'Yeni sentezlenen Zeta-4 polimeri,',
      'yüksek sıcaklık altında aşamalı bir tepkime gösterir.',
      'Sıcaklık 140°C seviyesine ulaştığında',
      'malzeme iç yapısındaki kristal bağlar gevşeyerek',
      'esnek forma geçer.'
    ];

    let soru4SecilenMod = 'kagit';
    let soru4OkumaSuresi = SORU4_SURESI.kagit;
    let soru4MetinKaymaSuresi = 18;
    let soru4KalanOkuma = soru4OkumaSuresi;
    let soru4OkumaZamanlayici = null;
    let soru4MetinZamanlayici = null;
    let soru4BaslangicZamani = 0;

    function soru4Baslat(mod) {
      soru4SecilenMod = mod;
      soru4OkumaSuresi = SORU4_SURESI[mod] || SORU4_SURESI.kagit;
      soru4MetinKaymaSuresi = soru4OkumaSuresi / 5;

      const giris = document.getElementById('soru4-giris');
      if (giris) giris.classList.add('test-hidden');

      const yazmaAlani = document.getElementById('soru4-yazma-alani');
      if (yazmaAlani) {
        if (mod === 'kagit') yazmaAlani.classList.add('test-hidden');
        else yazmaAlani.classList.remove('test-hidden');
      }

      const okuma = document.getElementById('soru4-okuma');
      if (okuma) okuma.classList.remove('test-hidden');

      // Metin akışı
      const kap = document.getElementById('soru4-metin');
      if (kap) {
        kap.innerHTML = '';
        let i = 0;
        const parcaGoster = () => {
          if (i >= SORU4_METIN_PARCALARI.length) {
            clearInterval(soru4MetinZamanlayici);
            return;
          }
          const parca = document.createElement('span');
          parca.className = 'scrolling-text-item';
          parca.textContent = SORU4_METIN_PARCALARI[i];
          kap.appendChild(parca);
          while (kap.children.length > 2) kap.removeChild(kap.firstElementChild);
          i += 1;
        };
        parcaGoster();
        soru4MetinZamanlayici = setInterval(parcaGoster, soru4MetinKaymaSuresi * 1000);
      }

      // Okuma sayacı
      const sayac = document.getElementById('soru4-sayac-okuma');
      const timerBar = document.getElementById('soru4-timer-bar-okuma');
      soru4KalanOkuma = soru4OkumaSuresi;
      if (sayac) sayac.textContent = soru4KalanOkuma;
      if (timerBar) timerBar.style.width = '100%';

      soru4OkumaZamanlayici = setInterval(() => {
        soru4KalanOkuma -= 1;
        if (sayac) sayac.textContent = Math.max(soru4KalanOkuma, 0);
        if (timerBar) timerBar.style.width = `${(Math.max(soru4KalanOkuma, 0) / soru4OkumaSuresi) * 100}%`;

        if (soru4KalanOkuma <= 0) {
          clearInterval(soru4OkumaZamanlayici);
          if (soru4MetinZamanlayici) clearInterval(soru4MetinZamanlayici);
          if (okuma) okuma.classList.add('test-hidden');

          if (soru4SecilenMod === 'kagit') {
            const kagitUyari = document.getElementById('soru4-kagit-uyari');
            if (kagitUyari) kagitUyari.classList.remove('test-hidden');
            else soru4SorulariGoster();
          } else {
            soru4SorulariGoster();
          }
        }
      }, 1000);
    }

    function soru4SorulariGoster() {
      const okuma = document.getElementById('soru4-okuma');
      const kagitUyari = document.getElementById('soru4-kagit-uyari');
      const sorular = document.getElementById('soru4-sorular');
      if (okuma) okuma.classList.add('test-hidden');
      if (kagitUyari) kagitUyari.classList.add('test-hidden');
      if (sorular) sorular.classList.remove('test-hidden');
      soru4BaslangicZamani = Date.now();
      const ilkKutu = document.getElementById('soru4-cevap1');
      if (ilkKutu) ilkKutu.focus();
    }

    document.querySelectorAll('.method-card').forEach(btn => {
      btn.addEventListener('click', () => soru4Baslat(btn.dataset.mod));
    });

    const kagitUyariBtn = document.getElementById('soru4-kagit-uyari-btn');
    if (kagitUyariBtn) kagitUyariBtn.addEventListener('click', soru4SorulariGoster);

    function soru4Normalize(m) {
      return (m || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    const cevaplaBtn = document.getElementById('soru4-cevapla-btn');
    if (cevaplaBtn) {
      cevaplaBtn.addEventListener('click', () => {
        const input1 = document.getElementById('soru4-cevap1');
        const input2 = document.getElementById('soru4-cevap2');
        const cevap1 = soru4Normalize(input1 ? input1.value : '');
        const cevap2 = soru4Normalize(input2 ? input2.value : '');

        const dogru1 = cevap1.includes('140');
        const dogru2 = cevap2.includes('kristal') || cevap2.includes('bağ') || cevap2.includes('bag');
        const cozumSuresi = soru4BaslangicZamani > 0 ? (Date.now() - soru4BaslangicZamani) / 1000 : 0;
        const dogruSayisi = (dogru1 ? 1 : 0) + (dogru2 ? 1 : 0);
        const puan = soru4_Hesapla(dogru1, dogru2, cozumSuresi);

        window.testSonuclari.yazarakPuan = puan;
        window.testSonuclari.cevaplar.soru4 = { cevap1, cevap2, dogru1, dogru2, dogruSayisi, sure: cozumSuresi, puan };

        if (input1) input1.disabled = true;
        if (input2) input2.disabled = true;

        const sorular = document.getElementById('soru4-sorular');
        if (sorular) sorular.classList.add('test-hidden');

        const puanText = document.getElementById('soru4-puan-text');
        if (puanText) puanText.innerHTML = `✅ Doğru sayısı: <strong>${dogruSayisi} / 2</strong>`;

        const sonuc = document.getElementById('soru4-sonuc');
        if (sonuc) sonuc.classList.remove('test-hidden');

        if (dogruSayisi === 2 && typeof confetti === 'function') {
          confetti({ particleCount: 100, spread: 70 });
        }
      });
    }

    const devamBtn = document.getElementById('soru4-devam-btn');
    if (devamBtn) {
      devamBtn.addEventListener('click', () => {
        window.luminaSonrakiSoruyaGec(5);
      });
    }
  }

  // =====================================================================
  // SORU 5: İŞİTSEL ÖĞRENME (DİNLEME & BELLEK)
  // =====================================================================
  function initSoru5() {
    const SORU5_DOGRU_NESNELER = ['şemsiye', 'elma', 'fotoğraf makinesi', 'çorap', 'vida', 'kalem'];

    const baslaBtn = document.getElementById('soru5-basla-btn');
    const giris = document.getElementById('soru5-giris');
    const dinleme = document.getElementById('soru5-dinleme');
    const ses = document.getElementById('soru5-ses');
    const sorular = document.getElementById('soru5-sorular');
    const ekleBtn = document.getElementById('soru5-ekle-btn');
    const tamamBtn = document.getElementById('soru5-tamam-btn');
    const devamBtn = document.getElementById('soru5-devam-btn');

    if (baslaBtn) {
      baslaBtn.addEventListener('click', () => {
        if (giris) giris.classList.add('test-hidden');
        if (dinleme) dinleme.classList.remove('test-hidden');
        if (ses) {
          ses.currentTime = 0;
          ses.play().catch(e => console.warn(e));
          ses.onended = () => {
            if (dinleme) dinleme.classList.add('test-hidden');
            if (sorular) sorular.classList.remove('test-hidden');
            const ilkKutu = document.querySelector('#soru5-kutular .comic-input');
            if (ilkKutu) ilkKutu.focus();
          };
        }
      });
    }

    if (ekleBtn) {
      ekleBtn.addEventListener('click', () => {
        const konteyner = document.getElementById('soru5-kutular');
        if (!konteyner) return;
        const count = konteyner.querySelectorAll('.comic-input').length;
        if (count >= 10) {
          ekleBtn.style.display = 'none';
          return;
        }
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'comic-input';
        input.placeholder = `Nesne ${count + 1}`;
        input.autocomplete = 'off';
        konteyner.appendChild(input);
        input.focus();
        if (count + 1 >= 10) ekleBtn.style.display = 'none';
      });
    }

    function soru5Normalizasyon(m) {
      return (m || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    if (tamamBtn) {
      tamamBtn.addEventListener('click', () => {
        const kutular = document.querySelectorAll('#soru5-kutular .comic-input');
        const girilenCevaplar = [];
        kutular.forEach(k => {
          const val = (k.value || '').trim();
          if (val) girilenCevaplar.push(val);
        });

        const FOTO_VARYANT = new Set([
          'fotograf makinesi', 'fotoğraf makinesi', 'foto makinesi',
          'fotograf makine', 'fotoğraf makine', 'fotografcik', 'fotograf'
        ]);

        const mappedCevaplar = girilenCevaplar.map(c => {
          const v = soru5Normalizasyon(c);
          if (v === 'semsiye') return 'şemsiye';
          if (v === 'elma') return 'elma';
          if (FOTO_VARYANT.has(v)) return 'fotoğraf makinesi';
          if (v === 'corap') return 'çorap';
          if (v === 'vida') return 'vida';
          if (v === 'kalem') return 'kalem';
          return c;
        });

        const dogruFinal = new Set(
          mappedCevaplar.filter(c => SORU5_DOGRU_NESNELER.includes(c.toLowerCase()))
        );
        const dogruAdet = dogruFinal.size;
        const puan = soru5_Hesapla(mappedCevaplar, SORU5_DOGRU_NESNELER);

        window.testSonuclari.isitselPuan = puan;
        window.testSonuclari.cevaplar.soru5 = {
          girilenler: girilenCevaplar,
          hatirlananlar: Array.from(dogruFinal),
          dogruAdet,
          puan
        };

        if (sorular) sorular.classList.add('test-hidden');
        const puanText = document.getElementById('soru5-puan-text');
        if (puanText) {
          puanText.innerHTML = `✅ Hatırlanan hedef nesne sayısı: <strong>${dogruAdet} / 6</strong>`;
        }

        const sonuc = document.getElementById('soru5-sonuc');
        if (sonuc) sonuc.classList.remove('test-hidden');

        if (dogruAdet >= 4 && typeof confetti === 'function') {
          confetti({ particleCount: 120, spread: 80 });
        }
      });
    }

    if (devamBtn) {
      devamBtn.addEventListener('click', () => {
        window.luminaSonrakiSoruyaGec(6);
      });
    }
  }

  // =====================================================================
  // TEST BİTİŞ VE SONUÇ RAPORU (MİSAFİR & GİRİŞ YAPMIŞ ENTEGRASYONU)
  // =====================================================================
  async function sonucEkraniGoster() {
    const sonucKart = document.getElementById('sonuc-ekrani');
    if (!sonucKart) return;
    sonucKart.classList.remove('test-hidden');

    const btnAnaliz = document.getElementById('btn-analiz-durum');
    const yaziEl = document.getElementById('analiz-btn-yazi');
    const iconEl = document.getElementById('analiz-icon');

    let kalanSure = 4;
    if (btnAnaliz && yaziEl) {
      btnAnaliz.disabled = true;
      yaziEl.textContent = `Bilişsel Analiz Yapılıyor (${kalanSure}s)...`;

      const timer = setInterval(async () => {
        kalanSure -= 1;
        if (kalanSure > 0) {
          yaziEl.textContent = `Bilişsel Analiz Yapılıyor (${kalanSure}s)...`;
        } else {
          clearInterval(timer);
          yaziEl.textContent = 'Analiz Tamamlandı - Sonuçları Gör';
          if (iconEl) iconEl.className = 'fa-solid fa-check';
          btnAnaliz.disabled = false;
          if (typeof confetti === 'function') {
            confetti({ particleCount: 150, spread: 85, origin: { y: 0.5 } });
          }

          // Sonuçları göster ve gerekirse DB'ye kaydet
          await sonuclariIsleVeGoster();
        }
      }, 1000);
    }
  }

  async function sonuclariIsleVeGoster() {
    const p1 = window.testSonuclari.deneyimselPuan || 0;
    const p2 = window.testSonuclari.gorselPuan || 0;
    const p3 = window.testSonuclari.okumaPuan || 0;
    const p4 = window.testSonuclari.yazarakPuan || 0;
    const p5 = window.testSonuclari.isitselPuan || 0;

    const scoresMap = {
      'deneyimsel': p1,
      'gorsel': p2,
      'okuyarak': p3,
      'yazarak': p4,
      'isitsel': p5
    };

    let dominant = 'deneyimsel';
    let maxVal = -1;
    for (const [k, v] of Object.entries(scoresMap)) {
      if (v > maxVal) {
        maxVal = v;
        dominant = k;
      }
    }

    const payload = {
      score_deneyimsel: p1,
      score_gorsel: p2,
      score_okuyarak: p3,
      score_yazarak: p4,
      score_isitsel: p5,
      dominant_style: dominant,
      details_json: JSON.stringify(window.testSonuclari.cevaplar)
    };

    // Oturum durumunu sorgula
    let isAuthenticated = false;
    try {
      const authRes = await fetch('/api/auth/me');
      if (authRes.ok) {
        const authData = await authRes.json();
        isAuthenticated = authData.authenticated;
      }
    } catch (e) {}

    // Giriş yapmışsa DB'ye kaydet, misafir ise localStorage'a sakla (kayıt olunca aktarılacak)
    if (isAuthenticated) {
      try {
        await fetch('/api/auth/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        try {
          localStorage.removeItem('lumina_pending_guest_result');
        } catch (e) {}
      } catch (e) {
        console.warn('Test sonucu kaydedilirken hata:', e);
      }
    } else {
      try {
        localStorage.setItem('lumina_pending_guest_result', JSON.stringify(payload));
      } catch (e) {
        console.warn('Misafir test sonucu localStorage kaydı başarısız:', e);
      }
    }

    // Arayüzü doldur
    renderTestSonucPaneli(payload, isAuthenticated);
  }

  function renderTestSonucPaneli(result, isAuthenticated) {
    const analizBekleme = document.getElementById('analiz-bekleme-ekrani');
    const sonucIcerik = document.getElementById('test-sonuc-icerik');
    if (analizBekleme) analizBekleme.classList.add('test-hidden');
    if (sonucIcerik) sonucIcerik.classList.remove('test-hidden');

    const styleNames = {
      'gorsel': 'Görsel Öğrenme (Visual)',
      'isitsel': 'İşitsel Öğrenme (Auditory)',
      'yazarak': 'Yazarak Öğrenme (Writing)',
      'okuyarak': 'Okuyarak Öğrenme (Reading)',
      'deneyimsel': 'Deneyimsel Öğrenme (Experiential)'
    };

    const domBadge = document.getElementById('test-dominant-badge');
    if (domBadge) {
      const dName = styleNames[result.dominant_style] || result.dominant_style;
      const dPct = Math.round(result[`score_${result.dominant_style}`] || 0);
      domBadge.textContent = `🏆 Baskın Modelin: ${dName} (%${dPct})`;
    }

    // Barları doldur
    ['gorsel', 'isitsel', 'yazarak', 'okuyarak', 'deneyimsel'].forEach(key => {
      const val = Math.round(result[`score_${key}`] || 0);
      const valEl = document.getElementById(`res-val-${key}`);
      const barEl = document.getElementById(`res-bar-${key}`);
      if (valEl) valEl.textContent = `%${val}`;
      if (barEl) barEl.style.width = `${val}%`;
    });

    // 3D Beyin Modelini aktifleştir
    if (window.activateBrainModel) {
      window.activateBrainModel(result.dominant_style);
    }

    // Misafir ise giriş yap davet kutusu göster
    const guestPrompt = document.getElementById('guest-auth-prompt');
    if (guestPrompt) {
      if (!isAuthenticated) {
        guestPrompt.classList.remove('test-hidden');
      } else {
        guestPrompt.classList.add('test-hidden');
      }
    }

    // Eğer bir Dashboard modalı içindeyse ve Dashboard açıksa
    if (window.refreshDashboardAfterTest) {
      window.refreshDashboardAfterTest(result);
    }
  }

  // =====================================================================
  // BAŞLATMA
  // =====================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initSoru1();
    initSoru2();
    initSoru3();
    initSoru4();
    initSoru5();

    const btnTesteBasla = document.getElementById('btn-teste-basla');
    if (btnTesteBasla) {
      btnTesteBasla.addEventListener('click', () => {
        const giris = document.getElementById('test-giris');
        if (giris) giris.classList.add('test-hidden');
        window.luminaSonrakiSoruyaGec(1);
      });
    }
  });

})();
