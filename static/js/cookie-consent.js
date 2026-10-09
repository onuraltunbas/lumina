/**
 * Lumina Studio - Çerez İzin & KVKK Aydınlatma Sistemi
 * 6698 sayılı KVKK ve e-Gizlilik standartlarına tam uyumlu,
 * Lumina Comic tasarım diliyle bütünleşik, karanlık/aydınlık tema destekli.
 */
(function() {
  'use strict';

  var CONSENT_KEY = 'lumina_cookie_consent';

  function getStoredConsent() {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch(e) {
      return null;
    }
  }

  function setConsent(choice) {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({
        choice: choice, // 'all' veya 'necessary'
        timestamp: new Date().toISOString(),
        version: '1.0'
      }));
    } catch(e) {}
    hideBanner();
  }

  function hideBanner() {
    var banner = document.getElementById('lumina-cookie-banner');
    if (banner) {
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(20px)';
      setTimeout(function() {
        if (banner.parentNode) banner.parentNode.removeChild(banner);
      }, 300);
    }
  }

  function openKvkkModal() {
    var existing = document.getElementById('lumina-kvkk-modal-backdrop');
    if (existing) {
      existing.style.display = 'flex';
      return;
    }

    var backdrop = document.createElement('div');
    backdrop.id = 'lumina-kvkk-modal-backdrop';
    backdrop.className = 'lumina-kvkk-backdrop';
    backdrop.innerHTML = `
      <div class="lumina-kvkk-card" role="dialog" aria-modal="true" aria-labelledby="kvkk-title">
        <div class="lumina-kvkk-header">
          <div class="badge" style="background: #FEF08A; border: 2px solid #1D1D1D; color: #1D1D1D; box-shadow: 2px 2px 0px #000;">
            <div class="badge-text">📜 Aydınlatma Metni</div>
          </div>
          <button type="button" class="lumina-kvkk-close" id="btn-close-kvkk" aria-label="Kapat">✖</button>
        </div>

        <h2 id="kvkk-title" style="margin-top: 14px; margin-bottom: 12px; font-size: 24px;">Çerez Politikası ve KVKK Aydınlatması</h2>
        
        <div class="lumina-kvkk-body">
          <p>
            <strong>Lumina Studio</strong> olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında kullanıcılarımızın mahremiyetine ve veri güvenliğine azami özen gösteriyoruz.
          </p>

          <h3 style="font-size: 17px; margin-top: 18px; margin-bottom: 8px;">1. Kullanılan Çerezler ve Yerel Veriler</h3>
          <p style="font-size: 14px; color: inherit; margin-bottom: 12px;">
            Platformumuzda <strong>üçüncü taraf reklam, pazarlama veya kullanıcı takip çerezleri KULLANILMAMAKTADIR</strong>. Yalnızca sistemin çalışması için gereken teknik çerezler ve tercihler yer alır:
          </p>

          <div class="lumina-cookie-table-wrapper">
            <table class="lumina-cookie-table">
              <thead>
                <tr>
                  <th>Adı</th>
                  <th>Türü</th>
                  <th>Süre</th>
                  <th>Kullanım Amacı</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>lumina_session</code></td>
                  <td>Zorunlu / HTTP-Only</td>
                  <td>30 Gün</td>
                  <td>Güvenli kullanıcı oturumunun korunması ve kimlik doğrulama.</td>
                </tr>
                <tr>
                  <td><code>lumina_theme</code></td>
                  <td>İşlevsel / localStorage</td>
                  <td>Kalıcı</td>
                  <td>Seçtiğiniz Karanlık veya Aydınlık mod temasının hatırlanması.</td>
                </tr>
                <tr>
                  <td><code>lumina_cookie_consent</code></td>
                  <td>Zorunlu / localStorage</td>
                  <td>Kalıcı</td>
                  <td>Çerez onay tercihinizin hatırlanması.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 style="font-size: 17px; margin-top: 20px; margin-bottom: 8px;">2. Gelecek Özellikler (Chatbot &amp; Testler)</h3>
          <p style="font-size: 14px; line-height: 1.5; margin-bottom: 12px;">
            Yakında sisteme dahil edilecek interaktif <strong>Yapay Zeka Eğitim Rehberi (Chatbot)</strong> ve <strong>Detaylı Öğrenme Stili Testleri</strong> yayına girdiğinde; yalnızca konuşma akışınızı sürdürmek ve pedagojik test skorlarınızı bireysel panelinize yansıtmak amacıyla oturumunuza bağlı eğitim verileri işlenecektir. Bu özellikler devreye alındığında aydınlatma metnimiz şeffaf bir şekilde güncellenecektir.
          </p>

          <h3 style="font-size: 17px; margin-top: 20px; margin-bottom: 8px;">3. KVKK Madde 11 Kapsamındaki Haklarınız</h3>
          <p style="font-size: 14px; line-height: 1.5; margin-bottom: 0;">
            Kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, silinmesini veya düzeltilmesini isteme haklarına sahipsiniz. İletişim sayfamızdan dilediğiniz zaman destek ekibimize başvurabilirsiniz.
          </p>
        </div>

        <div class="lumina-kvkk-footer">
          <button type="button" class="button w-inline-block" id="btn-kvkk-accept-all">
            <div class="button-front background-yellow" style="padding: 10px 22px;">
              <div class="button-text"><span>✅</span> Tümünü Kabul Et</div>
            </div>
            <div class="button-edge"></div>
          </button>

          <button type="button" class="button w-inline-block" id="btn-kvkk-accept-necessary">
            <div class="button-front background-white" style="padding: 10px 18px;">
              <div class="button-text">Yalnızca Zorunlular</div>
            </div>
            <div class="button-edge"></div>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    // Event listeners
    backdrop.addEventListener('click', function(e) {
      if (e.target === backdrop) closeKvkkModal();
    });

    document.getElementById('btn-close-kvkk').addEventListener('click', closeKvkkModal);

    document.getElementById('btn-kvkk-accept-all').addEventListener('click', function() {
      setConsent('all');
      closeKvkkModal();
    });

    document.getElementById('btn-kvkk-accept-necessary').addEventListener('click', function() {
      setConsent('necessary');
      closeKvkkModal();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeKvkkModal();
    });
  }

  function closeKvkkModal() {
    var backdrop = document.getElementById('lumina-kvkk-modal-backdrop');
    if (backdrop) backdrop.style.display = 'none';
  }

  function injectBanner() {
    if (getStoredConsent()) return; // Zaten onaylanmış

    var banner = document.createElement('div');
    banner.id = 'lumina-cookie-banner';
    banner.className = 'lumina-cookie-banner';
    banner.innerHTML = `
      <div class="lumina-cookie-banner-inner">
        <div class="lumina-cookie-badge-row">
          <div class="badge" style="background: #FEF08A; border: 2px solid #1D1D1D; color: #1D1D1D; box-shadow: 2px 2px 0px #000; display: inline-flex;">
            <div class="badge-text">🍪 Çerezler &amp; KVKK</div>
          </div>
        </div>

        <p class="lumina-cookie-text">
          Lumina'da gizliliğinize önem veriyoruz. Sitemizde yalnızca oturum güvenliğinizi sağlamak (<code>lumina_session</code>) ve tema tercihinizi hatırlamak (<code>lumina_theme</code>) amacıyla zorunlu ve işlevsel teknik çerezler kullanılmaktadır. Reklam veya izleme çerezi bulunmaz.
        </p>

        <div class="lumina-cookie-btn-row">
          <button type="button" class="button w-inline-block" id="btn-cookie-accept-all">
            <div class="button-front background-yellow" style="padding: 8px 16px; font-size: 14.5px;">
              <div class="button-text">Kabul Et</div>
            </div>
            <div class="button-edge"></div>
          </button>

          <button type="button" class="button w-inline-block" id="btn-cookie-accept-nec">
            <div class="button-front background-white" style="padding: 8px 14px; font-size: 14px;">
              <div class="button-text">Zorunlu Çerezler</div>
            </div>
            <div class="button-edge"></div>
          </button>

          <button type="button" class="lumina-cookie-detail-link" id="btn-cookie-open-modal">
            Detaylar &amp; KVKK
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Fade-in animasyonu
    requestAnimationFrame(function() {
      banner.style.opacity = '1';
      banner.style.transform = 'translateY(0)';
    });

    document.getElementById('btn-cookie-accept-all').addEventListener('click', function() {
      setConsent('all');
    });

    document.getElementById('btn-cookie-accept-nec').addEventListener('click', function() {
      setConsent('necessary');
    });

    document.getElementById('btn-cookie-open-modal').addEventListener('click', function(e) {
      e.preventDefault();
      openKvkkModal();
    });
  }

  // Footer veya sayfa içindeki "Çerez Tercihleri & KVKK" butonlarını dinle
  function bindFooterTriggers() {
    document.querySelectorAll('.cookie-prefs-trigger, [href="#kvkk"], #footer-cookie-prefs-link').forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        openKvkkModal();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      injectBanner();
      bindFooterTriggers();
    });
  } else {
    injectBanner();
    bindFooterTriggers();
  }

  // Global API
  window.LuminaCookie = {
    openModal: openKvkkModal,
    closeModal: closeKvkkModal,
    acceptAll: function() { setConsent('all'); },
    acceptNecessary: function() { setConsent('necessary'); },
    getConsent: getStoredConsent
  };
})();
