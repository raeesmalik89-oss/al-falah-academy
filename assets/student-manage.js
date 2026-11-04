/* Al-Falah Academy — Student Manager modal
 * Gives any staff dashboard the full per-student teacher toolkit
 * (Hifz, Sabaq, Attendance, Notes, Exams) in a pop-up, without
 * touching the teacher dashboard. Used by the CEO/Admin dashboards.
 *
 * Requires (already provided by the dashboards): a global Supabase
 * client `_sb`, the `SURAHS` array and `fmtDate()` from
 * assets/dashboard-shared.js. Degrades to alert() if no toast() exists.
 *
 * Writes to: progress (upsert), attendance (insert), exam_results
 * (insert/delete). If a row-level security error appears, run
 * supabase-staff-manage-rls.sql once in Supabase.
 */
(function () {
  'use strict';

  var SM = {};
  var uid = null;        // current student id
  var sname = '';        // current student name

  function note(msg) {
    if (typeof window.toast === 'function') window.toast(msg);
    else { try { console.log(msg); } catch (e) {} }
  }
  function initials(name) {
    return String(name || '?').trim().split(/\s+/).map(function (w) { return w[0]; })
      .join('').slice(0, 2).toUpperCase();
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function today() { return new Date().toISOString().split('T')[0]; }
  // NOTE: dashboard-shared.js declares `SURAHS`/`fmtDate` at top level. A `const`
  // (SURAHS) is a global lexical binding, NOT a window property, so reference it
  // bare (resolved up the shared global scope) rather than via window.*.
  function fmt(d) { try { if (typeof fmtDate === 'function') return fmtDate(d); } catch (e) {} return String(d || ''); }
  function surahList() { try { if (typeof SURAHS !== 'undefined' && SURAHS) return SURAHS; } catch (e) {} return []; }

  // Show a friendly message when a write is blocked by RLS.
  function writeError(error) {
    var m = (error && error.message) || 'Unknown error';
    if (/row-level security|violates|permission|not allowed/i.test(m)) {
      alert('Could not save:\n' + m +
        '\n\n➡ This is a database permission. Run supabase-staff-manage-rls.sql ' +
        'once in Supabase → SQL Editor so staff (CEO/Admin/Teacher) can manage students.');
    } else {
      alert('Could not save:\n' + m);
    }
  }

  // ---- CSS (injected once, all classes prefixed sm- to avoid clashes) ----
  function injectCss() {
    if (document.getElementById('sm-css')) return;
    var css = document.createElement('style');
    css.id = 'sm-css';
    css.textContent = [
      '.sm-ov{position:fixed;inset:0;background:rgba(10,30,20,.55);display:none;align-items:flex-start;justify-content:center;z-index:9999;padding:24px 14px;overflow-y:auto}',
      '.sm-ov.open{display:flex}',
      '.sm-modal{background:#fff;width:100%;max-width:640px;border-radius:16px;box-shadow:0 24px 70px rgba(0,0,0,.35);overflow:hidden;animation:smIn .18s ease}',
      '@keyframes smIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}',
      '.sm-hdr{display:flex;align-items:center;gap:12px;padding:16px 18px;background:linear-gradient(135deg,#143024,#1a6b3a);color:#fff}',
      '.sm-av{flex:none;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px}',
      '.sm-name{font-weight:800;font-size:16px;line-height:1.2}',
      '.sm-sub{font-size:12px;opacity:.85;margin-top:2px}',
      '.sm-x{margin-left:auto;background:rgba(255,255,255,.15);border:0;color:#fff;width:32px;height:32px;border-radius:8px;font-size:18px;cursor:pointer;flex:none}',
      '.sm-x:hover{background:rgba(255,255,255,.3)}',
      '.sm-tabs{display:flex;gap:4px;padding:10px 12px 0;flex-wrap:wrap;border-bottom:1px solid #eef3ee;background:#f8faf8}',
      '.sm-tab{border:0;background:transparent;padding:9px 13px;border-radius:8px 8px 0 0;font-weight:700;font-size:13px;color:#5b7566;cursor:pointer}',
      '.sm-tab.active{background:#fff;color:#1a6b3a;box-shadow:0 -2px 0 #1a6b3a inset}',
      '.sm-body{padding:18px;max-height:62vh;overflow-y:auto}',
      '.sm-row{display:flex;flex-direction:column;gap:5px;margin-bottom:12px}',
      '.sm-row label{font-size:12px;font-weight:700;color:#4a5e52}',
      '.sm-row input,.sm-row select,.sm-row textarea{padding:10px 12px;border:1px solid #d6e2da;border-radius:9px;font-size:14px;font-family:inherit;width:100%;box-sizing:border-box}',
      '.sm-row textarea{min-height:90px;resize:vertical}',
      '.sm-btn{background:linear-gradient(135deg,#1a6b3a,#15803d);color:#fff;border:0;padding:11px 20px;border-radius:10px;font-weight:700;font-size:14px;cursor:pointer}',
      '.sm-btn:disabled{opacity:.6;cursor:not-allowed}',
      '.sm-btn-o{background:#fff;color:#1a6b3a;border:1px solid #bcd6c6;padding:9px 15px;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer}',
      '.sm-hg{display:grid;grid-template-columns:repeat(auto-fill,minmax(38px,1fr));gap:5px}',
      '.sm-hc{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border:1px solid #dce7e0;border-radius:7px;font-size:12px;font-weight:700;color:#789;cursor:pointer;user-select:none}',
      '.sm-hc.done{background:#1a6b3a;color:#fff;border-color:#1a6b3a}',
      '.sm-rowline{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:9px 11px;border:1px solid #eef3ee;border-radius:9px;margin-bottom:7px;flex-wrap:wrap;font-size:13px}',
      '.sm-del{color:#c0392b;cursor:pointer;font-weight:700;font-size:12px}',
      '.sm-muted{text-align:center;color:#9aa;padding:16px;font-size:13px}',
      '.sm-hint{font-size:12px;color:#6b7d72;margin-bottom:10px}',
      '.sm-pill{display:inline-block;font-size:11px;font-weight:800;padding:2px 9px;border-radius:20px;background:#e7f3ec;color:#1a6b3a}'
    ].join('\n');
    document.head.appendChild(css);
  }

  // ---- DOM shell (built once) ----
  function shell() {
    var ov = document.getElementById('sm-ov');
    if (ov) return ov;
    injectCss();
    ov = document.createElement('div');
    ov.id = 'sm-ov';
    ov.className = 'sm-ov';
    ov.innerHTML =
      '<div class="sm-modal" role="dialog" aria-modal="true">' +
        '<div class="sm-hdr">' +
          '<div class="sm-av" id="sm-av"></div>' +
          '<div style="flex:1;min-width:0"><div class="sm-name" id="sm-name"></div><div class="sm-sub" id="sm-sub"></div></div>' +
          '<button class="sm-x" title="Close" onclick="SM.close()">&times;</button>' +
        '</div>' +
        '<div class="sm-tabs">' +
          '<button class="sm-tab active" data-tab="hifz"  onclick="SM.tab(\'hifz\',this)">📗 Hifz</button>' +
          '<button class="sm-tab" data-tab="sabaq" onclick="SM.tab(\'sabaq\',this)">📖 Sabaq</button>' +
          '<button class="sm-tab" data-tab="att"   onclick="SM.tab(\'att\',this)">📋 Attendance</button>' +
          '<button class="sm-tab" data-tab="notes" onclick="SM.tab(\'notes\',this)">📝 Notes</button>' +
          '<button class="sm-tab" data-tab="exams" onclick="SM.tab(\'exams\',this)">📄 Exams</button>' +
        '</div>' +
        '<div class="sm-body" id="sm-body"></div>' +
      '</div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function (e) { if (e.target === ov) SM.close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') SM.close(); });
    return ov;
  }

  var body = function () { return document.getElementById('sm-body'); };
  var spinner = '<div style="text-align:center;padding:40px"><div class="sm-muted">Loading…</div></div>';

  // ---- Open ----
  SM.open = async function (studentId, studentName) {
    if (typeof _sb === 'undefined' || !_sb) { alert('Not connected to the database yet — try again in a moment.'); return; }
    uid = studentId; sname = studentName || '';
    var ov = shell();
    ov.classList.add('open');
    document.getElementById('sm-av').textContent = initials(sname);
    document.getElementById('sm-name').textContent = sname || 'Student';
    document.getElementById('sm-sub').textContent = 'Loading…';
    // reset tabs to Hifz
    var tabs = ov.querySelectorAll('.sm-tab');
    tabs.forEach(function (t) { t.classList.toggle('active', t.getAttribute('data-tab') === 'hifz'); });
    body().innerHTML = spinner;
    var res = await _sb.from('profiles').select('name,email,course,class_name').eq('id', uid).single();
    var u = res.data || {};
    if (u.name) { sname = u.name; document.getElementById('sm-name').textContent = u.name; document.getElementById('sm-av').textContent = initials(u.name); }
    var parts = [u.course || 'Quran Hifz'];
    if (u.class_name && u.class_name !== u.course) parts.push(u.class_name);
    if (u.email) parts.push(u.email);
    document.getElementById('sm-sub').textContent = parts.join(' · ');
    SM.renderHifz();
  };

  SM.close = function () {
    var ov = document.getElementById('sm-ov');
    if (ov) ov.classList.remove('open');
    uid = null;
  };

  SM.tab = function (t, btn) {
    var ov = document.getElementById('sm-ov');
    ov.querySelectorAll('.sm-tab').forEach(function (b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    body().innerHTML = spinner;
    if (t === 'hifz') SM.renderHifz();
    else if (t === 'sabaq') SM.renderSabaq();
    else if (t === 'att') SM.renderAtt();
    else if (t === 'notes') SM.renderNotes();
    else if (t === 'exams') SM.renderExams();
  };

  // ---- Hifz ----
  SM.renderHifz = async function () {
    var id = uid;
    var res = await _sb.from('progress').select('surahs').eq('id', id).single();
    if (id !== uid) return;
    var mem = new Set((res.data && res.data.surahs) || []);
    var names = surahList();
    var grid = names.map(function (nm, i) {
      return '<div class="sm-hc' + (mem.has(i + 1) ? ' done' : '') + '" id="sm-hc' + (i + 1) +
        '" title="' + (i + 1) + '. ' + esc(nm) + '" onclick="this.classList.toggle(\'done\')">' + (i + 1) + '</div>';
    }).join('');
    body().innerHTML =
      '<p class="sm-hint">Click a surah to mark/unmark memorized. <strong>' + mem.size + '/114</strong></p>' +
      '<div class="sm-hg">' + grid + '</div>' +
      '<div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">' +
        '<button class="sm-btn" onclick="SM.saveHifz(this)">💾 Save Progress</button>' +
        '<button class="sm-btn-o" onclick="SM.allHifz(true)">✓ All</button>' +
        '<button class="sm-btn-o" onclick="SM.allHifz(false)">✕ Clear</button>' +
      '</div>';
  };
  SM.allHifz = function (on) {
    var names = surahList();
    for (var i = 1; i <= names.length; i++) {
      var el = document.getElementById('sm-hc' + i);
      if (el) el.classList.toggle('done', on);
    }
  };
  SM.saveHifz = async function (btn) {
    var names = surahList(), mem = [];
    for (var i = 1; i <= names.length; i++) {
      var el = document.getElementById('sm-hc' + i);
      if (el && el.classList.contains('done')) mem.push(i);
    }
    btn.disabled = true; btn.textContent = 'Saving…';
    var r = await _sb.from('progress').upsert({ id: uid, surahs: mem, last_updated: new Date().toISOString() });
    btn.disabled = false; btn.textContent = '💾 Save Progress';
    if (r.error) return writeError(r.error);
    note('✓ Saved — ' + mem.length + ' surahs memorized');
  };

  // ---- Sabaq (current portion + marks) ----
  SM.renderSabaq = async function () {
    var id = uid;
    var res = await _sb.from('progress').select('portion,marks').eq('id', id).single();
    if (id !== uid) return;
    var p = res.data || {};
    body().innerHTML =
      '<p class="sm-hint">What the student is currently reading, and their latest marks. Shown in the student portal.</p>' +
      '<div class="sm-row"><label>Current Sabaq / Portion</label><input id="sm-portion" value="' + esc(p.portion) + '" placeholder="e.g. Para 5, or Noorani Qaida Lesson 10"></div>' +
      '<div class="sm-row"><label>Latest Marks (0–100)</label><input id="sm-marks" type="number" min="0" max="100" value="' + (p.marks == null ? '' : p.marks) + '" placeholder="e.g. 85"></div>' +
      '<button class="sm-btn" onclick="SM.saveSabaq(this)">💾 Save Sabaq</button>';
  };
  SM.saveSabaq = async function (btn) {
    var portion = document.getElementById('sm-portion').value.trim();
    var marks = parseInt(document.getElementById('sm-marks').value, 10);
    if (isNaN(marks)) marks = null; else marks = Math.max(0, Math.min(100, marks));
    btn.disabled = true; btn.textContent = 'Saving…';
    var r = await _sb.from('progress').upsert({ id: uid, portion: portion || null, marks: marks, last_updated: new Date().toISOString() });
    btn.disabled = false; btn.textContent = '💾 Save Sabaq';
    if (r.error) return writeError(r.error);
    note('✓ Sabaq saved');
  };

  // ---- Attendance ----
  SM.renderAtt = async function () {
    var id = uid;
    var res = await _sb.from('attendance').select('*').eq('student_id', id).order('date', { ascending: false }).limit(20);
    if (id !== uid) return;
    var recs = res.data || [];
    var rows = recs.length ? recs.map(function (r) {
      return '<div class="sm-rowline"><span>' + fmt(r.date) + ' · ' + esc(r.lesson || 'Class') + '</span>' +
        '<span class="sm-pill" style="' + (r.present ? '' : 'background:#fdecea;color:#c0392b') + '">' + (r.present ? 'Present' : 'Absent') + '</span></div>';
    }).join('') : '<p class="sm-muted">No records yet</p>';
    body().innerHTML =
      '<div class="sm-row"><label>Date</label><input id="sm-adate" type="date" value="' + today() + '"></div>' +
      '<div class="sm-row"><label>Lesson / Topic</label><input id="sm-alesson" placeholder="e.g. Surah Al-Baqarah revision"></div>' +
      '<div class="sm-row"><label>Status</label><select id="sm-astat"><option value="true">✓ Present</option><option value="false">✗ Absent</option></select></div>' +
      '<button class="sm-btn" onclick="SM.markAtt(this)">Mark Attendance</button>' +
      '<div style="margin-top:18px;padding-top:14px;border-top:1px solid #eef3ee">' +
        '<p style="font-size:12px;font-weight:700;color:#667;margin-bottom:10px">RECENT RECORDS</p>' + rows + '</div>';
  };
  SM.markAtt = async function (btn) {
    var date = document.getElementById('sm-adate').value;
    var lesson = document.getElementById('sm-alesson').value.trim();
    var present = document.getElementById('sm-astat').value === 'true';
    if (!date) return note('Select a date');
    btn.disabled = true; btn.textContent = 'Saving…';
    var r = await _sb.from('attendance').insert({ student_id: uid, date: date, lesson: lesson || 'Class', present: present });
    btn.disabled = false; btn.textContent = 'Mark Attendance';
    if (r.error) return writeError(r.error);
    note('✓ Attendance marked — ' + (present ? 'Present' : 'Absent'));
    SM.renderAtt();
  };

  // ---- Notes ----
  SM.renderNotes = async function () {
    var id = uid;
    var res = await _sb.from('progress').select('notes').eq('id', id).single();
    if (id !== uid) return;
    var notes = (res.data && res.data.notes) || '';
    body().innerHTML =
      '<p class="sm-hint">Notes are visible to the student in their portal.</p>' +
      '<div class="sm-row"><textarea id="sm-notes">' + esc(notes) + '</textarea></div>' +
      '<button class="sm-btn" onclick="SM.saveNotes(this)">💾 Save Notes</button>';
  };
  SM.saveNotes = async function (btn) {
    btn.disabled = true; btn.textContent = 'Saving…';
    var r = await _sb.from('progress').upsert({ id: uid, notes: document.getElementById('sm-notes').value, last_updated: new Date().toISOString() });
    btn.disabled = false; btn.textContent = '💾 Save Notes';
    if (r.error) return writeError(r.error);
    note('✓ Notes saved');
  };

  // ---- Exams ----
  SM.renderExams = async function () {
    var id = uid;
    var res = await _sb.from('exam_results').select('*').eq('student_id', id).order('exam_date', { ascending: false });
    if (id !== uid) return;
    var data = res.data || [];
    var rows = data.length ? data.map(function (e) {
      var pct = e.total ? Math.round(e.obtained / e.total * 100) : 0;
      return '<div class="sm-rowline"><span><strong>' + esc(e.title) + '</strong>' + (e.subject ? ' · ' + esc(e.subject) : '') +
        '<br><span style="font-size:11px;color:#778">' + fmt(e.exam_date) + (e.remarks ? ' — ' + esc(e.remarks) : '') + '</span></span>' +
        '<span style="text-align:right"><span class="sm-pill">' + e.obtained + '/' + e.total + ' (' + pct + '%)</span>' +
        '<br><span class="sm-del" onclick="SM.delExam(\'' + e.id + '\')">Delete</span></span></div>';
    }).join('') : '<p class="sm-muted">No exam results yet</p>';
    body().innerHTML =
      '<div class="sm-row"><label>Exam Title</label><input id="sm-ext" placeholder="e.g. Monthly Test - October"></div>' +
      '<div class="sm-row"><label>Subject</label><input id="sm-exs" placeholder="e.g. Tajweed / Hifz / Nazra"></div>' +
      '<div style="display:flex;gap:10px"><div class="sm-row" style="flex:1"><label>Obtained</label><input id="sm-exo" type="number" placeholder="85"></div>' +
      '<div class="sm-row" style="flex:1"><label>Out of</label><input id="sm-extot" type="number" value="100"></div></div>' +
      '<div class="sm-row"><label>Date</label><input id="sm-exd" type="date" value="' + today() + '"></div>' +
      '<div class="sm-row"><label>Remarks (optional)</label><input id="sm-exr" placeholder="e.g. Excellent tajweed, revise Surah Yaseen"></div>' +
      '<button class="sm-btn" onclick="SM.addExam(this)">Add Result</button>' +
      '<div style="margin-top:18px;padding-top:14px;border-top:1px solid #eef3ee">' +
        '<p style="font-size:12px;font-weight:700;color:#667;margin-bottom:10px">RESULTS</p>' + rows + '</div>';
  };
  SM.addExam = async function (btn) {
    var title = document.getElementById('sm-ext').value.trim();
    var subject = document.getElementById('sm-exs').value.trim();
    var obtained = parseFloat(document.getElementById('sm-exo').value);
    var total = parseFloat(document.getElementById('sm-extot').value) || 100;
    var exam_date = document.getElementById('sm-exd').value || today();
    var remarks = document.getElementById('sm-exr').value.trim();
    if (!title) return note('Enter an exam title');
    if (isNaN(obtained)) return note('Enter marks obtained');
    btn.disabled = true; btn.textContent = 'Saving…';
    var r = await _sb.from('exam_results').insert({ student_id: uid, title: title, subject: subject, obtained: obtained, total: total, exam_date: exam_date, remarks: remarks });
    btn.disabled = false; btn.textContent = 'Add Result';
    if (r.error) return writeError(r.error);
    note('✓ Result added');
    SM.renderExams();
  };
  SM.delExam = async function (id) {
    if (!confirm('Delete this result?')) return;
    var r = await _sb.from('exam_results').delete().eq('id', id);
    if (r.error) return writeError(r.error);
    note('Deleted'); SM.renderExams();
  };

  // Public entry point
  window.SM = SM;
  window.openStudentManager = function (id, name) { SM.open(id, name); };
})();
