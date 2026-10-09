/**
 * Lumina Theme Manager (Light / Dark Mode)
 * Based on shadcn SwitchMode from registry.watermelon.sh
 */
(function() {
  'use strict';

  var THEME_KEY = 'lumina_theme';

  function getSystemTheme() {
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }

  function getActiveTheme() {
    return getStoredTheme() || getSystemTheme();
  }

  function applyTheme(theme, save) {
    var isDark = theme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }

    if (save) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (e) {}
    }

    // Update all theme switch buttons on page
    var switches = document.querySelectorAll('.switch-mode');
    switches.forEach(function(sw) {
      sw.setAttribute('aria-checked', isDark ? 'true' : 'false');
      sw.setAttribute('title', isDark ? 'Aydınlık moda geç' : 'Karanlık moda geç');
    });

    // Notify other components if needed
    window.dispatchEvent(new CustomEvent('luminathemechange', {
      detail: { theme: theme, isDark: isDark }
    }));
  }

  function toggleTheme() {
    var isCurrentlyDark = document.documentElement.classList.contains('dark-theme');
    var nextTheme = isCurrentlyDark ? 'light' : 'dark';
    applyTheme(nextTheme, true);
  }

  function initThemeSwitches() {
    var switches = document.querySelectorAll('.switch-mode');
    switches.forEach(function(sw) {
      if (sw.dataset.themeBound) return;
      sw.dataset.themeBound = 'true';

      sw.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleTheme();
      });

      sw.addEventListener('keydown', function(e) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          toggleTheme();
        }
      });
    });

    // Sync button state
    var isDark = document.documentElement.classList.contains('dark-theme');
    switches.forEach(function(sw) {
      sw.setAttribute('aria-checked', isDark ? 'true' : 'false');
      sw.setAttribute('title', isDark ? 'Aydınlık moda geç' : 'Karanlık moda geç');
    });
  }

  // Handle system preference changes
  if (window.matchMedia) {
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        if (!getStoredTheme()) {
          applyTheme(e.matches ? 'dark' : 'light', false);
        }
      });
    } catch (e) {}
  }

  // Initialize switches
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeSwitches);
  } else {
    initThemeSwitches();
  }

  // Public API
  window.LuminaTheme = {
    toggle: toggleTheme,
    set: function(t) { applyTheme(t, true); },
    get: getActiveTheme,
    isDark: function() { return document.documentElement.classList.contains('dark-theme'); }
  };
})();
