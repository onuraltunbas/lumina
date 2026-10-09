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

  var msgCounter = 0;
  var state = {
    busy: false,
    initDone: false,
    cfg: null,
    usage: null,
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
      '      <path class="anim-part" d="M 310,650 C 270,650 280,710 320,715 C 360,720 370,660 350,650 Z" fill="url(#bg_' + sid + ')"/>' +
      '      <path class="anim-part" d="M 490,650 C 530,650 520,710 480,715 C 440,720 430,660 450,650 Z" fill="url(#bg_' + sid + ')"/>' +
      '    </g>' +
      '    <g id="lumi-body" class="anim-part">' +
      '      <path d="M 310,480 C 200,530 220,680 400,680 C 580,680 600,530 490,480 C 450,460 350,460 310,480 Z" fill="url(#bg_' + sid + ')"/>' +
      '    </g>' +
      '    <g id="lumi-arms">' +
      '      <g id="lumi-arm-l" class="anim-part">' +
      '        <path d="M 290,500 C 190,520 160,600 190,630 C 230,650 260,570 300,540 Z" fill="url(#ag_' + sid + ')"/>' +
      '      </g>' +
      '      <g id="lumi-arm-r" class="anim-part">' +
      '        <path d="M 510,500 C 610,520 640,600 610,630 C 570,650 540,570 500,540 Z" fill="url(#ag_' + sid + ')"/>' +
      '      </g>' +
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

  // ---------- DOM Ağacını İnşa Et (Büyük Header Sahnesi) ----------
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
    '<button id="lumi-fab" aria-label="Lumi ile sohbet et" title="Lumi ile sohbet et">' +
    '  <div class="fab-character-wrap">' + getLumiSvg('stage-fab', 'normal') + '</div>' +
    '</button>';

  function mount() {
    document.body.appendChild(root);
    var $ = function (s) { return root.querySelector(s); };
    var panel = $('#lumi-panel'),
        fab = $('#lumi-fab'),
        msgs = $('.lumi-messages'),
        quick = $('.lumi-quick'),
        form = $('.lumi-input'),
        ta = $('textarea'),
        sendBtn = $('.lumi-send'),
        notice = $('.lumi-notice'),
        countEl = $('.lumi-count'),
        usageEl = $('.lumi-usage'),
        moodPill = $('#lumi-mood-pill'),
        headerHero = $('#lumi-header-hero'),
        stageHeader = document.getElementById('stage-header'),
        stageFab = document.getElementById('stage-fab');

    // Canlı Duygu / Mimik Güncelleyici (Tüm sahneleri senkronize eder)
    function setLumiMood(mood, tempDuration) {
      if (mood === 'uzgun') mood = 'teselli';
      if (mood === 'kizgin') mood = 'uyari';
      if (!MOOD_LABELS[mood]) mood = 'normal';
      state.currentMood = mood;
      if (stageHeader) stageHeader.setAttribute('data-state', mood);
      if (stageFab) stageFab.setAttribute('data-state', mood);
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
        state.usage = d.usage;
        state.initDone = true;

        if (!d.has_test) {
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
          addMsg('model', 'Selam **' + d.username + '**! 👋 Ben Lumi. ' +
            (d.has_test ? 'Öğrenme profiline özel çalışma taktikleri verebilirim.' : 'Sana en uygun çalışma tekniklerini keşfedebiliriz.') +
            ' Ne üzerinde çalışmak istersin?', '', null, 'mutlu');
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
      } catch (e) {
        botMsg.remove();
        addMsg('system', 'Bağlantı koptu. İnternetini kontrol edip tekrar dener misin?');
        setLumiMood('teselli');
      } finally {
        setBusy(false);
        ta.focus();
      }
    }

    // Panel Açma / Kapatma
    fab.onclick = function () {
      root.classList.toggle('is-open');
      if (root.classList.contains('is-open')) {
        if (!state.initDone) init();
        setLumiMood('dinliyor');
        setTimeout(function () { ta.focus(); scroll(); }, 60);
      } else {
        setLumiMood('normal');
      }
    };

    $('.lumi-close').onclick = function () {
      root.classList.remove('is-open');
      setLumiMood('normal');
    };

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.classList.contains('is-open')) {
        root.classList.remove('is-open');
        setLumiMood('normal');
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
