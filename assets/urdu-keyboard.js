/* Al-Falah Academy — in-site Urdu / Arabic on-screen keyboard.
 * No dependencies, works on laptop and phone. Attaches to any text input or
 * textarea on the page. Pick a language (English / اردو / عربی) and tap the
 * letters — they are inserted at the cursor of the last focused field.
 * English simply uses the device's normal keyboard.
 */
(function () {
  'use strict';

  // ---- Key layouts -------------------------------------------------------
  var URDU = [
    ['ا','آ','ب','پ','ت','ٹ','ث','ج','چ','ح','خ'],
    ['د','ڈ','ذ','ر','ڑ','ز','ژ','س','ش','ص','ض'],
    ['ط','ظ','ع','غ','ف','ق','ک','گ','ل','م','ن'],
    ['ں','و','ؤ','ہ','ھ','ء','ی','ئ','ے','آ','ۃ'],
    ['َ','ِ','ُ','ّ','ْ','ً','۔','،','؟','؛','“']
  ];
  var URDU_NUM = ['۱','۲','۳','۴','۵','۶','۷','۸','۹','۰'];

  var ARABIC = [
    ['ا','أ','إ','آ','ب','ت','ث','ج','ح','خ','د'],
    ['ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ'],
    ['ف','ق','ك','ل','م','ن','ه','و','ي','ى','ة'],
    ['ء','ؤ','ئ','َ','ُ','ِ','ّ','ْ','ً','ٌ','ٍ'],
    ['ۖ','ۗ','ـ','،','؛','؟','.','!','"','(',')']
  ];
  var ARABIC_NUM = ['١','٢','٣','٤','٥','٦','٧','٨','٩','٠'];

  var lang = 'ur'; // 'en' | 'ur' | 'ar'
  var activeField = null;

  // ---- Track the field the user last focused ------------------------------
  function isTextField(el) {
    if (!el) return false;
    var t = el.tagName;
    if (t === 'TEXTAREA') return true;
    if (t === 'INPUT') {
      var ty = (el.getAttribute('type') || 'text').toLowerCase();
      return ty === 'text' || ty === 'search' || ty === '';
    }
    return false;
  }
  document.addEventListener('focusin', function (e) {
    if (isTextField(e.target)) activeField = e.target;
  });

  // ---- Insert text at the cursor -----------------------------------------
  function insert(ch) {
    var el = activeField;
    if (!isTextField(el)) {
      // No field focused — use the first text field on the page.
      el = document.querySelector('textarea, input[type=text], input:not([type])');
      if (!el) return;
      activeField = el;
    }
    el.focus();
    var s = el.selectionStart, e = el.selectionEnd, v = el.value;
    if (typeof s !== 'number') { el.value = v + ch; return; }
    el.value = v.slice(0, s) + ch + v.slice(e);
    var pos = s + ch.length;
    el.selectionStart = el.selectionEnd = pos;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function backspace() {
    var el = activeField; if (!isTextField(el)) return;
    el.focus();
    var s = el.selectionStart, e = el.selectionEnd, v = el.value;
    if (s === e) { if (s > 0) { el.value = v.slice(0, s - 1) + v.slice(e); el.selectionStart = el.selectionEnd = s - 1; } }
    else { el.value = v.slice(0, s) + v.slice(e); el.selectionStart = el.selectionEnd = s; }
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // ---- Build the UI -------------------------------------------------------
  var style = document.createElement('style');
  style.textContent = [
    '#akbTgl{position:fixed;right:16px;bottom:16px;z-index:9998;background:#1a6b3a;color:#fff;border:none;border-radius:50px;padding:12px 18px;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25);font-family:inherit}',
    '#akb{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#0f2e1e;color:#fff;padding:10px;box-shadow:0 -4px 20px rgba(0,0,0,.3);display:none;max-height:60vh;overflow:auto}',
    '#akb.show{display:block}',
    '#akb .akb-top{display:flex;gap:6px;align-items:center;margin-bottom:8px;flex-wrap:wrap}',
    '#akb .akb-tab{background:#1c4a33;color:#cfe8d8;border:none;border-radius:8px;padding:8px 14px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit}',
    '#akb .akb-tab.on{background:#2fae6a;color:#042016}',
    '#akb .akb-close{margin-left:auto;background:#7a2222;color:#fff;border:none;border-radius:8px;padding:8px 14px;font-weight:700;cursor:pointer;font-family:inherit}',
    '#akb .akb-row{display:flex;gap:4px;justify-content:center;margin-bottom:4px;flex-wrap:wrap}',
    '#akb .akb-k{min-width:38px;height:42px;background:#17382a;color:#fff;border:1px solid #2a5540;border-radius:7px;font-size:19px;cursor:pointer;flex:0 0 auto}',
    '#akb .akb-k:active{background:#2fae6a;color:#042016}',
    '#akb .akb-wide{min-width:90px}',
    '#akb .akb-hint{text-align:center;color:#9ccbb2;font-size:13px;padding:14px}'
  ].join('');
  document.head.appendChild(style);

  var tgl = document.createElement('button');
  tgl.id = 'akbTgl';
  tgl.type = 'button';
  tgl.textContent = '⌨ اردو';
  document.body.appendChild(tgl);

  var pad = document.createElement('div');
  pad.id = 'akb';
  document.body.appendChild(pad);

  function keyBtn(ch, cls) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'akb-k' + (cls ? ' ' + cls : '');
    b.textContent = ch;
    b.addEventListener('mousedown', function (e) { e.preventDefault(); });
    b.addEventListener('click', function () { insert(ch); });
    return b;
  }

  function render() {
    pad.innerHTML = '';
    var top = document.createElement('div');
    top.className = 'akb-top';
    [['en', 'English'], ['ur', 'اردو'], ['ar', 'عربی']].forEach(function (p) {
      var t = document.createElement('button');
      t.type = 'button';
      t.className = 'akb-tab' + (lang === p[0] ? ' on' : '');
      t.textContent = p[1];
      t.addEventListener('click', function () { lang = p[0]; render(); });
      top.appendChild(t);
    });
    var cl = document.createElement('button');
    cl.type = 'button'; cl.className = 'akb-close'; cl.textContent = '✕ Close';
    cl.addEventListener('click', function () { pad.classList.remove('show'); });
    top.appendChild(cl);
    pad.appendChild(top);

    if (lang === 'en') {
      var h = document.createElement('div');
      h.className = 'akb-hint';
      h.textContent = 'English — just type using your normal keyboard.';
      pad.appendChild(h);
      return;
    }

    var rows = lang === 'ur' ? URDU : ARABIC;
    var nums = lang === 'ur' ? URDU_NUM : ARABIC_NUM;

    var nr = document.createElement('div'); nr.className = 'akb-row';
    nums.forEach(function (n) { nr.appendChild(keyBtn(n)); });
    pad.appendChild(nr);

    rows.forEach(function (row) {
      var r = document.createElement('div'); r.className = 'akb-row';
      row.forEach(function (ch) { r.appendChild(keyBtn(ch)); });
      pad.appendChild(r);
    });

    var ctrl = document.createElement('div'); ctrl.className = 'akb-row';
    var sp = keyBtn(' ', 'akb-wide'); sp.textContent = 'Space'; ctrl.appendChild(sp);
    var bs = document.createElement('button');
    bs.type = 'button'; bs.className = 'akb-k akb-wide'; bs.textContent = '⌫ Backspace';
    bs.addEventListener('mousedown', function (e) { e.preventDefault(); });
    bs.addEventListener('click', backspace);
    ctrl.appendChild(bs);
    pad.appendChild(ctrl);
  }

  tgl.addEventListener('click', function () {
    if (!pad.classList.contains('show')) render();
    pad.classList.toggle('show');
  });
})();
