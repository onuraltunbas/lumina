/**
 * Lumina Studio - GSAP ScrollTrigger Cartoon Animations
 * Sırada:
 * 1. (Öğe 3): 3 Aşamalı Yol Haritası (Timeline) Scroll Reveal & Dot Pop
 * 2. (Öğe 2): Doodle & İllüstrasyon Parallax, Float & Rotation
 * 3. (Öğe 4): Başarı Taktikleri Kartları Giriş Efekti
 * 4. (Öğe 1): 5 Öğrenme Modeli Kartları Stagger Pop (Çizgi Film Zıplama)
 */

(function () {
  'use strict';

  function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[Lumina] GSAP veya ScrollTrigger henüz yüklenmedi.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // =========================================================================
    // 1. (ÖĞE 3): 3 AŞAMALI YOL HARİTASI (TIMELINE) SCROLL REVEAL & DOT POP
    // =========================================================================
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length > 0) {
      timelineItems.forEach((item, index) => {
        const dot = item.querySelector('.timeline-dot');
        const content = item.querySelector('.timeline-content');
        const label = item.querySelector('.timeline-info');

        // Başlangıç durumu
        gsap.set(item, { opacity: 0.4, scale: 0.96, x: 20 });
        if (dot) gsap.set(dot, { scale: 0.8 });

        // ScrollTrigger ile merkez yaklaştıkça aktifleşme
        ScrollTrigger.create({
          trigger: item,
          start: 'top 75%',
          end: 'bottom 45%',
          toggleActions: 'play reverse play reverse',
          onEnter: () => {
            gsap.to(item, {
              opacity: 1,
              scale: 1,
              x: 0,
              duration: 0.5,
              ease: 'back.out(1.4)'
            });
            if (dot) {
              gsap.fromTo(
                dot,
                { scale: 0.8 },
                {
                  scale: 1.25,
                  duration: 0.35,
                  yoyo: true,
                  repeat: 1,
                  ease: 'power2.out'
                }
              );
            }
          },
          onLeaveBack: () => {
            gsap.to(item, {
              opacity: 0.4,
              scale: 0.96,
              x: 20,
              duration: 0.4,
              ease: 'power2.in'
            });
          }
        });
      });
    }

    // =========================================================================
    // 2. (ÖĞE 2): DOODLE VE İLLÜSTRASYONLARIN PARALLAX, FLOAT & ROTASYONU
    // =========================================================================
    // Parallax ve süzülme animasyonları
    const doodles = [
      { sel: '.doodle-shine', y: -50, rot: 35 },
      { sel: '.doodle-breeze', y: 40, rot: -25 },
      { sel: '.doodle-flash', y: -45, rot: 20 },
      { sel: '.doodle-shine-purple', y: 35, rot: -30 },
      { sel: '.doodle-wave', y: -60, rot: 15 },
      { sel: '.doodle-heart', y: 30, rot: -20 },
      { sel: '.doodle-arrow', y: -40, rot: 25 },
      { sel: '.doodle-scribble', y: -55, rot: -15 },
      { sel: '.doodle-shine-pink', y: 45, rot: 30 },
      { sel: '.doodle-clink', y: -35, rot: -25 },
      { sel: '.doodle-cloud', y: 50, rot: 10 }
    ];

    doodles.forEach((d) => {
      const el = document.querySelector(d.sel);
      if (el) {
        // Kaydırmaya duyarlı parallax
        gsap.to(el, {
          scrollTrigger: {
            trigger: el.parentElement || el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
          },
          y: d.y,
          rotation: d.rot,
          ease: 'none'
        });

        // Küçük sürekli cartoon nefes alma / süzülme hareketi (idle float)
        gsap.to(el, {
          y: '+=8',
          rotation: '+=4',
          duration: 2.2 + Math.random(),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }
    });

    // Dönen yıldız rozetler (star-badge)
    const heroStar = document.querySelector('#home .star-badge, .hero-grid .star-badge');
    if (heroStar) {
      gsap.set(heroStar, { rotation: 0, transformOrigin: 'center center' });
      gsap.to(heroStar, {
        scrollTrigger: {
          trigger: '#home',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8
        },
        rotation: 360,
        ease: 'none'
      });
    }

    const blueStar = document.querySelector('.star-badge-blue');
    if (blueStar) {
      gsap.set(blueStar, { rotation: 0, transformOrigin: 'center center' });
      gsap.to(blueStar, {
        scrollTrigger: {
          trigger: '#about',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8
        },
        rotation: 360,
        ease: 'none'
      });
    }

    // =========================================================================
    // 3. (ÖĞE 4): BAŞARI TAKTİKLERİ KARTLARI GİRİŞ EFEKTİ (SLIDE & POP)
    // =========================================================================
    const tacticItems = document.querySelectorAll('.portfolio-grid .w-dyn-item');
    if (tacticItems.length > 0) {
      tacticItems.forEach((item, idx) => {
        const fromLeft = idx % 2 === 0;
        gsap.from(item, {
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          x: fromLeft ? -45 : 45,
          y: 30,
          opacity: 0,
          rotation: fromLeft ? -2.5 : 2.5,
          scale: 0.94,
          duration: 0.75,
          delay: (idx % 2) * 0.1,
          ease: 'back.out(1.4)'
        });
      });
    }

    // =========================================================================
    // 4. (ÖĞE 1): 5 ÖĞRENME MODELİ KARTLARI STAGGER POP (CARTOON ZIPLAMA)
    // =========================================================================
    const modelCards = document.querySelectorAll('.services-grid .card');
    if (modelCards.length > 0) {
      gsap.from(modelCards, {
        scrollTrigger: {
          trigger: '.services-grid',
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        y: 60,
        opacity: 0,
        scale: 0.82,
        rotation: (i) => (i % 2 === 0 ? -2 : 2),
        duration: 0.7,
        stagger: 0.12,
        ease: 'back.out(1.7)' // Çizgi film yaylanma (bounce/pop) efekti
      });
    }

    // Sayfa içi hash bağlantılarında ScrollTrigger'ı yenile
    ScrollTrigger.refresh();
  }

  // DOM hazır olduğunda başlat
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimations);
  } else {
    // Küçük bir gecikmeyle DOM stilleri hesaplandıktan sonra başlat
    setTimeout(initScrollAnimations, 100);
  }

  // Sayfa tamamen yüklendiğinde hesaplamaları tazele
  window.addEventListener('load', () => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });
})();
