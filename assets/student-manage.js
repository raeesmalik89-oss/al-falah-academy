/* Al-Falah Academy — Student Manager (shared)
 * The teacher's per-student toolkit (Hifz, Sabaq, Attendance, Notes, Exams),
 * usable two ways on the CEO/Admin dashboards WITHOUT touching the teacher page:
 *   • as a pop-up            → openStudentManager(id)           (SM.open)
 *   • as an inline side panel → SM.select(containerEl, id)       (teacher-style)
 *
 * Requires (provided by the dashboards): global `_sb`, plus `SURAHS` and
 * `fmtDate()` from assets/dashboard-shared.js, and ideally the page's global
 * `students` array (so the header fills instantly) and `toast()`.
 *
 * Writes to progress (upsert), attendance (insert), exam_results (insert/delete).
 * If a write is blocked by RLS, it points to supabase-staff-manage-rls.sql.
 *
 * Selectors are scoped to the active panel (a `.sm-panel` root) so the pop-up
 * and an inline panel never collide on element ids.
 */
(function () {
  'use strict';

  var SM = {};
  var activeRoot = null;   // the .sm-panel currently being interacted with
  var uid = null;          // current student id (per panel operation)

  function note(msg) { if (typeof window.toast === 'function') window.toast(msg); }
  function initials(name) {
    return String(name || '?').trim().split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function today() { return new Date().toISOString().split('T')[0]; }
  function fmt(d) { try { if (typeof fmtDate === 'function') return fmtDate(d); } catch (e) {} return String(d || ''); }
  function surahList() { try { if (typeof SURAHS !== 'undefined' && SURAHS) return SURAHS; } catch (e) {} return []; }
  function allStudents() { try { if (typeof students !== 'undefined' && students) return students; } catch (e) {} return []; }

  function body() { return activeRoot ? activeRoot.querySelector('.sm-body') : null; }
  function f(sel) { var b = body(); return b ? b.querySelector(sel) : null; }

  function writeError(error) {
    var m = (error && error.message) || 'Unknown error';
    if (/foreign key constraint/i.test(m)) {
      alert('Could not save:\n' + m +
        '\n\n➡ This student isn\'t linked correctly in the database. Run ' +
        'supabase-fix-student-fk.sql once in Supabase → SQL Editor to repoint the ' +
        'attendance/exams/progress links to the profiles table.');
    } else if (/row-level security|permission|not allowed/i.test(m)) {
      alert('Could not save:\n' + m +
        '\n\n➡ Run supabase-staff-manage-rls.sql once in Supabase → SQL Editor so staff (CEO/Admin/Teacher) can manage students.');
    } else { alert('Could not save:\n' + m); }
  }

  // ---- CSS (injected once; all classes prefixed sm-) ----
  function injectCss() {
    if (document.getElementById('sm-css')) return;
    var css = document.createElement('style');
    css.id = 'sm-css';
    css.textContent = [
      '.sm-ov{position:fixed;inset:0;background:rgba(10,30,20,.55);display:none;align-items:flex-start;justify-content:center;z-index:9999;padding:24px 14px;overflow-y:auto}',
      '.sm-ov.open{display:flex}',
      '.sm-ov .sm-panel{background:#fff;width:100%;max-width:640px;border-radius:16px;box-shadow:0 24px 70px rgba(0,0,0,.35);overflow:hidden;animation:smIn .18s ease}',
      '@keyframes smIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}',
      '.sm-panel{display:flex;flex-direction:column}',
      '.sm-hdr{display:flex;align-items:center;gap:12px;padding:16px 18px;background:linear-gradient(135deg,#143024,#1a6b3a);color:#fff}',
      '.sm-av{flex:none;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px}',
      '.sm-name{font-weight:800;font-size:16px;line-height:1.2}',
      '.sm-sub{font-size:12px;opacity:.85;margin-top:2px}',
      '.sm-x{margin-left:auto;background:rgba(255,255,255,.15);border:0;color:#fff;width:32px;height:32px;border-radius:8px;font-size:18px;cursor:pointer;flex:none}',
      '.sm-x:hover{background:rgba(255,255,255,.3)}',
      '.sm-tabs{display:flex;gap:4px;padding:10px 12px 0;flex-wrap:wrap;border-bottom:1px solid #eef3ee;background:#f8faf8}',
      '.sm-tab{border:0;background:transparent;padding:9px 13px;border-radius:8px 8px 0 0;font-weight:700;font-size:13px;color:#5b7566;cursor:pointer;font-family:inherit}',
      '.sm-tab.active{background:#fff;color:#1a6b3a;box-shadow:0 -2px 0 #1a6b3a inset}',
      '.sm-body{padding:18px;max-height:60vh;overflow-y:auto}',
      '.sm-row{display:flex;flex-direction:column;gap:5px;margin-bottom:12px}',
      '.sm-row label{font-size:12px;font-weight:700;color:#4a5e52}',
      '.sm-row input,.sm-row select,.sm-row textarea{padding:10px 12px;border:1px solid #d6e2da;border-radius:9px;font-size:14px;font-family:inherit;width:100%;box-sizing:border-box}',
      '.sm-row textarea{min-height:90px;resize:vertical}',
      '.sm-btn{background:linear-gradient(135deg,#1a6b3a,#15803d);color:#fff;border:0;padding:11px 20px;border-radius:10px;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit}',
      '.sm-btn:disabled{opacity:.6;cursor:not-allowed}',
      '.sm-btn-o{background:#fff;color:#1a6b3a;border:1px solid #bcd6c6;padding:9px 15px;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit}',
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

  // ---- panel markup (shared by modal + inline) ----
  function panelInner(withClose) {
    return '' +
      '<div class="sm-hdr">' +
        '<div class="sm-av"></div>' +
        '<div style="flex:1;min-width:0"><div class="sm-name"></div><div class="sm-sub"></div></div>' +
        (withClose ? '<button class="sm-x" title="Close" onclick="SM.close()">&times;</button>' : '') +
      '</div>' +
      '<div class="sm-tabs">' +
        '<button class="sm-tab active" data-tab="hifz"  onclick="SM.tab(\'hifz\',this)">📗 Hifz</button>' +
        '<button class="sm-tab" data-tab="sabaq" onclick="SM.tab(\'sabaq\',this)">📖 Sabaq</button>' +
        '<button class="sm-tab" data-tab="att"   onclick="SM.tab(\'att\',this)">📋 Attendance</button>' +
        '<button class="sm-tab" data-tab="notes" onclick="SM.tab(\'notes\',this)">📝 Notes</button>' +
        '<button class="sm-tab" data-tab="exams" onclick="SM.tab(\'exams\',this)">📄 Exams</button>' +
      '</div>' +
      '<div class="sm-body"></div>';
  }

  var spinner = '<div class="sm-muted">Loading…</div>';

  function setHeader(root, u) {
    root.querySelector('.sm-av').textContent = (u && u.name ? initials(u.name) : '?');
    root.querySelector('.sm-name').textContent = (u && u.name) || 'Student';
    var parts = [(u && u.course) || 'Quran Hifz'];
    if (u && u.class_name && u.class_name !== u.course) parts.push(u.class_name);
    if (u && u.email) parts.push(u.email);
    root.querySelector('.sm-sub').textContent = parts.join(' · ');
  }

  // Load a student into a given .sm-panel root (shared by modal + inline).
  async function load(root, studentId) {
    if (typeof _sb === 'undefined' || !_sb) { alert('Not connected to the database yet — try again in a moment.'); return; }
    activeRoot = root; uid = studentId;
    root.querySelectorAll('.sm-tab').forEach(function (t) { t.classList.toggle('active', t.getAttribute('data-tab') === 'hifz'); });
    body().innerHTML = spinner;
    var rec = allStudents().find(function (x) { return x.id === studentId; }) || null;
    setHeader(root, rec || {});
    if (!rec || !rec.name || !rec.course) {
      var res = await _sb.from('profiles').select('name,email,course,class_name').eq('id', studentId).single();
      if (res && res.data) { rec = Object.assign({}, rec || {}, res.data); setHeader(root, rec); }
    }
    if (activeRoot === root) SM.renderHifz();
  }

  // ---- Pop-up (modal) ----
  function modalShell() {
    var ov = document.getElementById('sm-ov');
    if (ov) return ov;
    injectCss();
    ov = document.createElement('div');
    ov.id = 'sm-ov'; ov.className = 'sm-ov';
    ov.innerHTML = '<div class="sm-panel" role="dialog" aria-modal="true">' + panelInner(true) + '</div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function (e) { if (e.target === ov) SM.close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') SM.close(); });
    return ov;
  }
  SM.open = function (studentId) {
    var ov = modalShell();
    ov.classList.add('open');
    load(ov.querySelector('.sm-panel'), studentId);
  };
  SM.close = function () {
    var ov = document.getElementById('sm-ov');
    if (ov) ov.classList.remove('open');
  };

  // ---- Inline side panel ----
  // Build (once) an inline panel inside `container` and load a student into it.
  SM.select = function (container, studentId) {
    injectCss();
    var root = container.querySelector('.sm-panel');
    if (!root) {
      container.innerHTML = '<div class="sm-panel">' + panelInner(false) + '</div>';
      root = container.querySelector('.sm-panel');
    }
    load(root, studentId);
  };

  // ---- tab switch ----
  SM.tab = function (t, btn) {
    var root = btn.closest('.sm-panel');
    activeRoot = root;
    root.querySelectorAll('.sm-tab').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    body().innerHTML = spinner;
    if (t === 'hifz') SM.renderHifz();
    else if (t === 'sabaq') SM.renderSabaq();
    else if (t === 'att') SM.renderAtt();
    else if (t === 'notes') SM.renderNotes();
    else if (t === 'exams') SM.renderExams();
  };

  // ---- Hifz ----
  SM.renderHifz = async function () {
    var root = activeRoot, id = uid;
    var res = await _sb.from('progress').select('surahs').eq('id', id).single();
    if (activeRoot !== root || uid !== id) return;
    var mem = new Set((res.data && res.data.surahs) || []);
    var names = surahList();
    var grid = names.map(function (nm, i) {
      return '<div class="sm-hc' + (mem.has(i + 1) ? ' done' : '') + '" data-n="' + (i + 1) +
        '" title="' + (i + 1) + '. ' + esc(nm) + '" onclick="this.classList.toggle(\'done\')">' + (i + 1) + '</div>';
    }).join('');
    body().innerHTML =
      '<p class="sm-hint">Click a surah to mark/unmark memorized. <strong>' + mem.size + '/114</strong></p>' +
      '<div class="sm-hg">' + grid + '</div>' +
      '<div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">' +
        '<button class="sm-btn" onclick="SM.saveHifz(this)">💾 Save Progress</button>' +
        '<button class="sm-btn-o" onclick="SM.allHifz(this,true)">✓ All</button>' +
        '<button class="sm-btn-o" onclick="SM.allHifz(this,false)">✕ Clear</button>' +
      '</div>';
  };
  SM.allHifz = function (btn, on) {
    var b = btn.closest('.sm-panel').querySelector('.sm-body');
    b.querySelectorAll('.sm-hc').forEach(function (c) { c.classList.toggle('done', on); });
  };
  SM.saveHifz = async function (btn) {
    activeRoot = btn.closest('.sm-panel');
    var mem = [];
    body().querySelectorAll('.sm-hc.done').forEach(function (c) { mem.push(parseInt(c.getAttribute('data-n'), 10)); });
    btn.disabled = true; btn.textContent = 'Saving…';
    var r = await _sb.from('progress').upsert({ id: uid, surahs: mem, last_updated: new Date().toISOString() });
    btn.disabled = false; btn.textContent = '💾 Save Progress';
    if (r.error) return writeError(r.error);
    note('✓ Saved — ' + mem.length + ' surahs memorized');
  };

  // ---- Sabaq ----
  SM.renderSabaq = async function () {
    var root = activeRoot, id = uid;
    var res = await _sb.from('progress').select('portion,marks').eq('id', id).single();
    if (activeRoot !== root || uid !== id) return;
    var p = res.data || {};
    body().innerHTML =
      '<p class="sm-hint">What the student is currently reading, and their latest marks. Shown in the student portal.</p>' +
      '<div class="sm-row"><label>Current Sabaq / Portion</label><input class="sm-f-portion" value="' + esc(p.portion) + '" placeholder="e.g. Para 5, or Noorani Qaida Lesson 10"></div>' +
      '<div class="sm-row"><label>Latest Marks (0–100)</label><input class="sm-f-marks" type="number" min="0" max="100" value="' + (p.marks == null ? '' : p.marks) + '" placeholder="e.g. 85"></div>' +
      '<button class="sm-btn" onclick="SM.saveSabaq(this)">💾 Save Sabaq</button>';
  };
  SM.saveSabaq = async function (btn) {
    activeRoot = btn.closest('.sm-panel');
    var portion = f('.sm-f-portion').value.trim();
    var marks = parseInt(f('.sm-f-marks').value, 10);
    if (isNaN(marks)) marks = null; else marks = Math.max(0, Math.min(100, marks));
    btn.disabled = true; btn.textContent = 'Saving…';
    var r = await _sb.from('progress').upsert({ id: uid, portion: portion || null, marks: marks, last_updated: new Date().toISOString() });
    btn.disabled = false; btn.textContent = '💾 Save Sabaq';
    if (r.error) return writeError(r.error);
    note('✓ Sabaq saved');
  };

  // ---- Attendance ----
  SM.renderAtt = async function () {
    var root = activeRoot, id = uid;
    // Show the last 90 days of attendance (records are kept indefinitely in the
    // database; this just widens what's displayed). 'limit' is a safety cap.
    var cutoff = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];
    var res = await _sb.from('attendance').select('*').eq('student_id', id)
      .gte('date', cutoff).order('date', { ascending: false }).limit(400);
    if (activeRoot !== root || uid !== id) return;
    var recs = res.data || [];
    var present = recs.filter(function (r) { return r.present; }).length;
    var tot = recs.length, rate = tot ? Math.round(present / tot * 100) : 0;
    var summary = tot
      ? '<div class="sm-rowline" style="background:#f3f8f3;border-color:#dbeadf;font-weight:700">' +
          '<span>Last 90 days</span>' +
          '<span><span class="sm-pill">' + present + ' present</span> ' +
          '<span class="sm-pill" style="background:#fdecea;color:#c0392b">' + (tot - present) + ' absent</span> ' +
          '<span class="sm-pill" style="background:#eef3ff;color:#2156a8">' + rate + '%</span></span></div>'
      : '';
    var rows = recs.length ? recs.map(function (r) {
      return '<div class="sm-rowline"><span>' + fmt(r.date) + ' · ' + esc(r.lesson || 'Class') + '</span>' +
        '<span class="sm-pill" style="' + (r.present ? '' : 'background:#fdecea;color:#c0392b') + '">' + (r.present ? 'Present' : 'Absent') + '</span></div>';
    }).join('') : '<p class="sm-muted">No records in the last 90 days</p>';
    body().innerHTML =
      '<div class="sm-row"><label>Date</label><input class="sm-f-adate" type="date" value="' + today() + '"></div>' +
      '<div class="sm-row"><label>Lesson / Topic</label><input class="sm-f-alesson" placeholder="e.g. Surah Al-Baqarah revision"></div>' +
      '<div class="sm-row"><label>Status</label><select class="sm-f-astat"><option value="true">✓ Present</option><option value="false">✗ Absent</option></select></div>' +
      '<button class="sm-btn" onclick="SM.markAtt(this)">Mark Attendance</button>' +
      '<div style="margin-top:18px;padding-top:14px;border-top:1px solid #eef3ee">' +
        '<p style="font-size:12px;font-weight:700;color:#667;margin-bottom:10px">ATTENDANCE — LAST 90 DAYS</p>' + summary + rows + '</div>';
  };
  SM.markAtt = async function (btn) {
    activeRoot = btn.closest('.sm-panel');
    var date = f('.sm-f-adate').value;
    var lesson = f('.sm-f-alesson').value.trim();
    var present = f('.sm-f-astat').value === 'true';
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
    var root = activeRoot, id = uid;
    var res = await _sb.from('progress').select('notes').eq('id', id).single();
    if (activeRoot !== root || uid !== id) return;
    var notes = (res.data && res.data.notes) || '';
    body().innerHTML =
      '<p class="sm-hint">Notes are visible to the student in their portal.</p>' +
      '<div class="sm-row"><textarea class="sm-f-notes">' + esc(notes) + '</textarea></div>' +
      '<button class="sm-btn" onclick="SM.saveNotes(this)">💾 Save Notes</button>';
  };
  SM.saveNotes = async function (btn) {
    activeRoot = btn.closest('.sm-panel');
    btn.disabled = true; btn.textContent = 'Saving…';
    var r = await _sb.from('progress').upsert({ id: uid, notes: f('.sm-f-notes').value, last_updated: new Date().toISOString() });
    btn.disabled = false; btn.textContent = '💾 Save Notes';
    if (r.error) return writeError(r.error);
    note('✓ Notes saved');
  };

  // ---- Exams ----
  SM.renderExams = async function () {
    var root = activeRoot, id = uid;
    var res = await _sb.from('exam_results').select('*').eq('student_id', id).order('exam_date', { ascending: false });
    if (activeRoot !== root || uid !== id) return;
    var data = res.data || [];
    var rows = data.length ? data.map(function (e) {
      var pct = e.total ? Math.round(e.obtained / e.total * 100) : 0;
      return '<div class="sm-rowline"><span><strong>' + esc(e.title) + '</strong>' + (e.subject ? ' · ' + esc(e.subject) : '') +
        '<br><span style="font-size:11px;color:#778">' + fmt(e.exam_date) + (e.remarks ? ' — ' + esc(e.remarks) : '') + '</span></span>' +
        '<span style="text-align:right"><span class="sm-pill">' + e.obtained + '/' + e.total + ' (' + pct + '%)</span>' +
        '<br><span class="sm-del" onclick="SM.delExam(this,\'' + e.id + '\')">Delete</span></span></div>';
    }).join('') : '<p class="sm-muted">No exam results yet</p>';
    body().innerHTML =
      '<div class="sm-row"><label>Exam Title</label><input class="sm-f-ext" placeholder="e.g. Monthly Test - October"></div>' +
      '<div class="sm-row"><label>Subject</label><input class="sm-f-exs" placeholder="e.g. Tajweed / Hifz / Nazra"></div>' +
      '<div style="display:flex;gap:10px"><div class="sm-row" style="flex:1"><label>Obtained</label><input class="sm-f-exo" type="number" placeholder="85"></div>' +
      '<div class="sm-row" style="flex:1"><label>Out of</label><input class="sm-f-extot" type="number" value="100"></div></div>' +
      '<div class="sm-row"><label>Date</label><input class="sm-f-exd" type="date" value="' + today() + '"></div>' +
      '<div class="sm-row"><label>Remarks (optional)</label><input class="sm-f-exr" placeholder="e.g. Excellent tajweed, revise Surah Yaseen"></div>' +
      '<button class="sm-btn" onclick="SM.addExam(this)">Add Result</button>' +
      '<div style="margin-top:18px;padding-top:14px;border-top:1px solid #eef3ee">' +
        '<p style="font-size:12px;font-weight:700;color:#667;margin-bottom:10px">RESULTS</p>' + rows + '</div>';
  };
  SM.addExam = async function (btn) {
    activeRoot = btn.closest('.sm-panel');
    var title = f('.sm-f-ext').value.trim();
    var subject = f('.sm-f-exs').value.trim();
    var obtained = parseFloat(f('.sm-f-exo').value);
    var total = parseFloat(f('.sm-f-extot').value) || 100;
    var exam_date = f('.sm-f-exd').value || today();
    var remarks = f('.sm-f-exr').value.trim();
    if (!title) return note('Enter an exam title');
    if (isNaN(obtained)) return note('Enter marks obtained');
    btn.disabled = true; btn.textContent = 'Saving…';
    var r = await _sb.from('exam_results').insert({ student_id: uid, title: title, subject: subject, obtained: obtained, total: total, exam_date: exam_date, remarks: remarks });
    btn.disabled = false; btn.textContent = 'Add Result';
    if (r.error) return writeError(r.error);
    note('✓ Result added');
    SM.renderExams();
  };
  SM.delExam = async function (btn, id) {
    activeRoot = btn.closest('.sm-panel');
    if (!confirm('Delete this result?')) return;
    var r = await _sb.from('exam_results').delete().eq('id', id);
    if (r.error) return writeError(r.error);
    note('Deleted'); SM.renderExams();
  };

  window.SM = SM;
  window.openStudentManager = function (id) { SM.open(id); };
})();
