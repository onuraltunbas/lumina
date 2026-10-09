/**
 * Lumina Studio - Interactive Handlers & FastAPI API Bridge
 */
(function() {
  'use strict';

  // Smooth scroll support for hash anchors
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId.length > 1 && !targetId.startsWith('#http')) {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
            if (history.pushState) {
              history.pushState(null, null, targetId);
            }
          }
        }
      });
    });
  }

  // Interaction engine refresh
  function initEngineRefresh() {
    if (window.Webflow && window.Webflow.require) {
      try {
        const ix2 = window.Webflow.require('ix2');
        if (ix2 && ix2.init) {
          ix2.init();
        }
      } catch(e) {}
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }

  // Navbar Auth Durumu Senkronizasyonu
  async function initNavbarAuth() {
    const authBox = document.getElementById('nav-auth-container');
    const authBtnMobile = document.getElementById('nav-auth-btn-mobile');
    if (!authBox && !authBtnMobile) return;

    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) return;
      const data = await res.json();

      if (data.authenticated && data.user) {
        // Desktop Navbar: Panelim linki + Çıkış butonu
        if (authBox) {
          authBox.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
              <a href="/dashboard" class="nav-link" title="Panele Git" style="color: #7934ED;">
                🧠 ${escapeHtml(data.user.username)}
              </a>
              <button type="button" class="comic-nav-logout-btn" id="nav-quick-logout-btn" title="Çıkış Yap" style="background: none; border: none; cursor: pointer; font-size: 18px; padding: 0;">🚪</button>
            </div>
          `;

          const quickLogout = document.getElementById('nav-quick-logout-btn');
          if (quickLogout) {
            quickLogout.addEventListener('click', async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.reload();
            });
          }
        }

        // Mobile Navbar
        if (authBtnMobile) {
          authBtnMobile.href = '/dashboard';
          authBtnMobile.innerHTML = `🧠 Panelim (${escapeHtml(data.user.username)})`;
        }
      }
    } catch (e) {
      // Çevrimdışı veya hata durumunda varsayılan buton kalır
    }
  }

  // Mobil logoya tıklandığında menüyü aç / kapat
  function initMobileLogoMenuToggle() {
    const mobileBrands = document.querySelectorAll('.navbar-inner-mobile .navbar-brand-mobile');
    mobileBrands.forEach(function(brand) {
      brand.style.cursor = 'pointer';
      brand.setAttribute('role', 'button');
      brand.setAttribute('aria-label', 'Menüyü Aç/Kapat');
      brand.setAttribute('title', 'Menü');

      brand.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        const navInner = brand.closest('.navbar-inner-mobile');
        if (!navInner) return;
        const menuBtn = navInner.querySelector('.menu-button');
        if (menuBtn) {
          menuBtn.click();
        }
      });
    });
  }

  // Mobil menü bağlantısına tıklandığında menüyü otomatik kapat
  function initMobileNavAutoClose() {
    const mobileLinks = document.querySelectorAll('.nav-link-mobile');
    mobileLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        const navInner = link.closest('.navbar-inner-mobile');
        if (navInner) {
          const menuBtn = navInner.querySelector('.menu-button');
          if (menuBtn && menuBtn.classList.contains('w--open')) {
            menuBtn.click();
          }
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initSmoothScroll();
      initEngineRefresh();
      initNavbarAuth();
      initMobileLogoMenuToggle();
      initMobileNavAutoClose();
    });
  } else {
    initSmoothScroll();
    initEngineRefresh();
    initNavbarAuth();
    initMobileLogoMenuToggle();
    initMobileNavAutoClose();
  }
})();
