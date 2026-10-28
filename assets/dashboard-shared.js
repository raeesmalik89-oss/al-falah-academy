// Shared helpers for login.html, student-dashboard.html, teacher-dashboard.html.
// Requires supabase-config.js (the `_sb` client) to be loaded first.

const SURAHS = ['Al-Fatihah','Al-Baqarah','Aal-Imran','An-Nisa','Al-Maidah','Al-Anam','Al-Araf','Al-Anfal','At-Tawbah','Yunus','Hud','Yusuf','Ar-Ra\'d','Ibrahim','Al-Hijr','An-Nahl','Al-Isra','Al-Kahf','Maryam','Ta-Ha','Al-Anbiya','Al-Hajj','Al-Muminun','An-Nur','Al-Furqan','Ash-Shu\'ara','An-Naml','Al-Qasas','Al-Ankabut','Ar-Rum','Luqman','As-Sajdah','Al-Ahzab','Saba','Fatir','Ya-Sin','As-Saffat','Sad','Az-Zumar','Ghafir','Fussilat','Ash-Shura','Az-Zukhruf','Ad-Dukhan','Al-Jathiyah','Al-Ahqaf','Muhammad','Al-Fath','Al-Hujurat','Qaf','Adh-Dhariyat','At-Tur','An-Najm','Al-Qamar','Ar-Rahman','Al-Waqi\'ah','Al-Hadid','Al-Mujadila','Al-Hashr','Al-Mumtahanah','As-Saf','Al-Jumu\'ah','Al-Munafiqun','At-Taghabun','At-Talaq','At-Tahrim','Al-Mulk','Al-Qalam','Al-Haqqah','Al-Ma\'arij','Nuh','Al-Jinn','Al-Muzzammil','Al-Muddaththir','Al-Qiyamah','Al-Insan','Al-Mursalat','An-Naba','An-Nazi\'at','Abasa','At-Takwir','Al-Infitar','Al-Mutaffifin','Al-Inshiqaq','Al-Buruj','At-Tariq','Al-Ala','Al-Ghashiyah','Al-Fajr','Al-Balad','Ash-Shams','Al-Layl','Ad-Duha','Ash-Sharh','At-Tin','Al-Alaq','Al-Qadr','Al-Bayyinah','Az-Zalzalah','Al-Adiyat','Al-Qari\'ah','At-Takathur','Al-Asr','Al-Humazah','Al-Fil','Quraysh','Al-Ma\'un','Al-Kawthar','Al-Kafirun','An-Nasr','Al-Masad','Al-Ikhlas','Al-Falaq','An-Nas'];

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
}

function renderAttendanceRow(r) {
  return `<div class="att-row"><span style="color:#666">${fmtDate(r.date)}</span><span style="font-size:12px;color:#555">${r.lesson || 'Class'}</span><span class="${r.present ? 'att-p' : 'att-a'}">${r.present ? '✓ Present' : '✗ Absent'}</span></div>`;
}

// Same mp3quran.net mapping used by index.html's Quran Listening player (qlAudioUrl),
// so a surah marked in the Hifz tracker plays from the same real audio source.
function surahAudioUrl(num, reciter = 'ar.alafasy') {
  const pad = n => String(n).padStart(3, '0');
  const mp3quran = {
    'ar.alafasy':            `https://server8.mp3quran.net/afs/${pad(num)}.mp3`,
    'ar.abdurrahmaansudais': `https://server11.mp3quran.net/sds/${pad(num)}.mp3`,
    'ar.mahermuaiqly':       `https://server12.mp3quran.net/maher/${pad(num)}.mp3`,
    'ar.husary':             `https://server13.mp3quran.net/husr/${pad(num)}.mp3`,
    'ar.minshawi':           `https://server10.mp3quran.net/minsh/${pad(num)}.mp3`,
    'ar.saoodshuraym':       `https://server9.mp3quran.net/shur/${pad(num)}.mp3`,
  };
  return mp3quran[reciter] || `https://cdn.islamic.network/quran/audio-surah/128/${reciter}/${num}.mp3`;
}

// The dashboard page for a given profile role.
function dashboardFor(role) {
  return role === 'admin' ? 'admin-dashboard.html'
       : role === 'teacher' ? 'teacher-dashboard.html'
       : 'student-dashboard.html';
}

// Used by *-dashboard.html. Redirects to login if there's no session, or to the
// signed-in profile's OWN dashboard if its role doesn't match the page's expected role.
async function requireSession(expectedRole) {
  const { data: { session } } = await _sb.auth.getSession();
  if (!session) { window.location.href = 'login.html'; return null; }
  const { data: profile } = await _sb.from('profiles').select('*').eq('id', session.user.id).single();
  if (!profile || profile.role !== expectedRole) {
    window.location.href = dashboardFor(profile?.role);
    return null;
  }
  return { session, profile };
}

// Used by login.html — sends an already-signed-in visitor straight to their dashboard.
async function redirectIfLoggedIn() {
  const { data: { session } } = await _sb.auth.getSession();
  if (!session) return;
  const { data: profile } = await _sb.from('profiles').select('role').eq('id', session.user.id).single();
  if (profile) window.location.href = dashboardFor(profile.role);
}
