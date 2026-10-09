/**
 * Lumina Studio - Profesyonel Çerez İzin & KVKK Yönetim Sistemi
 * 6698 sayılı KVKK ve e-Gizlilik standartlarına tam uyumlu,
 * Lumina Comic tasarım diliyle bütünleşik, karanlık/aydınlık tema destekli.
 */
(function() {
  'use strict';

  var CONSENT_KEY = 'lumina_cookie_consent';

  function getStoredConsent() {
    try {
      var raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      // Eski sürüm uyumluluğu
      if (parsed && parsed.choice) {
        return {
          necessary: true,
          functional: parsed.choice === 'all',
          timestamp: parsed.timestamp || new Date().toISOString(),
          version: '2.0'
        };
      }
      return parsed;
    } catch(e) {
      return null;
    }
  }

  function saveConsent(functionalAllowed) {
    try {
      var consentData = {
        necessary: true,
        functional: !!functionalAllowed,
        timestamp: new Date().toISOString(),
        version: '2.0'
      };
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData));

      // Eğer kullanıcı işlevsel çerezleri reddettiyse tema tercihini yerelden temizle
      if (!functionalAllowed) {
        try { localStorage.removeItem('lumina_theme'); } catch(e) {}
      }
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

  function openKvkkModal(initialTab) {
    var existing = document.getElementById('lumina-kvkk-modal-backdrop');
    if (existing) {
      existing.style.display = 'flex';
      syncModalState();
      if (initialTab) switchTab(initialTab);
      return;
    }

    var currentConsent = getStoredConsent();
    var functionalChecked = currentConsent ? currentConsent.functional : true;

    var backdrop = document.createElement('div');
    backdrop.id = 'lumina-kvkk-modal-backdrop';
    backdrop.className = 'lumina-kvkk-backdrop';
    backdrop.innerHTML = `
      <div class="lumina-kvkk-card" role="dialog" aria-modal="true" aria-labelledby="kvkk-title">
        <div class="lumina-kvkk-header">
          <div class="badge" style="background: #FEF08A; border: 2px solid #1D1D1D; color: #1D1D1D; box-shadow: 2px 2px 0px #000; display: inline-flex;">
            <div class="badge-text">🛡️ Kurumsal Aydınlatma &amp; Tercih Yönetimi</div>
          </div>
          <button type="button" class="lumina-kvkk-close" id="btn-close-kvkk" aria-label="Kapat">✖</button>
        </div>

        <h2 id="kvkk-title" style="margin-top: 12px; margin-bottom: 4px; font-size: 22px; font-family: 'Cabinet Grotesk', sans-serif;">
          Çerez Politikası ve KVKK Aydınlatma Metni
        </h2>
        <p style="font-size: 13px; color: #6B7280; margin-bottom: 12px;">
          6698 Sayılı Kanun Kapsamında Şeffaf Veri İşleme ve Tercih Yönetimi
        </p>

        <!-- Sekmeler -->
        <div class="lumina-kvkk-tabs" role="tablist">
          <button type="button" class="lumina-kvkk-tab-btn active" id="tab-btn-prefs" role="tab" aria-selected="true" aria-controls="tab-content-prefs">
            📋 Çerez Tercihleri &amp; Envanter
          </button>
          <button type="button" class="lumina-kvkk-tab-btn" id="tab-btn-legal" role="tab" aria-selected="false" aria-controls="tab-content-legal">
            📜 KVKK Aydınlatma Metni
          </button>
        </div>
        
        <div class="lumina-kvkk-body">
          <!-- SEKME 1: ÇEREZ TERCİHLERİ VE TABLO -->
          <div id="tab-content-prefs" class="lumina-kvkk-tab-pane active" role="tabpanel">
            <p style="font-size: 13.5px; line-height: 1.5; margin-bottom: 14px;">
              Lumina, platformun teknik işleyişi ve kullanıcı deneyimini optimize etmek için birinci taraf teknik araçlar kullanmaktadır. Aşağıdan tercihlerinizi yönetebilirsiniz:
            </p>

            <!-- 1. Zorunlu Çerezler -->
            <div class="lumina-cookie-pref-item">
              <div class="lumina-pref-header">
                <div class="lumina-pref-title">
                  <span>🔒 Zorunlu Teknik Çerezler (Oturum &amp; Güvenlik)</span>
                </div>
                <span class="lumina-pref-locked-badge">HER ZAMAN ETKİN</span>
              </div>
              <p class="lumina-pref-desc">
                Platformun güvenli ve kesintisiz çalışması, kullanıcı girişi (<code>lumina_session</code>), CSRF koruması ve temel sistem güvenliği için zorunludur. Devre dışı bırakılamaz.
              </p>
            </div>

            <!-- 2. İşlevsel Tercih Çerezleri -->
            <div class="lumina-cookie-pref-item">
              <div class="lumina-pref-header">
                <div class="lumina-pref-title">
                  <span>🎨 İşlevsel Tercihler (Arayüz &amp; Tema Seçimleri)</span>
                </div>
                <label class="lumina-toggle-switch" aria-label="İşlevsel Çerez Tercihi">
                  <input type="checkbox" id="kvkk-toggle-functional" ${functionalChecked ? 'checked' : ''}>
                  <span class="lumina-toggle-slider"></span>
                </label>
              </div>
              <p class="lumina-pref-desc">
                Seçtiğiniz Karanlık veya Aydınlık mod temasının (<code>lumina_theme</code>) ve görsel arayüz ayarlarınızın sonraki ziyaretlerinizde hatırlanması amacıyla tarayıcınızın yerel depolama alanında saklanır.
              </p>
            </div>

            <!-- Envanter Tablosu -->
            <h3 style="font-size: 15.5px; margin-top: 18px; margin-bottom: 8px;">📊 Şeffaf Çerez ve Depolama Envanteri</h3>
            <div class="lumina-cookie-table-wrapper">
              <table class="lumina-cookie-table">
                <thead>
                  <tr>
                    <th>Çerez / Depolama</th>
                    <th>Türü</th>
                    <th>Hukuki Dayanak</th>
                    <th>Süre</th>
                    <th>İşleme Amacı</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>lumina_session</code></td>
                    <td>Zorunlu / HTTP-Only</td>
                    <td>KVKK m. 5/2-c (Sözleşmenin İfası)</td>
                    <td>30 Gün / Oturum</td>
                    <td>Güvenli kullanıcı oturumu açma, kimlik doğrulama ve yetkilendirme.</td>
                  </tr>
                  <tr>
                    <td><code>lumina_theme</code></td>
                    <td>İşlevsel / localStorage</td>
                    <td>KVKK m. 5/2-f (Meşru Menfaat)</td>
                    <td>Kalıcı</td>
                    <td>Seçilen Karanlık/Aydınlık arayüz renk temasının hatırlanması.</td>
                  </tr>
                  <tr>
                    <td><code>lumina_cookie_consent</code></td>
                    <td>Zorunlu / localStorage</td>
                    <td>KVKK m. 5/2-ç &amp; f (Hukuki Yükümlülük)</td>
                    <td>Kalıcı</td>
                    <td>Çerez onay ve rıza tercihlerinin kaydedilmesi ve denetlenebilirliği.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- SEKME 2: HUKUKİ AYDINLATMA METNİ -->
          <div id="tab-content-legal" class="lumina-kvkk-tab-pane" role="tabpanel" style="display: none;">
            <div style="font-size: 14px; line-height: 1.6;">
              <h3 style="font-size: 16px; margin-top: 0; margin-bottom: 8px;">1. Veri Sorumlusu Kimliği</h3>
              <p>
                6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, <strong>Lumina Studio</strong> (“Lumina” veya “Platform”) olarak, veri sorumlusu sıfatıyla kullanıcılarımızın mahremiyetine ve kişisel verilerinin korunmasına azami hassasiyet göstermekteyiz.
              </p>

              <h3 style="font-size: 16px; margin-top: 16px; margin-bottom: 8px;">2. Kişisel Verilerin İşlenme Amaçları ve Hukuki Sebepleri</h3>
              <p>
                Platformumuzda toplanan kişisel veriler; KVKK’nın 5. maddesinin 2. fıkrasının (c) bendi (“Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması”), (ç) bendi (“Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi”) ve (f) bendi (“İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması”) hükümleri kapsamında;
              </p>
              <ul style="padding-left: 20px; margin-bottom: 12px;">
                <li>Kullanıcı hesabı oluşturulması, oturum güvenliğinin sağlanması ve kimlik doğrulama,</li>
                <li>Platformun teknik sürekliliği, siber güvenlik denetimi ve yetkisiz erişimlerin engellenmesi,</li>
                <li>Arayüz tercihleri (tema seçimi) doğrultusunda kullanıcı deneyiminin kişiselleştirilmesi,</li>
                <li>İletişim ve geri bildirim taleplerinin yönetilmesi amaçlarıyla işlenmektedir.</li>
              </ul>

              <h3 style="font-size: 16px; margin-top: 16px; margin-bottom: 8px;">3. Üçüncü Taraflara ve Yurt Dışına Aktarım Politikası</h3>
              <p>
                Platformumuzda Google, Meta veya reklam ağlarına ait <strong>üçüncü taraf reklam, pazarlama, hedefleme veya davranışsal analitik çerezleri KULLANILMAMAKTADIR</strong>. Kişisel verileriniz ticari veya pazarlama gayeleriyle üçüncü kişilere ya da yurt dışına kesinlikle aktarılmamaktadır.
              </p>

              <h3 style="font-size: 16px; margin-top: 16px; margin-bottom: 8px;">4. Gelecek Entegrasyonlar: Bilişsel Testler &amp; Yapay Zeka Rehberi (Chatbot)</h3>
              <p>
                Platformun geliştirme yol haritasında bulunan <strong>Etkileşimli Bilişsel Öğrenme Stili Testleri</strong> ve <strong>Yapay Zeka Tabanlı Pedagojik Rehber (Chatbot)</strong> özellikleri devreye girdiğinde; kullanıcıların sisteme sunduğu yanıtlar ve konuşma akışları yalnızca bireysel öğrenme analitiği üretmek ve pedagojik gelişim tavsiyeleri sunmak amacıyla işlenecektir. Bu sistemler kullanıma açıldığında aydınlatma metnimiz şeffaf biçimde güncellenecek ve ilgili modüller için kullanıcı rızası alınacaktır.
              </p>

              <h3 style="font-size: 16px; margin-top: 16px; margin-bottom: 8px;">5. KVKK Madde 11 Kapsamındaki Haklarınız ve Başvuru Usulü</h3>
              <p>
                Veri sahibi olarak; verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, amacına uygun kullanılıp kullanılmadığını öğrenme, eksik veya yanlış verilerin düzeltilmesini isteme, KVKK m. 7 uyarınca silinmesini talep etme ve kanuna aykırı işleme sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme haklarına sahipsiniz. Taleplerinizi platform içi iletişim kanalları veya resmi destek adresi üzerinden yazılı olarak iletebilirsiniz.
              </p>
            </div>
          </div>
        </div>

        <!-- Butonlar -->
        <div class="lumina-kvkk-footer">
          <button type="button" class="button w-inline-block" id="btn-kvkk-accept-all">
            <div class="button-front background-yellow" style="padding: 10px 20px;">
              <div class="button-text"><span>✅</span> Tümünü Kabul Et</div>
            </div>
            <div class="button-edge"></div>
          </button>

          <button type="button" class="button w-inline-block" id="btn-kvkk-save-prefs">
            <div class="button-front background-white" style="padding: 10px 18px;">
              <div class="button-text"><span>💾</span> Seçimleri Kaydet</div>
            </div>
            <div class="button-edge"></div>
          </button>

          <button type="button" class="lumina-cookie-secondary-btn" id="btn-kvkk-accept-necessary">
            Yalnızca Zorunluları Onayla
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    // Sekme Geçişleri
    var tabBtnPrefs = document.getElementById('tab-btn-prefs');
    var tabBtnLegal = document.getElementById('tab-btn-legal');
    var tabContentPrefs = document.getElementById('tab-content-prefs');
    var tabContentLegal = document.getElementById('tab-content-legal');

    function switchTab(tab) {
      if (tab === 'legal') {
        tabBtnLegal.classList.add('active');
        tabBtnPrefs.classList.remove('active');
        tabContentLegal.style.display = 'block';
        tabContentPrefs.style.display = 'none';
      } else {
        tabBtnPrefs.classList.add('active');
        tabBtnLegal.classList.remove('active');
        tabContentPrefs.style.display = 'block';
        tabContentLegal.style.display = 'none';
      }
    }

    tabBtnPrefs.addEventListener('click', function() { switchTab('prefs'); });
    tabBtnLegal.addEventListener('click', function() { switchTab('legal'); });

    // Event listeners
    backdrop.addEventListener('click', function(e) {
      if (e.target === backdrop) closeKvkkModal();
    });

    document.getElementById('btn-close-kvkk').addEventListener('click', closeKvkkModal);

    // Tümünü Kabul Et
    document.getElementById('btn-kvkk-accept-all').addEventListener('click', function() {
      var functionalToggle = document.getElementById('kvkk-toggle-functional');
      if (functionalToggle) functionalToggle.checked = true;
      saveConsent(true);
      closeKvkkModal();
    });

    // Seçimleri Kaydet
    document.getElementById('btn-kvkk-save-prefs').addEventListener('click', function() {
      var functionalToggle = document.getElementById('kvkk-toggle-functional');
      var isFunctional = functionalToggle ? functionalToggle.checked : false;
      saveConsent(isFunctional);
      closeKvkkModal();
    });

    // Yalnızca Zorunluları Kabul Et
    document.getElementById('btn-kvkk-accept-necessary').addEventListener('click', function() {
      var functionalToggle = document.getElementById('kvkk-toggle-functional');
      if (functionalToggle) functionalToggle.checked = false;
      saveConsent(false);
      closeKvkkModal();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeKvkkModal();
    });

    if (initialTab) switchTab(initialTab);
  }

  function syncModalState() {
    var current = getStoredConsent();
    var functionalToggle = document.getElementById('kvkk-toggle-functional');
    if (functionalToggle && current) {
      functionalToggle.checked = !!current.functional;
    }
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
            <div class="badge-text">🛡️ Gizlilik ve Çerez Tercihleri</div>
          </div>
        </div>

        <p class="lumina-cookie-text">
          Lumina, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, güvenli oturum devamlılığı (<code>lumina_session</code>) ve tema tercihlerinizin hatırlanması (<code>lumina_theme</code>) amacıyla birinci taraf teknik çerezler kullanmaktadır. Platformumuzda ticari reklam veya üçüncü taraf takip çerezi bulunmaz. Tercihlerinizi özelleştirebilir veya tümünü onaylayarak devam edebilirsiniz.
        </p>

        <div class="lumina-cookie-btn-row">
          <button type="button" class="button w-inline-block" id="btn-cookie-accept-all">
            <div class="button-front background-yellow" style="padding: 8px 16px; font-size: 14.5px;">
              <div class="button-text">Tümünü Kabul Et</div>
            </div>
            <div class="button-edge"></div>
          </button>

          <button type="button" class="button w-inline-block" id="btn-cookie-accept-nec">
            <div class="button-front background-white" style="padding: 8px 14px; font-size: 14px;">
              <div class="button-text">Yalnızca Zorunlu</div>
            </div>
            <div class="button-edge"></div>
          </button>

          <button type="button" class="lumina-cookie-detail-link" id="btn-cookie-open-modal">
            Tercihleri Özelleştir &amp; KVKK
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
      saveConsent(true);
    });

    document.getElementById('btn-cookie-accept-nec').addEventListener('click', function() {
      saveConsent(false);
    });

    document.getElementById('btn-cookie-open-modal').addEventListener('click', function(e) {
      e.preventDefault();
      openKvkkModal('prefs');
    });
  }

  // Footer veya sayfa içindeki "Çerez Tercihleri & KVKK" butonlarını dinle
  function bindFooterTriggers() {
    document.querySelectorAll('.cookie-prefs-trigger, [href="#kvkk"], #footer-cookie-prefs-link').forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        openKvkkModal('prefs');
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
    acceptAll: function() { saveConsent(true); },
    acceptNecessary: function() { saveConsent(false); },
    savePreferences: saveConsent,
    getConsent: getStoredConsent
  };
})();
