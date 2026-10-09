/**
 * Lumina Studio - Interactive Handlers & FastAPI API Bridge
 */
(function() {
  'use strict';

  function initContactForm() {
    const form = document.getElementById('email-form') || document.querySelector('form[data-name="Email Form"]');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      e.stopPropagation();

      const formBlock = form.closest('.w-form') || form.parentElement;
      const doneBlock = formBlock.querySelector('.w-form-done');
      const failBlock = formBlock.querySelector('.w-form-fail');
      const submitBtn = form.querySelector('input[type="submit"]') || form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? (submitBtn.value || submitBtn.textContent) : 'Submit';

      if (failBlock) {
        failBlock.style.display = 'none';
      }

      // Collect form fields
      const nameInput = form.querySelector('input[name="Name-6"]') || form.querySelector('#Name-6') || form.querySelector('input[name="name"]');
      const emailInput = form.querySelector('input[name="Email-4"]') || form.querySelector('#Email-4') || form.querySelector('input[name="email"]');
      const messageInput = form.querySelector('textarea[name="field-2"]') || form.querySelector('#field-2') || form.querySelector('textarea[name="message"]');

      const payload = {
        name: (nameInput ? nameInput.value : '').trim(),
        email: (emailInput ? emailInput.value : '').trim(),
        message: (messageInput ? messageInput.value : '').trim()
      };

      if (!payload.name || !payload.email || !payload.message) {
        if (failBlock) {
          failBlock.textContent = 'Please fill out all required fields.';
          failBlock.style.display = 'block';
        }
        return;
      }

      if (submitBtn) {
        if (submitBtn.tagName === 'INPUT') {
          submitBtn.value = 'Please wait...';
        } else {
          submitBtn.textContent = 'Please wait...';
        }
        submitBtn.disabled = true;
      }

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data.success) {
          form.style.display = 'none';
          if (doneBlock) {
            doneBlock.style.display = 'block';
            doneBlock.style.opacity = '1';
          }
        } else {
          if (failBlock) {
            failBlock.textContent = data.detail || 'Oops! Something went wrong while submitting the form.';
            failBlock.style.display = 'block';
          }
          if (submitBtn) {
            if (submitBtn.tagName === 'INPUT') submitBtn.value = originalBtnText;
            else submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
          }
        }
      } catch (err) {
        if (failBlock) {
          failBlock.textContent = 'Network error. Please try again.';
          failBlock.style.display = 'block';
        }
        if (submitBtn) {
          if (submitBtn.tagName === 'INPUT') submitBtn.value = originalBtnText;
          else submitBtn.textContent = originalBtnText;
          submitBtn.disabled = false;
        }
      }
    });
  }

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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initContactForm();
      initSmoothScroll();
      initEngineRefresh();
    });
  } else {
    initContactForm();
    initSmoothScroll();
    initEngineRefresh();
  }
})();
