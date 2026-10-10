/* Lumi Chat Widget — Lumina Canlı Karakter & Yapay Zeka Asistanı */
(function () {
  'use strict';
  if (window.__lumiLoaded) return;
  window.__lumiLoaded = true;

  // CSS Enjeksiyonu
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/api/chat/widget.css';
  document.head.appendChild(link);

  var isDashboard = window.location.pathname.indexOf('/dashboard') !== -1;
  var isHomepage = (window.location.pathname === '/' || window.location.pathname === '/index.html');
  var msgCounter = 0;
  var state = {
    busy: false,
    initDone: false,
    cfg: null,
    usage: null,
    is_guest: false,
    guest_used: false,
    currentMood: 'normal',
    sleepTimer: null
  };

  // 12 Canlı Duygu Rozet Başlıkları
  var MOOD_LABELS = {
    'normal': '✨ Hazır',
    'dinliyor': '👂 Dinliyor...',
    'dusunuyor': '🧠 Düşünüyor...',
    'taktik': '💡 Taktik Buldu!',
    'mutlu': '😊 Mutlu',
    'heyecanli': '🎉 Harika!',
    'merakli': '🤔 İnceliyor...',
    'saskin': '😲 Şaşkın!',
    'mahcup': '😳 Teşekkürler',
    'teselli': '🤝 Yanındayım',
    'uyari': '🛡️ Koruma Modu',
    'uykulu': '💤 Dinleniyor...'
  };

  // Vektörel Karakter SVG Şablonu (Her parçaya izole stageId)
  function getLumiSvg(stageId, initialMood) {
    initialMood = initialMood || 'normal';
    var sid = stageId.replace(/[^a-zA-Z0-9_-]/g, '_');
    return (
      '<div class="lumi-character-stage" id="' + stageId + '" data-state="' + initialMood + '" style="width:100%; height:100%;">' +
      '<svg class="lumi-character-svg" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">' +
      '  <defs>' +
      '    <radialGradient id="bg_' + sid + '" cx="50%" cy="40%" r="65%">' +
      '      <stop offset="0%" stop-color="#FFFAF5"/>' +
      '      <stop offset="40%" stop-color="#FFF4EA"/>' +
      '      <stop offset="85%" stop-color="#EBE3D9"/>' +
      '      <stop offset="100%" stop-color="#D4C8C1"/>' +
      '    </radialGradient>' +
      '    <linearGradient id="tg_' + sid + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
      '      <stop offset="0%" stop-color="#FFFAF5"/>' +
      '      <stop offset="35%" stop-color="#FFF4EA"/>' +
      '      <stop offset="70%" stop-color="#A9D3FF"/>' +
      '      <stop offset="100%" stop-color="#82B9F5"/>' +
      '    </linearGradient>' +
      '    <linearGradient id="tgr_' + sid + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
      '      <stop offset="0%" stop-color="#FFFAF5"/>' +
      '      <stop offset="35%" stop-color="#FFF4EA"/>' +
      '      <stop offset="70%" stop-color="#A9D3FF"/>' +
      '      <stop offset="100%" stop-color="#82B9F5"/>' +
      '    </linearGradient>' +
      '    <radialGradient id="ag_' + sid + '" cx="40%" cy="30%" r="70%">' +
      '      <stop offset="0%" stop-color="#FFFAF5"/>' +
      '      <stop offset="70%" stop-color="#FFF4EA"/>' +
      '      <stop offset="100%" stop-color="#D4C8C1"/>' +
      '    </radialGradient>' +
      '    <radialGradient id="eg_' + sid + '" cx="45%" cy="65%" r="80%">' +
      '      <stop offset="0%" stop-color="#405B9B"/>' +
      '      <stop offset="50%" stop-color="#2D437A"/>' +
      '      <stop offset="85%" stop-color="#18264A"/>' +
      '      <stop offset="100%" stop-color="#0A1124"/>' +
      '    </radialGradient>' +
      '    <radialGradient id="cg_' + sid + '" cx="50%" cy="50%" r="50%">' +
      '      <stop offset="0%" stop-color="#FFA9BD" stop-opacity="0.85"/>' +
      '      <stop offset="45%" stop-color="#FFA9BD" stop-opacity="0.45"/>' +
      '      <stop offset="100%" stop-color="#FFA9BD" stop-opacity="0"/>' +
      '    </radialGradient>' +
      '    <radialGradient id="cgs_' + sid + '" cx="50%" cy="50%" r="50%">' +
      '      <stop offset="0%" stop-color="#FF7A9E" stop-opacity="0.95"/>' +
      '      <stop offset="45%" stop-color="#FF7A9E" stop-opacity="0.55"/>' +
      '      <stop offset="100%" stop-color="#FF7A9E" stop-opacity="0"/>' +
      '    </radialGradient>' +
      '    <clipPath id="cl_' + sid + '"><ellipse cx="300" cy="360" rx="46" ry="66"/></clipPath>' +
      '    <clipPath id="cr_' + sid + '"><ellipse cx="500" cy="360" rx="46" ry="66"/></clipPath>' +
      '    <filter id="go_' + sid + '" x="-150%" y="-150%" width="400%" height="400%">' +
      '      <feGaussianBlur stdDeviation="14" result="b1"/>' +
      '      <feGaussianBlur stdDeviation="24" result="b2"/>' +
      '      <feMerge><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '    </filter>' +
      '    <filter id="gob_' + sid + '" x="-200%" y="-200%" width="500%" height="500%">' +
      '      <feGaussianBlur stdDeviation="18" result="b1"/>' +
      '      <feGaussianBlur stdDeviation="38" result="b2"/>' +
      '      <feGaussianBlur stdDeviation="58" result="b3"/>' +
      '      <feMerge><feMergeNode in="b3"/><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '    </filter>' +
      '    <filter id="gop_' + sid + '" x="-150%" y="-150%" width="400%" height="400%">' +
      '      <feGaussianBlur stdDeviation="16" result="b1"/>' +
      '      <feGaussianBlur stdDeviation="30" result="b2"/>' +
      '      <feColorMatrix type="matrix" values="0.8 0 0 0 0  0 0.4 0 0 0  1 0 1 0 0  0 0 0 1 0" in="b2" result="pt"/>' +
      '      <feMerge><feMergeNode in="pt"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '    </filter>' +
      '    <filter id="god_' + sid + '" x="-100%" y="-100%" width="300%" height="300%">' +
      '      <feGaussianBlur stdDeviation="10" result="b1"/>' +
      '      <feMerge><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '    </filter>' +
      '    <filter id="gor_' + sid + '" x="-150%" y="-150%" width="400%" height="400%">' +
      '      <feGaussianBlur stdDeviation="16" result="b1"/>' +
      '      <feColorMatrix type="matrix" values="1 0 0 0 0  0 0.2 0 0 0  0 0.2 0 0 0  0 0 0 1 0" in="b1" result="rt"/>' +
      '      <feMerge><feMergeNode in="rt"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '    </filter>' +
      '  </defs>' +
      '  <g id="lumi-master" class="smooth-part">' +
      '    <g id="lumi-legs">' +
      '      <g id="lumi-leg-l" class="anim-part">' +
      '        <path d="M 310,650 C 270,650 280,710 320,715 C 360,720 370,660 350,650 Z" fill="url(#bg_' + sid + ')"/>' +
      '      </g>' +
      '      <g id="lumi-leg-r" class="anim-part">' +
      '        <path d="M 490,650 C 530,650 520,710 480,715 C 440,720 430,660 450,650 Z" fill="url(#bg_' + sid + ')"/>' +
      '      </g>' +
      '    </g>' +
      '    <g id="lumi-body" class="anim-part">' +
      '      <path d="M 310,480 C 200,530 220,680 400,680 C 580,680 600,530 490,480 C 450,460 350,460 310,480 Z" fill="url(#bg_' + sid + ')"/>' +
      '    </g>' +
      '    <g id="lumi-head-group" class="anim-part">' +
      '      <g id="lumi-tuft-l" class="anim-part">' +
      '        <path d="M 230,300 C 100,300 80,450 110,520 C 120,540 145,555 160,530 C 175,560 205,560 215,530 C 230,555 260,540 255,500 C 250,420 280,360 230,300 Z" fill="url(#tg_' + sid + ')"/>' +
      '      </g>' +
      '      <g id="lumi-tuft-r" class="anim-part">' +
      '        <path d="M 570,300 C 700,300 720,450 690,520 C 680,540 655,555 640,530 C 625,560 595,560 585,530 C 570,555 540,540 545,500 C 550,420 520,360 570,300 Z" fill="url(#tgr_' + sid + ')"/>' +
      '      </g>' +
      '      <path d="M 400,160 C 640,160 670,430 590,510 C 530,570 270,570 210,510 C 130,430 160,160 400,160 Z" fill="url(#bg_' + sid + ')"/>' +
      '      <circle id="cheek-l" class="anim-part cheek" cx="250" cy="420" r="45" fill="url(#cg_' + sid + ')"/>' +
      '      <circle id="cheek-r" class="anim-part cheek" cx="550" cy="420" r="45" fill="url(#cg_' + sid + ')"/>' +
      '      <path id="brow-l" class="anim-part brow" d="M 255,275 Q 300,255 345,278" fill="none" stroke="#18264A" stroke-width="10" stroke-linecap="round"/>' +
      '      <path id="brow-r" class="anim-part brow" d="M 545,275 Q 500,255 455,278" fill="none" stroke="#18264A" stroke-width="10" stroke-linecap="round"/>' +
      '      <g id="lumi-eyes" class="anim-part">' +
      '        <g class="eyes-blink">' +
      '          <g id="eye-wrap-l">' +
      '            <g class="eye-open-parts anim-part">' +
      '              <ellipse cx="300" cy="360" rx="45" ry="65" fill="url(#eg_' + sid + ')"/>' +
      '              <g id="pupils-l" class="anim-part pupils-group">' +
      '                <circle cx="315" cy="325" r="18" fill="#FFFFFF"/>' +
      '                <circle cx="285" cy="390" r="8" fill="#FFFFFF" opacity="0.8"/>' +
      '                <circle cx="325" cy="380" r="4" fill="#FFFFFF" opacity="0.5"/>' +
      '              </g>' +
      '            </g>' +
      '            <g clip-path="url(#cl_' + sid + ')">' +
      '              <g id="lid-l" class="lid anim-part">' +
      '                <rect x="200" y="140" width="200" height="155" fill="#FFF4EA"/>' +
      '                <line x1="200" y1="295" x2="400" y2="295" stroke="#18264A" stroke-width="8" stroke-linecap="round"/>' +
      '              </g>' +
      '            </g>' +
      '            <path id="eye-happy-l" class="eye-happy anim-part" d="M 260,375 Q 300,325 340,375" fill="none" stroke="#18264A" stroke-width="13" stroke-linecap="round"/>' +
      '          </g>' +
      '          <g id="eye-wrap-r">' +
      '            <g class="eye-open-parts anim-part">' +
      '              <ellipse cx="500" cy="360" rx="45" ry="65" fill="url(#eg_' + sid + ')"/>' +
      '              <g id="pupils-r" class="anim-part pupils-group">' +
      '                <circle cx="485" cy="325" r="18" fill="#FFFFFF"/>' +
      '                <circle cx="515" cy="390" r="8" fill="#FFFFFF" opacity="0.8"/>' +
      '                <circle cx="475" cy="380" r="4" fill="#FFFFFF" opacity="0.5"/>' +
      '              </g>' +
      '            </g>' +
      '            <g clip-path="url(#cr_' + sid + ')">' +
      '              <g id="lid-r" class="lid anim-part">' +
      '                <rect x="400" y="140" width="200" height="155" fill="#FFF4EA"/>' +
      '                <line x1="400" y1="295" x2="600" y2="295" stroke="#18264A" stroke-width="8" stroke-linecap="round"/>' +
      '              </g>' +
      '            </g>' +
      '            <path id="eye-happy-r" class="eye-happy anim-part" d="M 460,375 Q 500,325 540,375" fill="none" stroke="#18264A" stroke-width="13" stroke-linecap="round"/>' +
      '          </g>' +
      '        </g>' +
      '      </g>' +
      '      <g id="lumi-mouth">' +
      '        <path id="mouth-smile" class="mouth-shape anim-part" d="M 375,420 Q 400,442 425,420" fill="none" stroke="#663C4A" stroke-width="8" stroke-linecap="round"/>' +
      '        <path id="mouth-happy" class="mouth-shape anim-part" d="M 370,416 Q 400,465 430,416 Z" fill="#663C4A" stroke="#663C4A" stroke-width="5" stroke-linejoin="round"/>' +
      '        <ellipse id="mouth-o" class="mouth-shape anim-part" cx="400" cy="428" rx="14" ry="19" fill="#663C4A"/>' +
      '        <path id="mouth-sad" class="mouth-shape anim-part" d="M 375,436 Q 400,416 425,436" fill="none" stroke="#663C4A" stroke-width="8" stroke-linecap="round"/>' +
      '        <path id="mouth-flat" class="mouth-shape anim-part" d="M 382,426 L 418,426" stroke="#663C4A" stroke-width="8" stroke-linecap="round"/>' +
      '      </g>' +
      '      <g id="lumi-antenna" class="anim-part">' +
      '        <path d="M 400,175 Q 390,110 400,70" fill="none" stroke="#FFFAF5" stroke-width="10" stroke-linecap="round"/>' +
      '        <g class="orb-wrap smooth-part">' +
      '          <circle id="orb-core" class="smooth-part" cx="400" cy="55" r="30" fill="#FFE49A" filter="url(#go_' + sid + ')"/>' +
      '          <circle cx="400" cy="55" r="14" fill="#FFFFFF" opacity="0.9"/>' +
      '        </g>' +
      '      </g>' +
      '      <g id="efx-zzz" class="emotion-effect">' +
      '        <text x="560" y="200" fill="#A9D3FF" font-size="40" font-weight="bold" font-family="Nunito">Z</text>' +
      '        <text x="610" y="150" fill="#A9D3FF" font-size="30" font-weight="bold" font-family="Nunito">z</text>' +
      '        <text x="650" y="110" fill="#A9D3FF" font-size="20" font-weight="bold" font-family="Nunito">z</text>' +
      '      </g>' +
      '      <g id="efx-question" class="emotion-effect anim-part">' +
      '        <text x="540" y="220" fill="#FFE49A" font-size="70" font-weight="900" font-family="Nunito">?</text>' +
      '      </g>' +
      '      <g id="efx-stars" class="emotion-effect anim-part">' +
      '        <path d="M 160,120 L 170,150 L 200,160 L 170,170 L 160,200 L 150,170 L 120,160 L 150,150 Z" fill="#FFE49A"/>' +
      '        <path d="M 620,160 L 625,175 L 640,180 L 625,185 L 620,200 L 615,185 L 600,180 L 615,175 Z" fill="#FFF"/>' +
      '      </g>' +
      '    </g>' +
      '    <g id="lumi-arms">' +
      '      <g id="lumi-arm-l" class="anim-part">' +
      '        <path d="M 290,500 C 190,520 160,600 190,630 C 230,650 260,570 300,540 Z" fill="url(#ag_' + sid + ')"/>' +
      '      </g>' +
      '      <g id="lumi-arm-r" class="anim-part">' +
      '        <path d="M 510,500 C 610,520 640,600 610,630 C 570,650 540,570 500,540 Z" fill="url(#ag_' + sid + ')"/>' +
      '      </g>' +
      '    </g>' +
      '  </g>' +
      '</svg>' +
      '</div>'
    );
  }

  // ---------- Güvenli Mini Markdown & Yardımcılar ----------
  function esc(s) {
    return (s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function md(text) {
    var lines = esc(text).split(/\r?\n/);
    var html = '', inList = false, para = [];
    function flushPara() {
      if (para.length) { html += '<p>' + para.join('<br>') + '</p>'; para = []; }
    }
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

  // ---------- DOM Ağacını İnşa Et (Büyük Header Sahnesi & Shimeji Maskotu) ----------
  var root = el('div');
  root.id = 'lumi-root';
  root.innerHTML =
    '<div id="lumi-panel" role="dialog" aria-label="Lumi sohbet">' +
    '  <div class="lumi-header">' +
    '    <button class="lumi-close" aria-label="Kapat">✕</button>' +
    '    <div class="lumi-header-hero" id="lumi-header-hero" title="Lumi\'ye dokun! 😊">' +
    '      ' + getLumiSvg('stage-header', 'normal') +
    '    </div>' +
    '    <span class="lumi-mood-pill" id="lumi-mood-pill">✨ Hazır</span>' +
    '  </div>' +
    '  <div class="lumi-notice" style="display:none"></div>' +
    '  <div class="lumi-messages" aria-live="polite"></div>' +
    '  <div class="lumi-quick"></div>' +
    '  <form class="lumi-input">' +
    '    <textarea rows="1" placeholder="Lumi\'ye bir çalışma tekniği sor..." aria-label="Mesaj"></textarea>' +
    '    <button type="submit" class="lumi-send" aria-label="Gönder">➤</button>' +
    '  </form>' +
    '  <div class="lumi-footer"><span class="lumi-count">0/500</span><span class="lumi-usage"></span></div>' +
    '</div>' +
    '<div id="lumi-shimeji" class="lumi-shimeji" role="button" tabindex="0" aria-label="Lumi ile konuş veya gezdir" title="Lumi\'ye tıkla veya sürükle!">' +
    '  <div class="lumi-shimeji-bubble" id="lumi-shimeji-bubble" style="display:none;"></div>' +
    '  <div class="lumi-shimeji-body-wrap" id="lumi-shimeji-body-wrap">' +
    '    ' + getLumiSvg('stage-shimeji', 'normal') +
    '  </div>' +
    '  <div class="lumi-shimeji-shadow"></div>' +
    '</div>';

  function mount() {
    document.body.appendChild(root);
    var $ = function (s) { return root.querySelector(s); };
    var panel = $('#lumi-panel'),
        shimeji = $('#lumi-shimeji'),
        shimejiBody = $('#lumi-shimeji-body-wrap'),
        shimejiBubble = $('#lumi-shimeji-bubble'),
        stageHeader = document.getElementById('stage-header'),
        stageShimeji = document.getElementById('stage-shimeji'),
        msgs = $('.lumi-messages'),
        quick = $('.lumi-quick'),
        form = $('.lumi-input'),
        ta = $('textarea'),
        sendBtn = $('.lumi-send'),
        notice = $('.lumi-notice'),
        countEl = $('.lumi-count'),
        usageEl = $('.lumi-usage'),
        moodPill = $('#lumi-mood-pill'),
        headerHero = $('#lumi-header-hero');

    // Canlı Duygu / Mimik Güncelleyici (Tüm sahneleri senkronize eder)
    function setLumiMood(mood, tempDuration) {
      if (mood === 'uzgun') mood = 'teselli';
      if (mood === 'kizgin') mood = 'uyari';
      if (!MOOD_LABELS[mood]) mood = 'normal';
      state.currentMood = mood;
      if (stageHeader) stageHeader.setAttribute('data-state', mood);
      if (stageShimeji) stageShimeji.setAttribute('data-state', mood);
      if (moodPill) moodPill.textContent = MOOD_LABELS[mood] || '✨ Hazır';

      // 90 saniye hareketsizlikte uykuya dalma
      clearTimeout(state.sleepTimer);
      if (mood !== 'uykulu') {
        state.sleepTimer = setTimeout(function () {
          setLumiMood('uykulu');
        }, 90000);
      }

      if (tempDuration) {
        setTimeout(function () {
          if (state.currentMood === mood) {
            setLumiMood('normal');
          }
        }, tempDuration);
      }
    }

    function scroll() { msgs.scrollTop = msgs.scrollHeight; }

    // Mesaj Ekleme (Kullanıcı / Bot)
    function addMsg(role, text, extra, customCharId, initialCharMood) {
      var cls = 'lumi-msg ' + (role === 'model' ? 'bot' : role) + (extra ? ' ' + extra : '');
      var m = el('div', cls);

      if (role === 'model') {
        var charId = customCharId || ('char-' + (++msgCounter));
        var charWrap = el('div', 'lumi-msg-char-wrap');
        charWrap.innerHTML = getLumiSvg(charId, initialCharMood || 'normal');
        var bodyWrap = el('div', 'lumi-msg-body', text ? md(text) : '');
        m.appendChild(charWrap);
        m.appendChild(bodyWrap);
        m._charId = charId;
        m._body = bodyWrap;
      } else {
        m.innerHTML = esc(text).replace(/\n/g, '<br>');
      }

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

    // Karakterle Eğlenceli Etkileşim (Poke)
    headerHero.onclick = function () {
      var pokes = ['mutlu', 'saskin', 'mahcup', 'heyecanli'];
      var pick = pokes[Math.floor(Math.random() * pokes.length)];
      setLumiMood(pick, 2200);
    };

    async function init() {
      try {
        setLumiMood('merakli');
        var r = await fetch('/api/chat/init', { credentials: 'same-origin' });
        if (r.status === 401) {
          addMsg('system', 'Lumi ile konuşmak için giriş yapmalısın.');
          setLumiMood('teselli');
          return;
        }
        var d = await r.json();
        state.cfg = d;
        state.is_guest = !!d.is_guest;
        state.guest_used = !!d.guest_used || (localStorage.getItem('lumi_guest_asked') === '1');
        state.usage = d.usage;
        state.initDone = true;

        if (!isDashboard || state.is_guest) {
          usageEl.style.display = 'none'; // Kullanıcı "1 soru hakkı" yazısını hiçbir yerde görmesin
        }

        if (state.is_guest && state.guest_used) {
          ta.disabled = true;
          ta.placeholder = 'Sohbete devam etmek için giriş yap veya kayıt ol ✨';
          sendBtn.disabled = true;
        }

        if (!d.has_test && !state.is_guest) {
          notice.innerHTML = '🧪 Testi henüz çözmedin, bu yüzden ipuçlarım genel. <a href="/test">Testi çöz</a>, sana özel teknikler vereyim!';
          notice.style.display = 'block';
        }

        var lastDay = null;
        d.history.forEach(function (m) {
          var day = m.created_at ? dayLabel(m.created_at) : null;
          if (day && day !== lastDay) { msgs.appendChild(el('div', 'lumi-day', day)); lastDay = day; }
          var cleanContent = (m.content || '').replace(/^\[mood:[a-z_]+\]\s*/i, '');
          addMsg(m.role, cleanContent, m.blocked ? 'blocked' : '', null, 'normal');
        });

        if (!d.history.length) {
          if (state.is_guest) {
            var welcomeText = 'Selam! 👋 Ben **Lumi**. Lumina platformunda öğrenme stillerini keşfetmene yardımcı oluyorum. Bana çalışma teknikleri veya dersler hakkında aklına gelen bir soruyu sorabilirsin!';
            if (state.guest_used) {
              welcomeText = 'Selam tekrar! ✨ Sohbetimize devam edebilmek ve sana özel öğrenme taktiklerini keşfedebilmemiz için ücretsiz kayıt olabilir veya giriş yapabilirsin:';
            }
            var gMsg = addMsg('model', welcomeText, '', null, 'mutlu');
            if (state.guest_used && gMsg._body) {
              var cta = el('div', 'lumi-auth-cta',
                '<a href="/auth?tab=register" class="lumi-cta-btn lumi-cta-reg">📝 Ücretsiz Kayıt Ol</a>' +
                '<a href="/auth?tab=login" class="lumi-cta-btn lumi-cta-log">🔑 Giriş Yap</a>'
              );
              gMsg._body.appendChild(cta);
            }
          } else {
            addMsg('model', 'Selam **' + d.username + '**! 👋 Ben Lumi. ' +
              (d.has_test ? 'Öğrenme profiline özel çalışma taktikleri verebilirim.' : 'Sana en uygun çalışma tekniklerini keşfedebiliriz.') +
              ' Ne üzerinde çalışmak istersin?', '', null, 'mutlu');
          }
          setLumiMood('mutlu');
        } else {
          setLumiMood('normal');
        }

        d.quick_prompts.forEach(function (q) {
          var b = el('button', 'lumi-chip', esc(q));
          b.type = 'button';
          b.onclick = function () { send(q); };
          quick.appendChild(b);
        });

        ta.maxLength = d.max_input_chars + 50;
        renderUsage();
        updateCount();
      } catch (e) {
        addMsg('system', 'Lumi yüklenemedi, sayfayı yenilemeyi dener misin?');
        setLumiMood('teselli');
      }
    }

    async function send(text) {
      text = (text || '').trim();
      if (!text || state.busy) return;

      if (state.is_guest && (state.guest_used || localStorage.getItem('lumi_guest_asked') === '1')) {
        var sMsg = addMsg('model', 'Kayıt olursan veya hesabın varsa giriş yaparsan seni daha iyi tanıyıp daha iyi yardımcı olabilirim! ✨', '', null, 'heyecanli');
        var cta = el('div', 'lumi-auth-cta',
          '<a href="/auth?tab=register" class="lumi-cta-btn lumi-cta-reg">📝 Ücretsiz Kayıt Ol</a>' +
          '<a href="/auth?tab=login" class="lumi-cta-btn lumi-cta-log">🔑 Giriş Yap</a>'
        );
        if (sMsg._body) sMsg._body.appendChild(cta);
        ta.disabled = true;
        ta.placeholder = 'Sohbete devam etmek için giriş yap veya kayıt ol ✨';
        sendBtn.disabled = true;
        scroll();
        return;
      }

      setBusy(true);

      ta.value = '';
      ta.style.height = '';
      updateCount();

      var userBubble = addMsg('user', text);

      // YAZIYOR/BEKLİYOR: 3 nokta ve metin YOK!
      // SADECE Lumi karakteri 'dusunuyor' modunda yer alır.
      var botCharId = 'msg-char-' + (++msgCounter);
      var botMsg = addMsg('model', '', '', botCharId, 'dusunuyor');
      var botCharStage = document.getElementById(botCharId);

      // Header'daki büyük karakter de 'dusunuyor' mimiğine geçer
      setLumiMood('dusunuyor');

      try {
        var r = await fetch('/api/chat/send', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });

        if (!r.ok) {
          var err = {};
          try { err = await r.json(); } catch (_) {}
          botMsg.remove();
          if (r.status === 403 || err.error === 'guest_limit') {
            var gMsg = addMsg('model', 'Kayıt olursan veya hesabın varsa giriş yaparsan seni daha iyi tanıyıp daha iyi yardımcı olabilirim! ✨', '', null, 'heyecanli');
            var cta = el('div', 'lumi-auth-cta',
              '<a href="/auth?tab=register" class="lumi-cta-btn lumi-cta-reg">📝 Ücretsiz Kayıt Ol</a>' +
              '<a href="/auth?tab=login" class="lumi-cta-btn lumi-cta-log">🔑 Giriş Yap</a>'
            );
            if (gMsg._body) gMsg._body.appendChild(cta);
            state.guest_used = true;
            localStorage.setItem('lumi_guest_asked', '1');
            ta.disabled = true;
            ta.placeholder = 'Sohbete devam etmek için giriş yap veya kayıt ol ✨';
            sendBtn.disabled = true;
            scroll();
            return;
          }
          if (r.status === 400 && err.error !== 'too_long' && err.error !== 'empty') {
            userBubble.classList.add('blocked');
          }
          if (err.usage) { state.usage = err.usage; renderUsage(); }
          addMsg('system', err.detail || 'Bir sorun oluştu.');

          setLumiMood(err.error === 'rate_limit' ? 'teselli' : 'uyari');
          return;
        }

        var reader = r.body.getReader();
        var dec = new TextDecoder();
        var rawFull = '';
        var moodDetected = false;

        while (true) {
          var chunk = await reader.read();
          if (chunk.done) break;
          rawFull += dec.decode(chunk.value, { stream: true });

          // Cevabın başındaki [mood:...] etiketini yakala
          var cleanText = rawFull;
          var moodMatch = cleanText.match(/^\[mood:([a-z_]+)\]\s*/i);
          if (moodMatch) {
            var extractedMood = moodMatch[1].toLowerCase();
            if (!moodDetected) {
              setLumiMood(extractedMood);
              if (botCharStage) botCharStage.setAttribute('data-state', extractedMood);
              moodDetected = true;
            }
            cleanText = cleanText.substring(moodMatch[0].length);
          } else if (!moodDetected && rawFull.length > 30) {
            setLumiMood('taktik');
            if (botCharStage) botCharStage.setAttribute('data-state', 'taktik');
            moodDetected = true;
          }

          if (botMsg._body) {
            botMsg._body.innerHTML = md(cleanText);
          }
          scroll();
        }

        if (botMsg._body && !cleanText.trim()) {
          botMsg._body.innerHTML = md('(boş cevap)');
        }
        if (state.usage) { state.usage.day_used++; renderUsage(); }

        if (state.is_guest) {
          state.guest_used = true;
          localStorage.setItem('lumi_guest_asked', '1');
          var cta = el('div', 'lumi-auth-cta',
            '<a href="/auth?tab=register" class="lumi-cta-btn lumi-cta-reg">📝 Ücretsiz Kayıt Ol</a>' +
            '<a href="/auth?tab=login" class="lumi-cta-btn lumi-cta-log">🔑 Giriş Yap</a>'
          );
          if (botMsg._body) {
            botMsg._body.appendChild(cta);
          }
          ta.disabled = true;
          ta.placeholder = 'Sohbete devam etmek için giriş yap veya kayıt ol ✨';
          sendBtn.disabled = true;
          scroll();
        }
      } catch (e) {
        botMsg.remove();
        addMsg('system', 'Bağlantı koptu. İnternetini kontrol edip tekrar dener misin?');
        setLumiMood('teselli');
      } finally {
        setBusy(false);
        if (!state.is_guest || !state.guest_used) {
          ta.focus();
        }
      }
    }

    // ========================================================
    // SHIMEJI OTONOM DOLAŞMA VE FİZİK MOTORU (shimejis.xyz)
    // ========================================================
    var FLOOR_PAD = 10;
    function getCharSize() {
      return window.innerWidth <= 640 ? { w: 80, h: 80 } : { w: 96, h: 96 };
    }
    var currentPlatform = null; // null ise ekran zemini, aksi halde { el, top, left, right }
    var climbWall = null; // 'left' veya 'right'

    function getFloorY() {
      var sz = getCharSize();
      return Math.max(10, window.innerHeight - sz.h - FLOOR_PAD);
    }

    // Sayfadaki tüm platform yüzeylerini (çizgiler, ayırıcılar, progress barlar, kartlar, tablolar, butonlar) bulur
    function getCandidatePlatforms() {
      var sel = [
        // Sitedeki tüm çizgiler ve ayırıcılar
        'hr', '[class*="line"]', '[class*="divider"]', '[class*="separator"]', '[class*="border"]',
        '.border-top', '.border-bottom', '[style*="border"]',
        // Progress barlar ve göstergeler
        '[class*="progress"]', '.progress-bar', '[class*="bar"]',
        // Kartlar, kutular ve paneller
        '.card', '[class*="card"]', '.box', '[class*="box"]', '.panel', '[class*="panel"]',
        '.widget', '[class*="widget"]', '.container', '[class*="wrapper"]', 'fieldset',
        // Dashboard özel bileşenleri
        '.dashboard-hero-card', '.dashboard-score-card', '.dashboard-waiting-box', '.dashboard-stat-tag', '.badge',
        // Tablolar ve veri listeleri
        'table', 'thead', 'tr', 'th', 'ul', 'ol',
        // Menüler, başlıklar ve barlar
        'header', 'nav', '.navbar', '[class*="nav"]', 'footer',
        'h1', 'h2', 'h3', 'h4',
        // Butonlar, piller ve çipler
        'button', '.btn', '[class*="btn"]', '.chip', '[class*="pill"]', '[class*="tag"]',
        '.tab-nav', '.tabs', 'input', 'select',
        // Özel platformlar
        '[data-platform="true"]'
      ].join(',');

      var elements = document.querySelectorAll(sel);
      var platforms = [];
      var vH = window.innerHeight;

      for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        if (root.contains(el)) continue; // Lumi'nin kendi arayüzünü atla

        // Gizli öğeleri ele
        var style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;

        var r = el.getBoundingClientRect();
        // Ekranda görünür olmalı: genişlik >= 20px, yükseklik >= 1px (hr/çizgileri kapsar), ekranda olmalı
        if (r.width >= 20 && r.height >= 1 && r.bottom > 15 && r.top < vH - 35) {
          platforms.push({
            el: el,
            top: r.top,
            bottom: r.bottom,
            height: r.height,
            left: r.left,
            right: r.right,
            width: r.width
          });
        }
      }
      return platforms;
    }

    // Ayağın altındaki en yakın zemini (platform veya ekran altı) hesaplar (Lumi posY koordinat uzayı)
    function findFloorUnder(footX, currentPosY) {
      var sz = getCharSize();
      var defaultFloor = Math.max(10, window.innerHeight - sz.h - FLOOR_PAD);
      var platforms = getCandidatePlatforms();
      var bestPlatform = null;
      var bestFloor = defaultFloor;
      var minDistance = Infinity;

      for (var i = 0; i < platforms.length; i++) {
        var p = platforms[i];
        // Ayak platformun yatay sınırları içinde mi? (25px tolerans ile)
        if (footX >= p.left - 25 && footX <= p.right + 25) {
          var surfaceY = p.top - sz.h + 8; // Çizgi veya kartın tam üstüne oturt
          // Platform ayağın altında veya hemen hizasında olmalı (-40px snapping toleransı)
          if (surfaceY >= currentPosY - 40 && surfaceY <= defaultFloor) {
            var dist = surfaceY - currentPosY;
            if (dist >= -40 && dist < minDistance) {
              minDistance = dist;
              bestFloor = surfaceY;
              bestPlatform = p;
            }
          }
        }
      }

      return { floorY: bestFloor, platform: bestPlatform };
    }

    var szInit = getCharSize();
    var posX = !isDashboard ? Math.max(10, window.innerWidth - szInit.w - 28) : Math.max(20, window.innerWidth - 130);
    var posY = !isDashboard ? Math.max(10, window.innerHeight - szInit.h - 28) : getFloorY();
    var targetX = posX;
    var facingDir = !isDashboard ? -1 : 1; // 1 = sağ, -1 = sol
    var behavior = !isDashboard ? 'home_idle' : 'idle'; // 'idle', 'walk', 'hop', 'sit', 'nap', 'dragged', 'falling', 'climb', 'hang'
    var isDragging = false;
    var dragPointerId = null;
    var dragStartX = 0, dragStartY = 0;
    var dragOffsetX = 0, dragOffsetY = 0;
    var hasMovedSignificantly = false;
    var velocityY = 0;
    var velocityX = 0;
    var behaviorTimer = null;
    var speechTimer = null;
    var lastInteract = Date.now();

    function updateTransform() {
      if (!shimeji) return;
      shimeji.style.transform = 'translate3d(' + Math.round(posX) + 'px, ' + Math.round(posY) + 'px, 0)';
    }

    function setFacing(dir) {
      facingDir = dir;
      if (shimejiBody) {
        shimejiBody.style.transform = dir === -1 ? 'scaleX(-1)' : 'scaleX(1)';
      }
    }

    function clampPos() {
      var sz = getCharSize();
      var maxW = Math.max(10, window.innerWidth - sz.w - 10);
      var maxH = getFloorY();
      posX = Math.max(8, Math.min(posX, maxW));
      posY = Math.max(8, Math.min(posY, maxH));
    }

    // Başlangıç konumu
    updateTransform();
    if (!isDashboard) {
      setFacing(-1);
      shimeji.classList.add('is-home-fixed');
    } else {
      setFacing(1);
    }

    var ENCOURAGING_QUOTES = [
      'Ders çalışırken mola vermeyi unutma! 🍅',
      'Bir sorun olursa bana tıkla! 💬',
      'Bugün harika gidiyorsun! ✨',
      'Pomodoro molası vakti geldi mi? ⏱️',
      'Takıldığın konuyu bana sorabilirsin! 💡',
      'Odaklanma modunu açtın mı? 🎯',
      'Sana özel çalışma taktikleri burda! 🧠'
    ];

    function showBubble(text, duration) {
      if (!shimejiBubble) return;

      // SADECE en üst tavanda asılıyken (posY < 45) baloncuk karakterin tam altında çıksın
      if (posY < 45 && (behavior === 'hang' || shimeji.classList.contains('is-hanging'))) {
        shimeji.classList.add('bubble-below');
      } else {
        shimeji.classList.remove('bubble-below');
      }

      shimejiBubble.textContent = text;
      shimejiBubble.style.display = 'block';
      requestAnimationFrame(function () {
        shimejiBubble.classList.add('is-visible');
      });
      clearTimeout(speechTimer);
      speechTimer = setTimeout(function () {
        shimejiBubble.classList.remove('is-visible');
        setTimeout(function () {
          if (!shimejiBubble.classList.contains('is-visible')) {
            shimejiBubble.style.display = 'none';
          }
        }, 250);
      }, duration || 4500);
    }

    if (shimejiBubble) {
      shimejiBubble.onclick = function (e) {
        e.stopPropagation();
        togglePanel(true);
      };
    }

    // Panel kapandığında Lumi sağ üst tavandan aşağı rastgele bir yere düşer ve sağ alt köşeye koşar
    function triggerDropFromCeilingAndReturn() {
      clearTimeout(behaviorTimer);
      shimeji.classList.remove('is-panel-hidden');
      shimeji.classList.remove(
        'is-walking', 'is-running', 'is-sitting', 'is-hop', 'is-landing',
        'is-climbing', 'climb-left', 'climb-right', 'is-hanging', 'is-peeking',
        'is-hover-drop', 'is-home-fixed', 'is-home-hop', 'is-waving', 'bubble-below'
      );

      var sz = getCharSize();
      var homeY = Math.max(10, window.innerHeight - sz.h - 28);

      // Sağ en üstten başla (tavan hizası)
      posX = Math.max(20, window.innerWidth - sz.w - 30 - Math.floor(Math.random() * 40));
      posY = -Math.floor(sz.h * 0.7);
      updateTransform();

      // Ekranın alt hizasında rastgele bir iniş noktası seç
      var minX = Math.max(25, Math.floor(window.innerWidth * 0.12));
      var maxX = Math.max(minX + 40, window.innerWidth - sz.w - 60);
      var targetLandX = Math.floor(minX + Math.random() * (maxX - minX));

      var deltaY = Math.max(100, homeY - posY);
      var dropFrames = Math.max(20, Math.round((-1 + Math.sqrt(1 + 1.16 * deltaY)) / 0.58));
      velocityX = (targetLandX - posX) / dropFrames;
      velocityY = 1.0;
      behavior = 'falling_to_return';

      shimeji.classList.add('is-falling');
      setLumiMood('saskin');
      setFacing(velocityX >= 0 ? 1 : -1);
    }

    // Panel Açma / Kapatma Fonksiyonu
    function togglePanel(forceOpen) {
      var currentlyOpen = root.classList.contains('is-open');
      var shouldOpen = forceOpen !== undefined ? forceOpen : !currentlyOpen;
      if (shouldOpen) {
        if (!currentlyOpen) {
          root.classList.add('is-open');
          if (!isDashboard) {
            shimeji.classList.add('is-panel-hidden');
            if (shimejiBubble) {
              shimejiBubble.style.display = 'none';
              shimejiBubble.classList.remove('is-visible');
            }
          }
        }
        if (!state.initDone) init();
        setLumiMood('dinliyor');
        setTimeout(function () { ta.focus(); scroll(); }, 80);
      } else {
        if (currentlyOpen) {
          root.classList.remove('is-open');
          setLumiMood('normal');
          if (!isDashboard) {
            triggerDropFromCeilingAndReturn();
          } else {
            scheduleBehavior(1200);
          }
        }
      }
    }

    // Hedef Karta / Platforma Zıplama Fiziği (Akrobatik Yumuşak Zıplayış)
    function jumpToTarget(tX, tY, tPlatform, mood, speech) {
      if (isDragging || behavior === 'climb' || behavior === 'hang' || behavior === 'jump_hang') return;
      shimeji.classList.remove('is-walking', 'is-running', 'is-sitting', 'is-hop', 'bubble-below');
      shimeji.classList.add('is-crouch'); // Zıplama öncesi 180ms çömelme

      setTimeout(function () {
        if (isDragging || behavior === 'climb') return;
        shimeji.classList.remove('is-crouch');

        var sz = getCharSize();
        var deltaY = posY - tY;
        var vy, vx;

        if (deltaY > 0) {
          // Yukarı doğru yaylanan yumuşak zıplama
          vy = -Math.min(11.2, Math.sqrt(2 * 0.65 * Math.max(25, deltaY + 16)));
          var tApex = Math.abs(vy / 0.65);
          vx = (tX - posX) / Math.max(10, tApex);
        } else {
          // Aşağı veya düz ileri süzülme
          vy = -2.8;
          vx = (tX - posX) / 28;
        }

        velocityX = Math.max(-3.5, Math.min(3.5, vx));
        velocityY = vy;
        behavior = 'falling';
        currentPlatform = null;
        shimeji.classList.add('is-hop');
        setFacing(velocityX >= 0 ? 1 : -1);
        setLumiMood(mood || 'heyecanli', 1500);
        if (speech) showBubble(speech, 2000);
      }, 180);
    }

    var targetHangY = 0;

    // Sitedeki herhangi bir çizgiye veya kart kenarına zıplayıp asılma & sallanma
    function hangFromLine(tX, hangLineY, platform) {
      if (isDragging || behavior === 'climb' || behavior === 'hang' || behavior === 'hover_drop' || behavior === 'jump_hang') return;
      shimeji.classList.remove('is-walking', 'is-running', 'is-sitting', 'is-hop', 'is-hanging', 'bubble-below');
      shimeji.classList.add('is-crouch');

      setTimeout(function () {
        if (isDragging || behavior === 'climb') return;
        shimeji.classList.remove('is-crouch');

        targetHangY = hangLineY;
        var deltaY = posY - hangLineY;
        var vy, vx;

        if (deltaY > 0) {
          vy = -Math.min(11.2, Math.sqrt(2 * 0.65 * Math.max(25, deltaY + 16)));
          var tApex = Math.abs(vy / 0.65);
          vx = (tX - posX) / Math.max(10, tApex);
        } else {
          vy = -2.6;
          vx = (tX - posX) / 26;
        }

        velocityX = Math.max(-3.2, Math.min(3.2, vx));
        velocityY = vy;
        behavior = 'jump_hang';
        currentPlatform = null;
        shimeji.classList.add('is-hop');
        setFacing(velocityX >= 0 ? 1 : -1);
      }, 180);
    }

    var climbTargetPlatform = null;
    var climbTargetY = 18;

    // Tırmanırken çıkılacak hedefi seç (Ekrandaki herhangi bir çizgi/kat veya tavan)
    function selectClimbTarget() {
      var platforms = getCandidatePlatforms();
      var sz = getCharSize();
      // Lumi'nin mevcut posY'sinden yukarıda olan (top - sz.h + 8 < posY - 30) ve makul yükseklikteki platformlar
      var higherPlatforms = platforms.filter(function (p) {
        var pSurfY = p.top - sz.h + 8;
        return pSurfY < posY - 30 && pSurfY > 35;
      });

      // %65 ihtimalle ekrandaki herhangi bir çizgiye/kata çıksın, %35 tavana çıksın
      if (higherPlatforms.length > 0 && Math.random() < 0.65) {
        var chosen = higherPlatforms[Math.floor(Math.random() * higherPlatforms.length)];
        climbTargetPlatform = chosen;
        climbTargetY = chosen.top - sz.h + 8;
      } else {
        climbTargetPlatform = null;
        climbTargetY = 18; // En üst tavan
      }
    }

    // Duvara Sakin Koşup Tırmanma
    function runToWallAndClimb(wallSide, specificTargetPlatform) {
      if (isDragging || behavior === 'climb' || behavior === 'hang' || behavior === 'hover_drop' || behavior === 'jump_hang') return;
      var sz = getCharSize();
      var maxW = Math.max(10, window.innerWidth - sz.w - 10);
      climbWall = wallSide || (posX < window.innerWidth / 2 ? 'left' : 'right');
      targetX = climbWall === 'left' ? 8 : maxW;
      behavior = 'walk';

      if (specificTargetPlatform) {
        climbTargetPlatform = specificTargetPlatform;
        climbTargetY = specificTargetPlatform.top - sz.h + 8;
      } else {
        selectClimbTarget();
      }

      shimeji.classList.remove('is-walking', 'is-sitting', 'is-hop', 'is-hover-drop', 'bubble-below');
      shimeji.classList.add('is-running');
      setFacing(climbWall === 'left' ? -1 : 1);
    }

    var hoverDropTimer = null;

    // Klasik Çizgi Film: Zemin altından kayınca ~400ms havada asılı kalma & düşüş (Wile E. Coyote)
    function triggerHoverDrop(customQuote) {
      if (isDragging || behavior === 'climb' || behavior === 'hang' || behavior === 'hover_drop' || behavior === 'jump_hang') return;

      clearTimeout(behaviorTimer);
      clearTimeout(hoverDropTimer);

      currentPlatform = null;
      behavior = 'hover_drop';
      velocityY = 0;
      velocityX = 0;

      shimeji.classList.remove('is-walking', 'is-running', 'is-sitting', 'is-hop', 'is-falling', 'is-landing', 'bubble-below');
      shimeji.classList.add('is-hover-drop');
      setLumiMood('saskin');

      var dropQuotes = [
        'Zemin nereye gitti?! 😱',
        'Aaa zemin kaydı! 🕳️',
        'Havada kaldım! 💨',
        'Düşüyoruum! 🍃'
      ];
      var quote = customQuote || dropQuotes[Math.floor(Math.random() * dropQuotes.length)];
      showBubble(quote, 1800);

      hoverDropTimer = setTimeout(function () {
        if (behavior === 'hover_drop') {
          shimeji.classList.remove('is-hover-drop');
          behavior = 'falling';
          shimeji.classList.add('is-falling');
          velocityY = 1.0;
          velocityX = (facingDir || 1) * 0.35;
        }
      }, 420); // ~400ms Wile E. Coyote havada asılı kalma süresi
    }

    // Fizik ve Hareket Çerçeve Döngüsü (60fps - Sakinleştirilmiş Hız)
    function physicsStep() {
      var sz = getCharSize();

      // Dashboard dışındaki sayfalarda özel köşe ve geri dönüş fiziği
      if (!isDashboard) {
        if (isDragging) {
          requestAnimationFrame(physicsStep);
          return;
        }

        var homeX = Math.max(10, window.innerWidth - sz.w - 28);
        var homeY = Math.max(10, window.innerHeight - sz.h - 28);

        // 1. Tavandan rastgele noktaya düşüş modu
        if (behavior === 'falling_to_return') {
          velocityY += 0.58;
          posY += velocityY;
          posX += velocityX;

          var maxW = Math.max(10, window.innerWidth - sz.w - 10);
          posX = Math.max(10, Math.min(posX, maxW));

          if (posY >= homeY) {
            posY = homeY;
            velocityY = 0;
            velocityX = 0;
            shimeji.classList.remove('is-falling');
            shimeji.classList.add('is-landing');
            setLumiMood('heyecanli', 500);
            behavior = 'returning_pause';
            setTimeout(function () {
              if (behavior !== 'returning_pause') return;
              shimeji.classList.remove('is-landing');
              behavior = 'returning_run';
            }, 240);
          }
          updateTransform();
          requestAnimationFrame(physicsStep);
          return;
        }

        // 2. Havada bırakıldıktan sonra yere düşüş modu
        if (behavior === 'returning_fall') {
          velocityY += 0.58;
          posY += velocityY;

          if (posY >= homeY) {
            posY = homeY;
            velocityY = 0;
            shimeji.classList.remove('is-falling');
            shimeji.classList.add('is-landing');
            setLumiMood('heyecanli', 500);
            behavior = 'returning_pause';
            setTimeout(function () {
              if (behavior !== 'returning_pause') return;
              shimeji.classList.remove('is-landing');
              behavior = 'returning_run';
            }, 220);
          }
          updateTransform();
          requestAnimationFrame(physicsStep);
          return;
        }

        // 3. İniş squash molası
        if (behavior === 'returning_pause') {
          posY = homeY;
          updateTransform();
          requestAnimationFrame(physicsStep);
          return;
        }

        // 4. Sağ alt köşeye koşarak dönme modu
        if (behavior === 'returning_run') {
          posY = homeY;
          var diffX = homeX - posX;
          if (Math.abs(diffX) <= 6) {
            posX = homeX;
            posY = homeY;
            behavior = 'home_idle';
            shimeji.classList.remove('is-running');
            shimeji.classList.add('is-home-fixed');
            setFacing(-1);
            setLumiMood('normal');
            scheduleBehavior(3500);
          } else {
            shimeji.classList.add('is-running');
            facingDir = diffX > 0 ? 1 : -1;
            setFacing(facingDir);
            var step = Math.min(Math.abs(diffX), 5.2);
            posX += facingDir * step;
          }
          updateTransform();
          requestAnimationFrame(physicsStep);
          return;
        }

        // 5. home_idle: Sağ alt köşede uslu durur
        posX = homeX;
        posY = homeY;
        facingDir = -1;
        updateTransform();
        requestAnimationFrame(physicsStep);
        return;
      }

      var maxW = Math.max(10, window.innerWidth - sz.w - 10);
      var footX = posX + sz.w / 2;
      // Bir tık yavaşlatılmış, sakin ve dengeli hız (yürüme: 1.05, koşma: 1.65)
      var currentSpeed = shimeji.classList.contains('is-running') ? 1.65 : 1.05;

      // 0. CARTOON HOVER DROP MODU (Havada Donup Kalma)
      if (behavior === 'hover_drop') {
        updateTransform();
      }

      // 1. DUVARA TIRMANMA MODU (Sakin Adımlarla Tırmanış)
      else if (behavior === 'climb') {
        posY -= 0.85; // Bir tık yavaşlatılmış tırmanış
        if (climbWall === 'left') {
          posX = 8;
        } else {
          posX = maxW;
        }

        // Hedef yüksekliğe ulaştı mı?
        if (posY <= climbTargetY) {
          posY = climbTargetY;

          // Durum A: Hedef en üst tavan (climbTargetY <= 25)
          if (climbTargetY <= 25) {
            behavior = 'hang';
            shimeji.classList.remove('is-climbing', 'climb-left', 'climb-right');
            shimeji.classList.add('is-hanging', 'bubble-below'); // En üst tavanda baloncuk tam altta olsun!
            setLumiMood('mutlu');
            showBubble('Tavandayım! Burası çok havalı! 🌟', 2400);

            setTimeout(function () {
              if (behavior === 'hang') {
                shimeji.classList.remove('is-hanging', 'bubble-below');
                behavior = 'falling';
                shimeji.classList.add('is-falling');
                velocityY = 1.0;
                velocityX = (climbWall === 'left' ? 2.6 : -2.6);
                setFacing(climbWall === 'left' ? 1 : -1);
                setLumiMood('heyecanli', 1800);
              }
            }, 2400);
          }
          // Durum B: Ekrandaki herhangi bir çizgi / platform / kata çıkış!
          else if (climbTargetPlatform && climbTargetPlatform.el) {
            var chosen = climbTargetPlatform;
            shimeji.classList.remove('is-climbing', 'climb-left', 'climb-right', 'bubble-below');

            var nearWall = (climbWall === 'left' && chosen.left <= 50) ||
                           (climbWall === 'right' && chosen.right >= maxW - 40);

            if (nearWall) {
              // Doğrudan duvardan çizginin üzerine adım atar!
              currentPlatform = chosen;
              behavior = 'walk';
              shimeji.classList.add('is-walking');
              targetX = climbWall === 'left' ? Math.min(chosen.right - 20, chosen.left + 30) : Math.max(chosen.left + 20, chosen.right - 30);
              setFacing(climbWall === 'left' ? 1 : -1);
              setLumiMood('mutlu', 1500);

              var climbExitQuotes = [
                'Bu çizgiye tırmandım! 🧗‍♂️✨',
                'Kata ulaştım! Manzara harika! 🌟',
                'İşte yeni bir zemin! 🔍',
                'Duvardan kata geçtim! 🐾'
              ];
              showBubble(climbExitQuotes[Math.floor(Math.random() * climbExitQuotes.length)], 2200);
            } else {
              // Duvardan orta alandaki karta doğru sıçrar!
              var tX = Math.max(chosen.left + 15, Math.min(chosen.right - sz.w - 15, (chosen.left + chosen.right) / 2));
              jumpToTarget(tX, climbTargetY, chosen, 'heyecanli', 'Duvardan çizgiye sıçrıyorum! 🚀');
            }
          } else {
            climbTargetY = 18; // Hedef yoksa tavana devam et
          }
        }
        updateTransform();
      }

      // 2. ÇİZGİYE DOĞRU ZIPLAYIP TUTUNMA (JUMP TO HANG)
      else if (behavior === 'jump_hang') {
        velocityY += 0.65;
        posY += velocityY;
        posX += velocityX;
        velocityX *= 0.96;

        if (posX < 8) { posX = 8; velocityX *= -0.5; }
        if (posX > maxW) { posX = maxW; velocityX *= -0.5; }

        // Hedef çizgiye ulaşıp elleriyle asılma anı
        if ((posY <= targetHangY + 8 && velocityY >= -2.2) || posY <= targetHangY) {
          posY = targetHangY;
          velocityY = 0;
          velocityX = 0;
          behavior = 'hang';
          shimeji.classList.remove('is-hop', 'is-crouch', 'is-falling');
          shimeji.classList.add('is-hanging');
          // En üst tavan değilse (posY >= 45), normal yukarı baloncuk kalsın
          if (posY < 45) {
            shimeji.classList.add('bubble-below');
          } else {
            shimeji.classList.remove('bubble-below');
          }
          setLumiMood('mutlu');

          var lineQuotes = [
            'Bu çizgiye tutundum! 🤸',
            'Burada sallanmak çok eğlenceli! ✨',
            'Biraz jimnastik molası! 🎪',
            'Kollarım ne kadar güçlü! 💪'
          ];
          showBubble(lineQuotes[Math.floor(Math.random() * lineQuotes.length)], 2300);

          setTimeout(function () {
            if (behavior === 'hang') {
              shimeji.classList.remove('is-hanging', 'bubble-below');
              behavior = 'falling';
              shimeji.classList.add('is-falling');
              velocityY = 1.0;
              velocityX = (facingDir || 1) * 0.4;
            }
          }, 2300);
        } else if (posY > getFloorY()) {
          posY = getFloorY();
          behavior = 'idle';
          shimeji.classList.remove('is-hop', 'bubble-below');
          scheduleBehavior(1000);
        }
        updateTransform();
      }

      // 3. TAVANDA VEYA ÇİZGİDE ASILI KALIP SALLANMA (HANG MODU)
      else if (behavior === 'hang') {
        updateTransform();
      }

      // 4. DÜŞME / YERÇEKİMİ MODU (Platforma veya Zemine İniş)
      else if (behavior === 'falling') {
        velocityY += 0.80; // Yumuşak yerçekimi
        posY += velocityY;
        posX += velocityX;
        velocityX *= 0.96; // Hava direnci

        if (posX < 8) { posX = 8; velocityX *= -0.5; }
        if (posX > maxW) { posX = maxW; velocityX *= -0.5; }

        var floorInfo = findFloorUnder(footX, posY);

        if (posY >= floorInfo.floorY) {
          posY = floorInfo.floorY;
          velocityY = 0;
          velocityX = 0;
          currentPlatform = floorInfo.platform;
          behavior = 'idle';
          shimeji.classList.remove('is-falling', 'is-dragged', 'is-climbing', 'climb-left', 'climb-right', 'is-hanging', 'is-peeking', 'is-hop', 'is-hover-drop', 'bubble-below');
          shimeji.classList.add('is-landing');
          setTimeout(function () { shimeji.classList.remove('is-landing'); }, 420);
          setLumiMood('mutlu', 1400);
          if (Math.random() < 0.45) {
            showBubble('Uff, ucuz yırttım! 😅', 2000);
          }
          scheduleBehavior(1000 + Math.random() * 1200);
        }
        updateTransform();
      }

      // 5. HOP (ZIPLAMA) MODU
      else if (behavior === 'hop') {
        velocityY += 0.65;
        posY += velocityY;
        posX += velocityX;
        if (posX < 10) { posX = 10; velocityX *= -1; setFacing(1); }
        if (posX > maxW) { posX = maxW; velocityX *= -1; setFacing(-1); }

        var floorInfo = findFloorUnder(footX, posY);

        if (posY >= floorInfo.floorY) {
          posY = floorInfo.floorY;
          velocityY = 0;
          velocityX = 0;
          currentPlatform = floorInfo.platform;
          shimeji.classList.remove('is-hop', 'bubble-below');
          behavior = 'idle';
          scheduleBehavior(1000 + Math.random() * 1200);
        }
        updateTransform();
      }

      // 6. YÜRÜME / KOŞMA MODU
      else if (behavior === 'walk') {
        if (currentPlatform && currentPlatform.el) {
          var rect = currentPlatform.el.getBoundingClientRect();
          if (rect.bottom < 10 || rect.top > window.innerHeight - 10) {
            triggerHoverDrop();
          } else {
            posY = rect.top - sz.h + 8;

            if (footX <= rect.left + 8 || footX >= rect.right - 8) {
              // Platform kenarı kararı: Bazen geri dön, bazen havada asılı kalıp düş!
              if (Math.random() < 0.45) {
                facingDir = (footX <= rect.left + 8) ? 1 : -1;
                setFacing(facingDir);
                targetX = (facingDir === 1) ? (rect.right - 25) : (rect.left + 25);
              } else {
                // Çizgi film uçurum kenarı efekti!
                triggerHoverDrop('Hop! Zemin bitti?! 😱');
              }
            } else {
              var diff = targetX - posX;
              var dist = Math.abs(diff);
              if (dist < 4) {
                posX = targetX;
                shimeji.classList.remove('is-walking', 'is-running');
                behavior = 'idle';
                scheduleBehavior(1000 + Math.random() * 1200);
              } else {
                var step = Math.min(dist, currentSpeed);
                var dir = diff > 0 ? 1 : -1;
                posX += dir * step;
                if (facingDir !== dir) setFacing(dir);
              }
            }
          }
        } else {
          // Zemin üzerinde yürüme/koşma
          var atLeftWall = posX <= 12;
          var atRightWall = posX >= maxW - 2;

          if (atLeftWall || atRightWall) {
            // Duvara ulaştı! Tırmanışa geç!
            behavior = 'climb';
            climbWall = atLeftWall ? 'left' : 'right';
            shimeji.classList.remove('is-walking', 'is-running', 'is-sitting', 'is-hop', 'bubble-below');
            shimeji.classList.add('is-climbing', 'climb-' + climbWall);
            setFacing(climbWall === 'left' ? 1 : -1);
            setLumiMood('merakli');
            showBubble('Duvara tırmanıyorum! 🧗', 2200);
          } else {
            var diff = targetX - posX;
            var dist = Math.abs(diff);
            if (dist < 4) {
              posX = targetX;
              shimeji.classList.remove('is-walking', 'is-running');
              behavior = 'idle';
              scheduleBehavior(1000 + Math.random() * 1200);
            } else {
              var step = Math.min(dist, currentSpeed);
              var dir = diff > 0 ? 1 : -1;
              posX += dir * step;
              if (facingDir !== dir) setFacing(dir);
            }
          }
        }
        updateTransform();
      }

      requestAnimationFrame(physicsStep);
    }
    requestAnimationFrame(physicsStep);

    // Otonom Dengeli Keşif Planlayıcı (Line Hanging & Relaxed Exploration)
    function scheduleBehavior(delay) {
      if (isDragging || behavior === 'falling' || behavior === 'hop' || behavior === 'climb' || behavior === 'hang' || behavior === 'hover_drop' || behavior === 'jump_hang' || behavior === 'falling_to_return' || behavior === 'returning_fall' || behavior === 'returning_pause' || behavior === 'returning_run') return;
      clearTimeout(behaviorTimer);
      behaviorTimer = setTimeout(function () {
        if (isDragging || behavior === 'falling' || behavior === 'hop' || behavior === 'climb' || behavior === 'hang' || behavior === 'hover_drop' || behavior === 'jump_hang' || behavior === 'falling_to_return' || behavior === 'returning_fall' || behavior === 'returning_pause' || behavior === 'returning_run') return;

        // Dashboard dışındaki sayfalarda Lumi uslu durur: minik zıplama ve dostça el sallama
        if (!isDashboard) {
          shimeji.classList.add('is-home-fixed', 'is-home-hop');
          setFacing(-1);
          shimeji.classList.add('is-waving');
          setTimeout(function () {
            shimeji.classList.remove('is-waving');
          }, 3000);
          scheduleBehavior(4200 + Math.random() * 2000);
          return;
        }

        // Panel açıksa uslu durup beklesin
        if (root.classList.contains('is-open')) {
          behavior = 'idle';
          shimeji.classList.remove('is-walking', 'is-running', 'is-sitting', 'is-hop', 'is-climbing', 'climb-left', 'climb-right', 'is-hanging', 'bubble-below');
          scheduleBehavior(3500);
          return;
        }

        // 120 saniye hareketsizlikte hafif uykuya dalsın
        var idleTime = Date.now() - lastInteract;
        if (idleTime > 120000) {
          behavior = 'nap';
          setLumiMood('uykulu');
          shimeji.classList.add('is-sitting');
          return;
        }

        var sz = getCharSize();
        var maxW = Math.max(10, window.innerWidth - sz.w - 15);
        var roll = Math.random();

        // 1. EYLEM: ÇİZGİLERE VEYA KART KENARLARINA TUTUNUP SALLANMA (%25)
        if (roll < 0.25) {
          var platforms = getCandidatePlatforms();
          var midPlatforms = platforms.filter(function (p) {
            return p.top > 70 && p.top < window.innerHeight - 120;
          });

          if (midPlatforms.length > 0) {
            var chosen = midPlatforms[Math.floor(Math.random() * midPlatforms.length)];
            var tX = Math.max(chosen.left + 15, Math.min(chosen.right - sz.w - 15, chosen.left + Math.random() * (chosen.width - sz.w)));
            // İnce çizgi (<hr>, divider, border) ise çizgi hizası, kart ise alt kenarı
            var hangLineY = (chosen.top + 12 < chosen.bottom && chosen.bottom < window.innerHeight - 80) ? chosen.bottom : (chosen.top + 12);
            var deltaY = posY - hangLineY;

            if (deltaY <= 280 && deltaY >= -100) {
              hangFromLine(tX, hangLineY, chosen);
              return;
            }
          }
          runToWallAndClimb();
          return;
        }

        // 2. EYLEM: SAYFADAKİ KARTLARA / ÇİZGİLERE ZIPLAYIP ÜSTÜNDE DURMA (%25)
        else if (roll < 0.50) {
          var platforms = getCandidatePlatforms();
          var otherPlatforms = platforms.filter(function (p) {
            return !currentPlatform || p.el !== currentPlatform.el;
          });

          if (otherPlatforms.length > 0) {
            var chosen = otherPlatforms[Math.floor(Math.random() * otherPlatforms.length)];
            var tX = Math.max(chosen.left + 15, Math.min(chosen.right - sz.w - 15, chosen.left + Math.random() * (chosen.width - sz.w)));
            var tY = chosen.top - sz.h + 8;
            var deltaY = posY - tY;

            if (deltaY <= 260 && deltaY >= -80) {
              var speechQuotes = ['Şu çizgiye zıplıyorum! 🚀', 'Yeni bir ipucu buldum! 💡', 'İncelemeye geldim! 🔍', 'Hoppala! ✨'];
              jumpToTarget(tX, tY, chosen, 'heyecanli', speechQuotes[Math.floor(Math.random() * speechQuotes.length)]);
              return;
            } else {
              runToWallAndClimb();
              return;
            }
          } else {
            runToWallAndClimb();
            return;
          }
        }

        // 3. EYLEM: DUVARA KOŞUP TAVANA TIRMANMA MACERASI (%20)
        else if (roll < 0.70) {
          runToWallAndClimb();
          return;
        }

        // 4. EYLEM: ANLIK YÜZEYDE DOĞAL YÜRÜME / HAFİF KOŞU (%20)
        else if (roll < 0.90) {
          behavior = 'walk';
          var isDash = Math.random() < 0.40;
          shimeji.classList.remove('is-sitting', 'is-hop', 'is-climbing', 'climb-left', 'climb-right', 'is-hanging', 'bubble-below');
          if (isDash) {
            shimeji.classList.add('is-running');
          } else {
            shimeji.classList.add('is-walking');
          }

          if (currentPlatform && currentPlatform.el) {
            var rct = currentPlatform.el.getBoundingClientRect();
            targetX = Math.round(rct.left + 15 + Math.random() * Math.max(10, rct.width - sz.w - 30));
          } else {
            targetX = Math.round(15 + Math.random() * (maxW - 15));
          }
          setFacing(targetX > posX ? 1 : -1);
          return;
        }

        // 5. EYLEM: AKROBATİK KÜÇÜK ZIPLAMA (%10)
        else {
          behavior = 'hop';
          shimeji.classList.remove('is-walking', 'is-running', 'is-sitting', 'is-climbing', 'climb-left', 'climb-right', 'is-hanging', 'bubble-below');
          shimeji.classList.add('is-hop');
          velocityY = -6.8;
          velocityX = (facingDir || 1) * 1.5;
          setLumiMood('heyecanli', 1400);
        }
      }, delay || (1200 + Math.random() * 1500));
    }
    scheduleBehavior(1200);

    // Pointer Olayları (Mouse ve Dokunmatik Sürükleme)
    shimeji.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      lastInteract = Date.now();
      clearTimeout(behaviorTimer);

      dragPointerId = e.pointerId;
      try { shimeji.setPointerCapture(e.pointerId); } catch (_) {}

      isDragging = true;
      hasMovedSignificantly = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragOffsetX = e.clientX - posX;
      dragOffsetY = e.clientY - posY;

      if (behavior === 'nap' || state.currentMood === 'uykulu') {
        setLumiMood('saskin', 1200);
      }

      shimeji.classList.remove('is-walking', 'is-sitting', 'is-hop', 'is-landing', 'is-climbing', 'climb-left', 'climb-right', 'is-hanging', 'is-peeking', 'bubble-below');
      shimeji.classList.add('is-dragged');
      behavior = 'dragged';
      currentPlatform = null;
    });

    shimeji.addEventListener('pointermove', function (e) {
      if (!isDragging || e.pointerId !== dragPointerId) return;

      var dist = Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY);
      if (dist > 6) {
        hasMovedSignificantly = true;
        if (state.currentMood !== 'saskin' && state.currentMood !== 'heyecanli') {
          setLumiMood('saskin');
        }
      }

      var sz = getCharSize();
      var maxW = Math.max(10, window.innerWidth - sz.w - 10);
      var floorY = getFloorY();

      posX = Math.max(8, Math.min(e.clientX - dragOffsetX, maxW));
      posY = Math.max(8, Math.min(e.clientY - dragOffsetY, floorY));

      updateTransform();
    });

    function handlePointerUp(e) {
      if (!isDragging || e.pointerId !== dragPointerId) return;
      isDragging = false;
      try { shimeji.releasePointerCapture(e.pointerId); } catch (_) {}
      dragPointerId = null;

      shimeji.classList.remove('is-dragged');

      if (!hasMovedSignificantly) {
        // TIKLAMA / DOKUNMA -> PANELİ AÇ/KAPAT
        togglePanel();
        scheduleBehavior(2000);
      } else if (!isDashboard) {
        // Dashboard dışındaki tüm sayfalarda nereye bırakılırsa bırakılsın sağ alt köşeye geri döner
        var sz = getCharSize();
        var homeX = Math.max(10, window.innerWidth - sz.w - 28);
        var homeY = Math.max(10, window.innerHeight - sz.h - 28);

        if (Math.abs(posX - homeX) <= 8 && Math.abs(posY - homeY) <= 14) {
          posX = homeX;
          posY = homeY;
          behavior = 'home_idle';
          shimeji.classList.add('is-home-fixed');
          setFacing(-1);
          setLumiMood('normal');
          updateTransform();
          scheduleBehavior(3000);
        } else if (posY < homeY - 12) {
          // Havada bırakıldıysa önce yere süzülsün/düşsün, sonra sağ alt köşeye koşsun
          behavior = 'returning_fall';
          shimeji.classList.add('is-falling');
          velocityY = 1.0;
          velocityX = 0;
          setLumiMood('saskin');
        } else {
          // Yerdeyse doğrudan sağ alt köşeye koşsun
          posY = homeY;
          behavior = 'returning_run';
          shimeji.classList.add('is-running');
          setLumiMood('heyecanli');
        }
      } else {
        var sz = getCharSize();
        var footX = posX + sz.w / 2;
        var maxW = Math.max(10, window.innerWidth - sz.w - 10);

        // Duvar dibine mi bırakıldı? (Duvara tutunma)
        if ((posX <= 18 || posX >= maxW - 8) && posY < getFloorY() - 90 && Math.random() < 0.6) {
          behavior = 'climb';
          climbWall = posX <= 18 ? 'left' : 'right';
          shimeji.classList.add('is-climbing', 'climb-' + climbWall);
          setFacing(climbWall === 'left' ? 1 : -1);
          setLumiMood('merakli');
          showBubble('Duvara tutundum! 🧗', 2000);
        } else {
          // Bırakılan noktanın altındaki elemanı doğrudan sorgula (Direct element probe)
          var probeY = posY + sz.h;
          var probedPlatform = null;
          try {
            shimeji.style.display = 'none';
            var underEls = document.elementsFromPoint(footX, probeY);
            shimeji.style.display = '';
            if (underEls) {
              for (var u = 0; u < underEls.length; u++) {
                var uEl = underEls[u];
                if (root.contains(uEl) || uEl === document.body || uEl === document.documentElement) continue;
                var uR = uEl.getBoundingClientRect();
                if (uR.width >= 20 && uR.bottom > 15) {
                  probedPlatform = {
                    el: uEl,
                    top: uR.top,
                    bottom: uR.bottom,
                    left: uR.left,
                    right: uR.right,
                    width: uR.width,
                    height: uR.height
                  };
                  break;
                }
              }
            }
          } catch (_) {
            shimeji.style.display = '';
          }

          var floorInfo = findFloorUnder(footX, posY);

          // Eğer doğrudan bir elemanın/çizginin üzerine bırakıldıysa onu önceliklendir
          if (probedPlatform) {
            var probedFloorY = probedPlatform.top - sz.h + 8;
            if (Math.abs(posY - probedFloorY) <= 50 || (posY < probedFloorY && probedFloorY < floorInfo.floorY)) {
              floorInfo = { floorY: probedFloorY, platform: probedPlatform };
            }
          }

          // Çizgiye veya platforma yakın bırakıldıysa doğrudan çizginin üstüne oturt
          if (Math.abs(posY - floorInfo.floorY) <= 40) {
            posY = floorInfo.floorY;
            currentPlatform = floorInfo.platform;
            behavior = 'idle';
            updateTransform();
            shimeji.classList.add('is-landing');
            setTimeout(function () { shimeji.classList.remove('is-landing'); }, 420);
            setLumiMood('normal');
            scheduleBehavior(2500);
          } else if (posY < floorInfo.floorY - 40) {
            // Yüksekten bırakıldıysa çizgiye doğru süzülsün
            behavior = 'falling';
            shimeji.classList.add('is-falling');
            velocityY = 0;
            velocityX = 0;
          } else {
            // Zemin hizası
            posY = floorInfo.floorY;
            currentPlatform = floorInfo.platform;
            behavior = 'idle';
            updateTransform();
            scheduleBehavior(2000);
          }
        }
      }
    }

    shimeji.addEventListener('pointerup', handlePointerUp);
    shimeji.addEventListener('pointercancel', handlePointerUp);

    // Sayfa Kaydırıldığında: Zemin altından kayınca önce havada asılı kal, sonra aşağı düş!
    window.addEventListener('scroll', function () {
      if (isDragging || behavior === 'climb' || behavior === 'hang' || behavior === 'hover_drop') return;

      if (currentPlatform && currentPlatform.el) {
        var r = currentPlatform.el.getBoundingClientRect();
        var currentExpectedTop = posY + getCharSize().h - 8;
        var shift = Math.abs(r.top - currentExpectedTop);

        // Sayfa kaydırılınca zemin 6 pikselden fazla kaydıysa -> ÇİZGİ FİLM ASILI KALMA & DÜŞÜŞ!
        if (shift > 6) {
          triggerHoverDrop();
        }
      }
    }, { passive: true });

    // Ekran Boyutu Değiştiğinde Güvenli Sınır
    window.addEventListener('resize', function () {
      if (!isDashboard && behavior === 'home_idle') {
        var sz = getCharSize();
        posX = Math.max(10, window.innerWidth - sz.w - 28);
        posY = Math.max(10, window.innerHeight - sz.h - 28);
      } else {
        clampPos();
      }
      updateTransform();
    });

    // Periyodik Olarak Tatlı Teşvik Baloncuğu
    setInterval(function () {
      if (!isDragging && behavior !== 'nap' && !root.classList.contains('is-open')) {
        if (Math.random() < 0.65) {
          var quote = ENCOURAGING_QUOTES[Math.floor(Math.random() * ENCOURAGING_QUOTES.length)];
          showBubble(quote, 4500);
        }
      }
    }, 30000);

    $('.lumi-close').onclick = function () {
      togglePanel(false);
    };

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.classList.contains('is-open')) {
        togglePanel(false);
      }
    });

    form.onsubmit = function (e) { e.preventDefault(); send(ta.value); };

    // Kullanıcı yazmaya başladığında Lumi dinleme mimiğine geçer
    ta.addEventListener('input', function () {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
      updateCount();
      if (!state.busy && state.currentMood !== 'dinliyor') {
        setLumiMood('dinliyor');
      }
    });

    ta.addEventListener('focus', function () {
      if (!state.busy && state.currentMood === 'uykulu') {
        setLumiMood('saskin', 1200);
      }
    });

    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send(ta.value);
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
