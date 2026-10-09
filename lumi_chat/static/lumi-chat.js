/* Lumi Chat widget — dashboard'a tek satırla eklenir:
 *   <script src="/api/chat/widget.js" defer></script>
 */
(function () {
  'use strict';
  if (window.__lumiLoaded) return;
  window.__lumiLoaded = true;

  // CSS'i yükle
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/api/chat/widget.css';
  document.head.appendChild(link);

  var state = { busy: false, initDone: false, cfg: null, usage: null };

  // ---------- Yardımcılar ----------
  function esc(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // Güvenli mini markdown: önce escape, sonra **kalın**, *italik*, "- " listeler
  function md(text) {
    var lines = esc(text).split(/\r?\n/);
    var html = '', inList = false, para = [];
    function flushPara() { if (para.length) { html += '<p>' + para.join('<br>') + '</p>'; para = []; } }
    lines.forEach(function (ln) {
      var m = ln.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)$/);
      if (m) {
        flushPara();
        if (!inList) { html += '<ul>'; inList = true; }
        html += '<li>' + m[1] + '</li>';
      } else {
        if (inList) { html += '</ul>'; inList = false; }
        if (ln.trim()) para.push(ln); else flushPara();
      }
    });
    flushPara();
    if (inList) html += '</ul>';
    return html
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function dayLabel(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  // ---------- DOM ----------
  var root = el('div');
  root.id = 'lumi-root';
  root.innerHTML =
    '<div id="lumi-panel" role="dialog" aria-label="Lumi sohbet">' +
    '  <div class="lumi-header">' +
    '    <div class="lumi-avatar">💡</div>' +
    '    <div><div class="lumi-title">Lumi</div><div class="lumi-sub">Çalışma arkadaşın</div></div>' +
    '    <button class="lumi-close" aria-label="Kapat">✕</button>' +
    '  </div>' +
    '  <div class="lumi-notice" style="display:none"></div>' +
    '  <div class="lumi-messages" aria-live="polite"></div>' +
    '  <div class="lumi-quick"></div>' +
    '  <form class="lumi-input">' +
    '    <textarea rows="1" placeholder="Lumi\'ye bir şey sor..." aria-label="Mesaj"></textarea>' +
    '    <button type="submit" class="lumi-send" aria-label="Gönder">➤</button>' +
    '  </form>' +
    '  <div class="lumi-footer"><span class="lumi-count"></span><span class="lumi-usage"></span></div>' +
    '</div>' +
    '<button id="lumi-fab" aria-label="Lumi ile sohbet et">💡</button>';

  function mount() {
    document.body.appendChild(root);
    var $ = function (s) { return root.querySelector(s); };
    var panel = $('#lumi-panel'), fab = $('#lumi-fab'), msgs = $('.lumi-messages'),
        quick = $('.lumi-quick'), form = $('.lumi-input'), ta = $('textarea'),
        sendBtn = $('.lumi-send'), notice = $('.lumi-notice'),
        countEl = $('.lumi-count'), usageEl = $('.lumi-usage');

    function scroll() { msgs.scrollTop = msgs.scrollHeight; }
    function addMsg(role, text, extra) {
      var cls = 'lumi-msg ' + (role === 'model' ? 'bot' : role) + (extra ? ' ' + extra : '');
      var m = el('div', cls, role === 'model' ? md(text) : esc(text).replace(/\n/g, '<br>'));
      msgs.appendChild(m);
      scroll();
      return m;
    }
    function setBusy(b) {
      state.busy = b;
      sendBtn.disabled = b;
      quick.querySelectorAll('button').forEach(function (x) { x.disabled = b; });
    }
    function renderUsage() {
      if (!state.usage) return;
      var u = state.usage;
      usageEl.textContent = 'Bugün: ' + u.day_used + '/' + u.day_limit;
    }
    function updateCount() {
      var max = state.cfg ? state.cfg.max_input_chars : 500;
      countEl.textContent = ta.value.length + '/' + max;
      countEl.style.color = ta.value.length > max ? '#DC2626' : '';
    }

    async function init() {
      try {
        var r = await fetch('/api/chat/init', { credentials: 'same-origin' });
        if (r.status === 401) { addMsg('system', 'Lumi ile konuşmak için giriş yapmalısın.'); return; }
        var d = await r.json();
        state.cfg = d; state.usage = d.usage; state.initDone = true;

        if (!d.has_test) {
          notice.innerHTML = '🧪 Testi henüz çözmedin, bu yüzden ipuçlarım genel. <a href="/test">Testi çöz</a>, sana özel öneriler vereyim!';
          notice.style.display = 'block';
        }

        var lastDay = null;
        d.history.forEach(function (m) {
          var day = m.created_at ? dayLabel(m.created_at) : null;
          if (day && day !== lastDay) { msgs.appendChild(el('div', 'lumi-day', day)); lastDay = day; }
          addMsg(m.role, m.content, m.blocked ? 'blocked' : '');
        });
        if (!d.history.length) {
          addMsg('model', 'Selam **' + d.username + '**! 👋 Ben Lumi. ' +
            (d.has_test ? 'Test sonucuna göre sana özel çalışma ipuçları verebilirim.' : 'Sana çalışma teknikleri konusunda yardım edebilirim.') +
            ' Ne sormak istersin?');
        }
        d.quick_prompts.forEach(function (q) {
          var b = el('button', 'lumi-chip', esc(q));
          b.type = 'button';
          b.onclick = function () { send(q); };
          quick.appendChild(b);
        });
        ta.maxLength = d.max_input_chars + 50;
        renderUsage(); updateCount();
      } catch (e) {
        addMsg('system', 'Lumi yüklenemedi, sayfayı yenilemeyi dener misin?');
      }
    }

    async function send(text) {
      text = (text || '').trim();
      if (!text || state.busy) return;
      setBusy(true);
      ta.value = ''; ta.style.height = ''; updateCount();
      var userBubble = addMsg('user', text);

      var bot = addMsg('model', '');
      bot.innerHTML = '<span class="lumi-typing"><span></span><span></span><span></span><em>Lumi yazıyor...</em></span>';

      try {
        var r = await fetch('/api/chat/send', {
          method: 'POST', credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        if (!r.ok) {
          var err = {};
          try { err = await r.json(); } catch (_) {}
          bot.remove();
          if (r.status === 400 && err.error !== 'too_long' && err.error !== 'empty') userBubble.classList.add('blocked');
          if (err.usage) { state.usage = err.usage; renderUsage(); }
          addMsg('system', err.detail || 'Bir hata oluştu.');
          return;
        }
        var reader = r.body.getReader(), dec = new TextDecoder(), full = '';
        while (true) {
          var chunk = await reader.read();
          if (chunk.done) break;
          full += dec.decode(chunk.value, { stream: true });
          bot.innerHTML = md(full);
          scroll();
        }
        if (!full) bot.innerHTML = md('(boş cevap)');
        if (state.usage) { state.usage.day_used++; renderUsage(); }
      } catch (e) {
        bot.remove();
        addMsg('system', 'Bağlantı hatası. İnternetini kontrol edip tekrar dener misin?');
      } finally {
        setBusy(false);
        ta.focus();
      }
    }

    fab.onclick = function () {
      root.classList.toggle('is-open');
      if (root.classList.contains('is-open')) {
        if (!state.initDone) init();
        setTimeout(function () { ta.focus(); scroll(); }, 50);
      }
    };
    $('.lumi-close').onclick = function () { root.classList.remove('is-open'); };
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') root.classList.remove('is-open');
    });
    form.onsubmit = function (e) { e.preventDefault(); send(ta.value); };
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(ta.value); }
    });
    ta.addEventListener('input', function () {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 110) + 'px';
      updateCount();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
