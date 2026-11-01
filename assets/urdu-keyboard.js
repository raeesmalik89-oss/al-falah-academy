/* Al-Falah Academy — Roman→Urdu / Arabic typing helper.
 * A small floating language dropdown (English / اردو / عربی). Pick Urdu or
 * Arabic and type on your normal keyboard in English letters — it converts to
 * Urdu/Arabic script live, in whatever text box you're typing in. No on-screen
 * keyboard covering the page; you always see what you type. Works on laptop and
 * phone (physical or on-screen Latin keyboard).
 */
(function () {
  'use strict';

  // Roman → Urdu. Digraphs (two letters) are checked first.
  var UR = {
    di: { kh:'خ', gh:'غ', sh:'ش', ch:'چ', ph:'پھ', th:'تھ', dh:'دھ', bh:'بھ',
          rh:'ڑھ', zh:'ژ', aa:'آ', ee:'ی', oo:'و', ai:'ے', au:'و' },
    one: { a:'ا', b:'ب', p:'پ', t:'ت', s:'س', j:'ج', c:'چ', h:'ہ', d:'د',
           r:'ر', z:'ز', g:'گ', f:'ف', q:'ق', k:'ک', l:'ل', m:'م', n:'ن',
           w:'و', v:'و', o:'و', u:'و', e:'ی', i:'ی', y:'ی', x:'کھ' }
  };
  // Roman → Arabic.
  var AR = {
    di: { kh:'خ', gh:'غ', sh:'ش', th:'ث', dh:'ذ', aa:'ا', ee:'ي', oo:'و' },
    one: { a:'ا', b:'ب', p:'ب', t:'ت', s:'س', j:'ج', c:'ك', h:'ه', d:'د',
           r:'ر', z:'ز', g:'غ', f:'ف', q:'ق', k:'ك', l:'ل', m:'م', n:'ن',
           w:'و', v:'ف', o:'و', u:'و', e:'ي', i:'ي', y:'ي', x:'كس' }
  };

  var mode = 'en'; // 'en' | 'ur' | 'ar'

  function isTextField(el) {
    if (!el) return false;
    if (el.tagName === 'TEXTAREA') return true;
    if (el.tagName === 'INPUT') {
      var ty = (el.getAttribute('type') || 'text').toLowerCase();
      return ty === 'text' || ty === 'search' || ty === '';
    }
    return false;
  }

  function insert(el, ch) {
    var s = el.selectionStart, e = el.selectionEnd, v = el.value;
    el.value = v.slice(0, s) + ch + v.slice(e);
    var pos = s + ch.length;
    el.selectionStart = el.selectionEnd = pos;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function deleteBefore(el, n) {
    var s = el.selectionStart;
    if (s < n) n = s;
    el.value = el.value.slice(0, s - n) + el.value.slice(s);
    el.selectionStart = el.selectionEnd = s - n;
  }

  // Intercept letter keys and convert while in Urdu/Arabic mode.
  document.addEventListener('keydown', function (e) {
    if (mode === 'en') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var el = e.target;
    if (!isTextField(el)) return;
    var k = e.key;
    if (k.length !== 1 || !/[a-zA-Z]/.test(k)) { if (el._akbLast !== undefined) el._akbLast = ''; return; }
    k = k.toLowerCase();
    var map = mode === 'ur' ? UR : AR;
    e.preventDefault();
    var prev = el._akbLast || '';
    if (prev && map.di[prev + k]) {
      deleteBefore(el, (map.one[prev] || prev).length);
      insert(el, map.di[prev + k]);
      el._akbLast = '';
    } else {
      insert(el, map.one[k] || k);
      el._akbLast = k;
    }
  }, true);
  // Reset digraph state when the user clicks elsewhere.
  document.addEventListener('click', function (e) { if (isTextField(e.target)) e.target._akbLast = ''; }, true);

  // ---- Nastaliq font for Urdu/Arabic text --------------------------------
  // Loaded from Google Fonts; Latin characters fall back to the site font.
  var pc1 = document.createElement('link'); pc1.rel = 'preconnect'; pc1.href = 'https://fonts.googleapis.com'; document.head.appendChild(pc1);
  var pc2 = document.createElement('link'); pc2.rel = 'preconnect'; pc2.href = 'https://fonts.gstatic.com'; pc2.crossOrigin = 'anonymous'; document.head.appendChild(pc2);
  var font = document.createElement('link');
  font.rel = 'stylesheet';
  font.href = 'https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;700&display=swap';
  document.head.appendChild(font);

  // ---- Floating language dropdown ----------------------------------------
  var style = document.createElement('style');
  style.textContent = [
    // Nastaliq for right-to-left (Urdu/Arabic) content; Latin uses the fallback.
    '[dir="auto"],.ann-t,.ann-b,.ann-title,.ann-body,#annT,#annB,#sPortion{font-family:"Noto Nastaliq Urdu","Jameel Noori Nastaleeq",system-ui,"Segoe UI",Tahoma,sans-serif;line-height:2.2}',
    '#akbBar{position:fixed;right:16px;bottom:16px;z-index:9999;background:#1a6b3a;color:#fff;border-radius:50px;padding:8px 10px 8px 16px;display:flex;align-items:center;gap:8px;box-shadow:0 4px 14px rgba(0,0,0,.25);font-family:inherit;font-size:14px}',
    '#akbBar label{font-weight:700;white-space:nowrap;font-family:inherit}',
    '#akbSel{border:none;border-radius:50px;padding:7px 12px;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;background:#fff;color:#14532d}',
    '#akbHint{position:fixed;right:16px;bottom:64px;z-index:9999;background:#0f2e1e;color:#cfe8d8;border-radius:10px;padding:8px 12px;font-size:12px;max-width:230px;box-shadow:0 4px 14px rgba(0,0,0,.25);display:none;font-family:inherit}',
    '#akbHint.show{display:block}'
  ].join('');
  document.head.appendChild(style);

  var bar = document.createElement('div');
  bar.id = 'akbBar';
  bar.innerHTML = '<label>⌨ Type:</label>';
  var sel = document.createElement('select');
  sel.id = 'akbSel';
  sel.innerHTML = '<option value="en">English</option><option value="ur">اردو</option><option value="ar">عربی</option>';
  bar.appendChild(sel);
  document.body.appendChild(bar);

  var hint = document.createElement('div');
  hint.id = 'akbHint';
  document.body.appendChild(hint);

  sel.addEventListener('change', function () {
    mode = sel.value;
    if (mode === 'en') { hint.classList.remove('show'); return; }
    hint.textContent = (mode === 'ur' ? 'اردو' : 'عربی') + ' mode: just type in English letters (e.g. "salam" → ' + (mode === 'ur' ? 'سلام' : 'سلام') + ') and it becomes ' + (mode === 'ur' ? 'Urdu' : 'Arabic') + '. Numbers & punctuation type normally.';
    hint.classList.add('show');
    setTimeout(function () { hint.classList.remove('show'); }, 6000);
  });
})();
