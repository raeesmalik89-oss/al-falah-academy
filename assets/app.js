// ── ENROLLMENT FORM ──────────────────────────────────────────────────
function submitEnroll(e) {
  e.preventDefault();
  const form  = document.getElementById('enrollForm');
  const btn   = document.getElementById('enrollBtn');
  const spin  = '<span style="display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;vertical-align:middle;margin-left:8px"></span>';
  btn.disabled = true;
  btn.innerHTML = 'Submitting' + spin;

  const fd = new FormData(form);
  fd.append('_captcha', 'false');
  fd.append('_template', 'table');
  fd.append('_subject', 'New Enrollment — Al-Falah Islamic Academy — ' + (fd.get('student_name') || ''));

  // Build WhatsApp confirmation link
  const name    = fd.get('student_name') || '';
  const course  = fd.get('course') || '';
  const time    = fd.get('time_pref') || '';
  const phone   = fd.get('whatsapp') || '';
  const waMsg   = encodeURIComponent(`Assalamu Alaikum! 🌙 I have just submitted my enrollment form at Al-Falah Islamic Academy.\n\nStudent: ${name}\nCourse: ${course}\nPreferred Time: ${time}\nContact: ${phone}\n\nPlease confirm my free trial class. Jazak Allah Khayran!`);

  fetch('https://formsubmit.co/info@alfalah-academy.com', {
    method: 'POST', body: fd,
    headers: { 'Accept': 'application/json' }
  })
  .catch(() => ({}))
  .finally(() => {
    form.style.display = 'none';
    const succ = document.getElementById('enrollSuccess');
    succ.style.display = 'block';
    succ.innerHTML = `
      <div style="font-size:56px;margin-bottom:14px">✅</div>
      <h3 style="color:#0f4523;font-size:1.4rem;margin-bottom:10px">JazakAllahu Khayran, ${name.split(' ')[0]}!</h3>
      <p style="color:#444;line-height:1.7;margin-bottom:16px">Your enrollment request has been received. A scholar coordinator will contact you on <strong>WhatsApp within 24 hours</strong> to schedule your free trial class.</p>
      <a href="https://wa.me/923168818693?text=${waMsg}" target="_blank"
         style="display:inline-flex;align-items:center;gap:8px;background:#25d366;color:#fff;padding:12px 24px;border-radius:10px;font-weight:700;font-size:.95rem;text-decoration:none">
        💬 Send WhatsApp Confirmation
      </a>
      <p style="margin-top:14px;font-size:.82rem;color:#aaa">Or visit our <a href="enroll.html" style="color:#1a6b3a;font-weight:600">dedicated enrollment page</a> for a better experience</p>`;
  });
}

// ── TOGGLE MOBILE MENU ───────────────────────────────────────────────
function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

// ── TOAST NOTIFICATION ───────────────────────────────────────────────
function showToast(msg, duration = 3000) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}


// Spin keyframe for submit buttons
const _style = document.createElement('style');
_style.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
document.head.appendChild(_style);
// ═══════════════════════════════════════════════════════
// HADITH OF THE DAY — 40 Authentic Hadiths (cycle daily)
// ═══════════════════════════════════════════════════════
const HADITHS = [
  { arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى", urdu: "اعمال کا دارومدار نیتوں پر ہے، اور ہر انسان کو وہی ملے گا جو اس نے نیت کی۔", english: "Actions are judged by their intentions, and every person will get the reward according to what they intended.", source: "Sahih al-Bukhari 1", narrator: "Narrated by Umar ibn al-Khattab (RA)" },
  { arabic: "الدِّينُ النَّصِيحَةُ", urdu: "دین خیرخواہی کا نام ہے۔", english: "The religion is sincerity and well-wishing (for Allah, His Book, His Messenger, the leaders and the common Muslims).", source: "Sahih Muslim 55", narrator: "Narrated by Tamim al-Dari (RA)" },
  { arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ", urdu: "جو اللہ اور قیامت کے دن پر ایمان رکھتا ہو وہ یا اچھی بات کہے یا خاموش رہے۔", english: "Whoever believes in Allah and the Last Day should speak good or keep silent.", source: "Sahih al-Bukhari 6018", narrator: "Narrated by Abu Hurairah (RA)" },
  { arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", urdu: "تم میں سے کوئی اس وقت تک مومن نہیں ہو سکتا جب تک اپنے بھائی کے لیے وہی نہ پسند کرے جو اپنے لیے پسند کرتا ہو۔", english: "None of you truly believes until he loves for his brother what he loves for himself.", source: "Sahih al-Bukhari 13", narrator: "Narrated by Anas ibn Malik (RA)" },
  { arabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ", urdu: "مسلمان وہ ہے جس کی زبان اور ہاتھ سے دوسرے مسلمان محفوظ رہیں۔", english: "A Muslim is the one from whose tongue and hands the Muslims are safe.", source: "Sahih al-Bukhari 10", narrator: "Narrated by Abdullah ibn Amr (RA)" },
  { arabic: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ", urdu: "اللہ کے نزدیک سب سے پسندیدہ عمل وہ ہے جو مستقل ہو، چاہے تھوڑا ہی کیوں نہ ہو۔", english: "The most beloved deeds to Allah are the most consistent, even if they are small.", source: "Sahih al-Bukhari 6465", narrator: "Narrated by Aisha (RA)" },
  { arabic: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا", urdu: "جہاں بھی ہو اللہ سے ڈرو، برائی کے بعد نیکی کرو وہ اسے مٹا دے گی، اور لوگوں کے ساتھ اچھے اخلاق سے پیش آؤ۔", english: "Fear Allah wherever you are, follow a bad deed with a good one to erase it, and deal with people with good character.", source: "Jami at-Tirmidhi 1987", narrator: "Narrated by Muadh ibn Jabal (RA)" },
  { arabic: "إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ", urdu: "بے شک اللہ تمہاری صورتوں اور مالوں کو نہیں دیکھتا بلکہ تمہارے دلوں اور اعمال کو دیکھتا ہے۔", english: "Verily Allah does not look at your appearance or wealth, but He looks at your hearts and your deeds.", source: "Sahih Muslim 2564", narrator: "Narrated by Abu Hurairah (RA)" },
  { arabic: "الطَّهُورُ شَطْرُ الإِيمَانِ", urdu: "پاکیزگی نصف ایمان ہے۔", english: "Purity is half of faith.", source: "Sahih Muslim 223", narrator: "Narrated by Abu Malik al-Ashari (RA)" },
  { arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", urdu: "تم میں سب سے بہتر وہ ہے جو قرآن سیکھے اور سکھائے۔", english: "The best among you are those who learn the Quran and teach it.", source: "Sahih al-Bukhari 5027", narrator: "Narrated by Uthman ibn Affan (RA)" },
  { arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ", urdu: "جو شخص علم حاصل کرنے کے لیے راستہ چلے، اللہ اس کے لیے جنت کا راستہ آسان کر دیتا ہے۔", english: "Whoever takes a path in search of knowledge, Allah will make easy for him the path to Paradise.", source: "Sahih Muslim 2699", narrator: "Narrated by Abu Hurairah (RA)" },
  { arabic: "الصِّيَامُ جُنَّةٌ", urdu: "روزہ ڈھال ہے۔", english: "Fasting is a shield (from hellfire and sins).", source: "Sahih al-Bukhari 1894", narrator: "Narrated by Abu Hurairah (RA)" },
  { arabic: "كُلُّ مَعْرُوفٍ صَدَقَةٌ", urdu: "ہر نیکی صدقہ ہے۔", english: "Every act of kindness is charity.", source: "Sahih al-Bukhari 6021", narrator: "Narrated by Jabir ibn Abdullah (RA)" },
  { arabic: "الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا", urdu: "مومن مومن کے لیے ایسا ہے جیسے ایک عمارت جس کے حصے ایک دوسرے کو مضبوط کرتے ہیں۔", english: "A believer to another believer is like a building whose different parts enforce each other.", source: "Sahih al-Bukhari 481", narrator: "Narrated by Abu Musa al-Ashari (RA)" },
  { arabic: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ", urdu: "پہلوان وہ نہیں جو لوگوں کو پچھاڑ دے، بلکہ اصل پہلوان وہ ہے جو غصے میں خود پر قابو رکھے۔", english: "The strong is not the one who overcomes people by his strength, but the strong is the one who controls himself while in anger.", source: "Sahih al-Bukhari 6114", narrator: "Narrated by Abu Hurairah (RA)" },
  { arabic: "إِنَّ مِنْ أَكْمَلِ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا", urdu: "ایمان کے لحاظ سے سب سے کامل مومن وہ ہے جس کے اخلاق سب سے اچھے ہیں۔", english: "The most complete of the believers in faith is the one with the best character.", source: "Sunan Abu Dawud 4682", narrator: "Narrated by Abu Hurairah (RA)" },
  { arabic: "بُعِثْتُ لِأُتَمِّمَ مَكَارِمَ الأَخْلَاقِ", urdu: "مجھے اچھے اخلاق کو مکمل کرنے کے لیے بھیجا گیا ہے۔", english: "I was sent to perfect good character.", source: "Al-Adab Al-Mufrad 273", narrator: "Narrated by Abu Hurairah (RA)" },
  { arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ", urdu: "اے اللہ! میں تجھ سے دنیا اور آخرت میں عافیت مانگتا ہوں۔", english: "O Allah, I ask You for well-being in this world and in the Hereafter.", source: "Sunan Ibn Majah 3871", narrator: "Narrated by Abdullah ibn Umar (RA)" },
  { arabic: "أَفْضَلُ الصِّيَامِ بَعْدَ رَمَضَانَ شَهْرُ اللَّهِ الْمُحَرَّمُ", urdu: "رمضان کے بعد سب سے افضل روزہ اللہ کے مہینے محرم کا روزہ ہے۔", english: "The best fasting after Ramadan is the month of Allah, Muharram.", source: "Sahih Muslim 1163", narrator: "Narrated by Abu Hurairah (RA)" },
  { arabic: "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", urdu: "جس نے ایمان اور ثواب کی نیت سے رمضان کے روزے رکھے اس کے پچھلے سب گناہ معاف کر دیے جائیں گے۔", english: "Whoever fasts during Ramadan with sincere faith and hoping for reward, his previous sins will be forgiven.", source: "Sahih al-Bukhari 38", narrator: "Narrated by Abu Hurairah (RA)" },
  { arabic: "خَيْرُ الأُمُورِ أَوْسَطُهَا", urdu: "بہترین کام درمیانہ روش والے ہیں۔", english: "The best of matters is the middle course.", source: "Bayhaqi, Shuab al-Iman", narrator: "Narrated by Ali ibn Abi Talib (RA)" },
  { arabic: "اِقْرَأْ وَارْقَ", urdu: "پڑھتے جاؤ اور بلندی حاصل کرتے جاؤ۔", english: "Recite and rise (in rank).", source: "Sunan Abu Dawud 1464", narrator: "Regarding the Quran reciter" },
  { arabic: "رَبِّ زِدْنِي عِلْمًا", urdu: "اے میرے رب! میرا علم بڑھا۔", english: "O my Lord, increase me in knowledge.", source: "Quran 20:114 / Daily Dua", narrator: "Supplication of the Prophet ﷺ" },
  { arabic: "أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا وَخِيَارُهُمْ خِيَارُهُمْ لِنِسَائِهِمْ", urdu: "مومنوں میں سب سے زیادہ کامل ایمان اس کا ہے جو اخلاق میں سب سے اچھا ہو، اور بہترین وہ ہیں جو اپنی بیویوں کے لیے بہترین ہیں۔", english: "The most complete believer in faith is the best of them in character, and the best of them are those who are best to their wives.", source: "Jami at-Tirmidhi 1162", narrator: "Narrated by Abu Hurairah (RA)" },
  { arabic: "إِنَّ اللَّهَ رَفِيقٌ يُحِبُّ الرِّفْقَ فِي الأَمْرِ كُلِّهِ", urdu: "بے شک اللہ نرمی والا ہے اور ہر کام میں نرمی کو پسند کرتا ہے۔", english: "Verily Allah is kind and He loves kindness in all matters.", source: "Sahih al-Bukhari 6927", narrator: "Narrated by Aisha (RA)" },
  { arabic: "الْبَرُّ حُسْنُ الْخُلُقِ", urdu: "نیکی اچھے اخلاق کا نام ہے۔", english: "Righteousness is good character.", source: "Sahih Muslim 2553", narrator: "Narrated by Al-Nawwas ibn Sam'an (RA)" },
  { arabic: "مَنْ لَا يَشْكُرِ النَّاسَ لَا يَشْكُرِ اللَّهَ", urdu: "جو لوگوں کا شکر نہیں کرتا وہ اللہ کا بھی شکر نہیں کرتا۔", english: "He who does not thank people does not thank Allah.", source: "Sunan Abu Dawud 4811", narrator: "Narrated by Abu Hurairah (RA)" },
  { arabic: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ", urdu: "اپنے بھائی کے چہرے پر مسکراہٹ بھی تمہارے لیے صدقہ ہے۔", english: "Your smiling in the face of your brother is charity.", source: "Jami at-Tirmidhi 1956", narrator: "Narrated by Abu Dharr (RA)" },
  { arabic: "صِلْ مَنْ قَطَعَكَ وَأَعْطِ مَنْ حَرَمَكَ وَاعْفُ عَمَّنْ ظَلَمَكَ", urdu: "جو تجھ سے قطع تعلق کرے اس سے تعلق جوڑو، جو تجھے محروم کرے اسے دو، اور جو تم پر ظلم کرے اسے معاف کرو۔", english: "Maintain relations with those who cut you off, give to those who withhold from you, and forgive those who wrong you.", source: "Musnad Ahmad 17452", narrator: "Narrated by Uqbah ibn Amir (RA)" },
  { arabic: "أَقِمِ الصَّلَاةَ لِدُلُوكِ الشَّمْسِ إِلَى غَسَقِ اللَّيْلِ", urdu: "سورج کے ڈھلنے سے رات کے اندھیرے تک نماز قائم کرو۔", english: "Establish prayer from the decline of the sun until the darkness of the night.", source: "Quran 17:78 / Daily Reminder", narrator: "Divine Command" },
  { arabic: "إِنَّ خَيْرَ مَا رَكِبَ الرَّجُلُ رَأْسَهُ لَعَقْلُهُ", urdu: "آدمی کے لیے سب سے بہترین سواری اس کی اپنی عقل ہے۔", english: "The best thing a man can ride upon is his reason.", source: "Adab al-Mufrad", narrator: "Classical Islamic Wisdom" },
  { arabic: "مَنْ أَصْبَحَ آمِنًا فِي سِرْبِهِ مُعَافًى فِي جَسَدِهِ عِنْدَهُ قُوتُ يَوْمِهِ فَكَأَنَّمَا حِيزَتْ لَهُ الدُّنْيَا", urdu: "جو شخص اپنے گھر میں امن کے ساتھ صبح کرے، اس کا جسم تندرست ہو اور اس کے پاس اس دن کا کھانا ہو، گویا اس کے لیے ساری دنیا سمیٹ دی گئی۔", english: "Whoever begins the day safe in his home, healthy in body, with food for the day — it is as if the whole world were given to him.", source: "Jami at-Tirmidhi 2346", narrator: "Narrated by Ubaidullah ibn Mihsan (RA)" },
  { arabic: "الْكَيِّسُ مَنْ دَانَ نَفْسَهُ وَعَمِلَ لِمَا بَعْدَ الْمَوْتِ", urdu: "عقلمند وہ ہے جو اپنے نفس کا احتساب کرے اور موت کے بعد کے لیے عمل کرے۔", english: "The wise one is he who controls his soul and works for what comes after death.", source: "Jami at-Tirmidhi 2459", narrator: "Narrated by Shaddad ibn Aws (RA)" },
  { arabic: "اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي", urdu: "اے اللہ! میرے لیے میرا دین درست فرما جو میرے معاملے کی حفاظت ہے۔", english: "O Allah, set right for me my religion which is the safeguard of my affairs.", source: "Sahih Muslim 2720", narrator: "Narrated by Abu Hurairah (RA)" },
  { arabic: "عَجَبًا لِأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ", urdu: "مومن کا معاملہ عجیب ہے، اس کا سارا معاملہ بھلائی والا ہے۔", english: "How wonderful is the affair of the believer — all of his affair is good.", source: "Sahih Muslim 2999", narrator: "Narrated by Suhaib (RA)" },
  { arabic: "إِيَّاكُمْ وَالظَّنَّ فَإِنَّ الظَّنَّ أَكْذَبُ الْحَدِيثِ", urdu: "بدگمانی سے بچو، کیونکہ بدگمانی سب سے بڑا جھوٹ ہے۔", english: "Beware of suspicion, for suspicion is the worst of false tales.", source: "Sahih al-Bukhari 6064", narrator: "Narrated by Abu Hurairah (RA)" },
  { arabic: "مَنْ كَانَتِ الآخِرَةُ هَمَّهُ جَعَلَ اللَّهُ غِنَاهُ فِي قَلْبِهِ", urdu: "جس کی فکر آخرت ہو اللہ اس کی بے نیازی اس کے دل میں ڈال دیتا ہے۔", english: "Whoever's concern is the Hereafter, Allah will place contentment in his heart.", source: "Sunan Ibn Majah 4105", narrator: "Narrated by Anas ibn Malik (RA)" },
  { arabic: "لَا تَحْقِرَنَّ مِنَ الْمَعْرُوفِ شَيْئًا", urdu: "کسی نیک کام کو حقیر مت جانو چاہے وہ اپنے بھائی سے خندہ پیشانی سے ملنا ہی کیوں نہ ہو۔", english: "Do not belittle any good deed, even meeting your brother with a cheerful face.", source: "Sahih Muslim 2626", narrator: "Narrated by Abu Dharr (RA)" },
  { arabic: "الدُّعَاءُ مُخُّ الْعِبَادَةِ", urdu: "دعا عبادت کا مغز ہے۔", english: "Du'a (supplication) is the essence of worship.", source: "Jami at-Tirmidhi 3371", narrator: "Narrated by Anas ibn Malik (RA)" },
  { arabic: "حُبُّكَ الشَّيْءَ يُعْمِي وَيُصِمُّ", urdu: "کسی چیز کی محبت انسان کو اندھا اور بہرا کر دیتی ہے۔", english: "Your love for a thing makes you blind and deaf.", source: "Sunan Abu Dawud 5130", narrator: "Narrated by Abu Darda (RA)" },
];

let currentHadithIdx = 0;

function getTodayHadithIndex() {
  const start = new Date('2024-01-01');
  const today = new Date();
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  return diff % HADITHS.length;
}

function renderHadith(idx) {
  const h = HADITHS[idx];
  const card = document.getElementById('hadithCard');
  card.innerHTML = `
    <div class="hadith-meta-top">
      <span class="hadith-source-badge">${h.source}</span>
      <span class="hadith-narrator">${h.narrator}</span>
    </div>
    <div class="hadith-arabic">${h.arabic}</div>
    <div class="hadith-divider"></div>
    <div class="hadith-urdu"><span class="lang-tag">اردو</span>${h.urdu}</div>
    <div class="hadith-english"><span class="lang-tag">English</span>${h.english}</div>
    <div class="hadith-share">
      <button onclick="shareHadith(${idx})" class="hadith-share-btn">📤 Share</button>
      <button onclick="copyHadith(${idx})" class="hadith-share-btn">📋 Copy</button>
    </div>
  `;
  const counter = document.getElementById('hadithCounter');
  if (counter) counter.textContent = `${idx + 1} of ${HADITHS.length}`;
}

function shareHadith(idx) {
  const h = HADITHS[idx];
  const text = `📖 Hadith of the Day (${h.source})\n\n${h.arabic}\n\n${h.english}\n\n— Al-Falah Islamic Academy`;
  if (navigator.share) { navigator.share({ text }); }
  else { navigator.clipboard.writeText(text); showToast('Hadith copied to clipboard!'); }
}
function copyHadith(idx) {
  const h = HADITHS[idx];
  navigator.clipboard.writeText(`${h.arabic}\n\n${h.english}\n\n— ${h.source}`);
  showToast('Hadith copied!');
}
function prevHadith() { currentHadithIdx = (currentHadithIdx - 1 + HADITHS.length) % HADITHS.length; renderHadith(currentHadithIdx); }
function nextHadith() { currentHadithIdx = (currentHadithIdx + 1) % HADITHS.length; renderHadith(currentHadithIdx); }

// ═══════════════════════════════════════════════════════
// FREE BOOKS LIBRARY — data embedded directly (works offline & on server)
// ═══════════════════════════════════════════════════════
const BOOKS_DATA = {"updated":"2026-05-23","books":[
  {"id":"taj-16-line","title":"Quran Majeed — 16 Line (Taj Company)","author":"Taj Company Ltd., Pakistan","lang":"arabic","category":"quran","featured":true,"desc":"The most widely used Quran print in Pakistan and South Asia. 16-line per page layout, Uthmani script, colour-coded Tajweed marks. Published by the prestigious Taj Company, Lahore.","pages":"604 pages","url":"https://islamhouse.com/ar/books/14/","source":"IslamHouse.com"},
  {"id":"quran-clear-en","title":"The Clear Quran — English Translation","author":"Dr. Mustafa Khattab","lang":"english","category":"quran","featured":false,"desc":"Most popular modern English Quran translation. Clear, contemporary language easy for new Muslims and non-Muslims.","pages":"604 pages","url":"https://archive.org/details/khattab-dr.-mustafa-the-clear-quran-mustafa-khattab-2022-libgen.li","source":"Archive.org"},
  {"id":"quran-urdu-jalandhari","title":"Quran Majeed with Urdu Translation","author":"Maulana Fateh Muhammad Jalandhari","lang":"urdu","category":"quran","featured":false,"desc":"Complete Quran with classic Urdu translation used in millions of Pakistani homes for over a century.","pages":"604 pages","url":"https://islamhouse.com/ur/books/14/","source":"IslamHouse.com"},
  {"id":"tafsir-ibn-kathir-urdu","title":"Tafsir Ibn Kathir (Urdu)","author":"Imam Ibn Kathir — Urdu Translation","lang":"urdu","category":"quran","featured":false,"desc":"Most authoritative classical Quran commentary in Urdu. 10 volumes. Essential for serious Quran students.","pages":"10 volumes","url":"https://archive.org/details/tafseer-ibn-kaseer-urdu","source":"Archive.org"},
  {"id":"sahih-bukhari-arabic","title":"صحيح البخاري — Sahih al-Bukhari (Arabic)","author":"Imam Muhammad al-Bukhari","lang":"arabic","category":"hadith","featured":false,"desc":"The most authentic Hadith collection — 7,563 verified Hadiths. The highest authority in Islamic scholarship after the Quran.","pages":"4 volumes","url":"https://sunnah.com/bukhari","source":"Sunnah.com"},
  {"id":"sahih-bukhari-urdu","title":"Sahih al-Bukhari (Urdu)","author":"Tr. Maulana Muhammad Dawood Raaz","lang":"urdu","category":"hadith","featured":false,"desc":"Complete Urdu translation of Sahih al-Bukhari with notes. 9 volumes.","pages":"9 volumes","url":"https://islamhouse.com/ur/books/2497/","source":"IslamHouse.com"},
  {"id":"sahih-muslim-arabic","title":"صحيح مسلم — Sahih Muslim (Arabic)","author":"Imam Muslim ibn al-Hajjaj","lang":"arabic","category":"hadith","featured":false,"desc":"The second most authentic Hadith collection — 7,500 Hadiths with meticulous chain of narrators.","pages":"5 volumes","url":"https://archive.org/details/sahih-muslim-arabic","source":"Archive.org"},
  {"id":"riyad-saliheen-en","title":"Riyad us-Saliheen (English)","author":"Imam al-Nawawi","lang":"english","category":"hadith","featured":false,"desc":"Gardens of the Righteous — 1,896 Hadiths on righteous living. The most beloved daily Hadith reader.","pages":"640 pages","url":"https://islamhouse.com/en/books/2789/","source":"IslamHouse.com"},
  {"id":"riyad-saliheen-ur","title":"ریاض الصالحین (Urdu)","author":"Imam al-Nawawi — Urdu Translation","lang":"urdu","category":"hadith","featured":false,"desc":"Urdu translation of Riyad us-Saliheen. Used in households across Pakistan as a daily Hadith reader.","pages":"620 pages","url":"https://archive.org/details/riyad-us-saliheen-urdu","source":"Archive.org"},
  {"id":"40-nawawi-en","title":"40 Hadith al-Nawawi (English)","author":"Imam al-Nawawi","lang":"english","category":"hadith","featured":false,"desc":"The essential 42 Hadiths with full English commentary. Every Muslim should know these.","pages":"90 pages","url":"https://islamhouse.com/en/books/209/","source":"IslamHouse.com"},
  {"id":"40-nawawi-ur","title":"اربعین نووی (Urdu)","author":"Imam al-Nawawi — Urdu Commentary","lang":"urdu","category":"hadith","featured":false,"desc":"Forty Hadith with Urdu explanation and commentary. Perfect for families to read together.","pages":"95 pages","url":"https://islamhouse.com/ur/books/382/","source":"IslamHouse.com"},
  {"id":"muntakhab-ahadith","title":"منتخب احادیث","author":"Maulana Muhammad Yusuf Kandhlawi","lang":"urdu","category":"hadith","featured":false,"desc":"Selected Hadiths covering Six Qualities of Iman. Used worldwide — essential for Islamic self-improvement.","pages":"543 pages","url":"https://archive.org/search?query=muntakhab+ahadith+yusuf+kandhlawi&mediatype=texts","source":"Archive.org"},
  {"id":"fazail-aamal","title":"فضائل اعمال — Fazail-e-Aamal","author":"Sheikh Muhammad Zakariyya Kandhlawi","lang":"urdu","category":"hadith","featured":false,"desc":"Virtues of deeds from authentic Hadith. Most widely read Islamic book in South Asia — Quran, Salah, Zikr, Hajj.","pages":"456 pages","url":"https://archive.org/search?query=fazail+amal+zakariyya+kandhlawi&mediatype=texts","source":"Archive.org"},
  {"id":"bahishti-zewar","title":"بہشتی زیور — Bahishti Zewar","author":"Maulana Ashraf Ali Thanvi","lang":"urdu","category":"fiqh","featured":false,"desc":"Heavenly Ornaments — comprehensive guide to Islamic practice in everyday life. Most widely read in South Asian homes.","pages":"712 pages","url":"https://archive.org/details/bahishti-zewar","source":"Archive.org"},
  {"id":"aasan-fiqh","title":"آسان فقہ — Aasan Fiqh","author":"Mufti Muhammad Taqi Usmani","lang":"urdu","category":"fiqh","featured":false,"desc":"Simple Islamic jurisprudence for everyday Muslims. Covers purity, prayer, fasting, zakat and hajj.","pages":"324 pages","url":"https://archive.org/search?query=aasan+fiqh+taqi+usmani&mediatype=texts","source":"Archive.org"},
  {"id":"provisions-hereafter","title":"Provisions for the Hereafter (Zad al-Maad)","author":"Imam Ibn Qayyim al-Jawziyyah","lang":"english","category":"fiqh","featured":false,"desc":"The Prophet's guidance in worship, transactions and daily life. A masterpiece of Islamic scholarship.","pages":"780 pages","url":"https://islamhouse.com/en/books/2686/","source":"IslamHouse.com"},
  {"id":"dont-be-sad","title":"Don't Be Sad (La Tahzan)","author":"Dr. Aaidh al-Qarni","lang":"english","category":"aqeedah","featured":false,"desc":"A beautiful book on dealing with sorrow, anxiety and hardship through Islamic wisdom. Over 10 million copies sold.","pages":"470 pages","url":"https://islamhouse.com/en/books/2618/","source":"IslamHouse.com"},
  {"id":"kitab-tawheed","title":"Kitab al-Tawheed (Book of Monotheism)","author":"Sheikh Muhammad ibn Abdul Wahhab","lang":"english","category":"aqeedah","featured":false,"desc":"The foundational text on Islamic monotheism. Essential reading for understanding Tawheed.","pages":"215 pages","url":"https://islamhouse.com/en/books/345/","source":"IslamHouse.com"},
  {"id":"sealed-nectar","title":"The Sealed Nectar (Ar-Raheeq al-Makhtum)","author":"Safiur Rahman Mubarakpuri","lang":"english","category":"seerah","featured":false,"desc":"Award-winning biography of Prophet Muhammad ﷺ. Winner of the World Muslim League competition. Most widely read English Seerah.","pages":"580 pages","url":"https://islamhouse.com/en/books/2689/","source":"IslamHouse.com"},
  {"id":"seerat-un-nabi-ur","title":"سیرت النبی ﷺ","author":"Shibli Nomani & Syed Sulaiman Nadvi","lang":"urdu","category":"seerah","featured":false,"desc":"Most comprehensive Urdu biography of Prophet Muhammad ﷺ. 7-volume scholarly masterpiece.","pages":"7 volumes","url":"https://archive.org/search?query=seerat+un+nabi+shibli+nomani+urdu&mediatype=texts","source":"Archive.org"},
  {"id":"hisnul-muslim-en","title":"Fortress of the Muslim (Hisnul Muslim)","author":"Said bin Ali al-Qahtani","lang":"english","category":"dua","featured":false,"desc":"Complete authentic daily duas — morning/evening, prayer, travel, eating, sleeping. With transliteration.","pages":"115 pages","url":"https://islamhouse.com/en/books/339/","source":"IslamHouse.com"},
  {"id":"hisnul-muslim-ur","title":"حصن المسلم (Urdu)","author":"Said bin Ali al-Qahtani","lang":"urdu","category":"dua","featured":false,"desc":"All daily duas from Quran and Sunnah with Urdu translation and transliteration.","pages":"120 pages","url":"https://islamhouse.com/ur/books/339/","source":"IslamHouse.com"},
  {"id":"hisnul-muslim-ar","title":"حصن المسلم (عربي)","author":"Said bin Ali al-Qahtani","lang":"arabic","category":"dua","featured":false,"desc":"The original Arabic Fortress of the Muslim — all daily duas with complete references.","pages":"120 pages","url":"https://islamhouse.com/ar/books/339/","source":"IslamHouse.com"},
  {"id":"quran-arabic-uthmani","title":"المصحف الشريف — Holy Quran (Uthmani Script)","author":"King Fahd Complex, Madinah","lang":"arabic","category":"quran","featured":false,"desc":"The standard Quran print from the King Fahd Complex in Madinah — used worldwide. Free download.","pages":"604 pages","url":"https://archive.org/details/quran-pdf-madina","source":"Archive.org"}
]};

let ALL_BOOKS = BOOKS_DATA.books;
let activeLang = 'all';
let activeCat  = 'all';

const langFlag = { urdu:'🇵🇰 اردو', arabic:'🕌 عربي', english:'🌍 English' };
const catColor = { quran:'#1a6b3a', hadith:'#c8972a', fiqh:'#1a56db', aqeedah:'#8b1a8b', seerah:'#8b4513', dua:'#1a8b8b', general:'#555' };

async function loadBooks() {
  // books.json (generated by books_scraper.py) is the primary, larger catalog.
  // BOOKS_DATA above stays as an inline fallback for offline use / file:// browsing,
  // where a fetch() of a local JSON file is blocked by the browser.
  const badge = document.getElementById('booksUpdated');
  try {
    const resp = await fetch('books.json', { cache: 'no-store' });
    if (!resp.ok) throw new Error('books.json request failed');
    const data = await resp.json();
    if (data && Array.isArray(data.books) && data.books.length) {
      ALL_BOOKS = data.books;
      if (badge) badge.textContent = 'Updated: ' + (data.updated || BOOKS_DATA.updated);
      renderBooks();
      return;
    }
  } catch (e) {
    // fall through to the embedded fallback below
  }
  if (badge) badge.textContent = 'Updated: ' + BOOKS_DATA.updated;
  renderBooks();
}

function renderBooks() {
  const query  = (document.getElementById('bookSearch')?.value || '').toLowerCase();
  const grid   = document.getElementById('booksGrid');
  const noMsg  = document.getElementById('noBooksMsg');

  let filtered = ALL_BOOKS.filter(b => {
    const matchLang = activeLang === 'all' || b.lang === activeLang;
    const matchCat  = activeCat  === 'all' || b.category === activeCat;
    const matchQ    = !query
      || (b.title  || '').toLowerCase().includes(query)
      || (b.author || '').toLowerCase().includes(query)
      || (b.desc   || '').toLowerCase().includes(query)
      || (b.category || '').includes(query);
    return matchLang && matchCat && matchQ;
  });

  // Featured books (Taj Quran etc.) always on top
  filtered.sort((a,b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  if (!filtered.length) { grid.innerHTML = ''; noMsg.style.display = 'block'; return; }
  noMsg.style.display = 'none';

  grid.innerHTML = filtered.map(b => `
    <div class="book-card ${b.featured ? 'book-featured' : ''}">
      ${b.featured ? '<div class="book-featured-badge">⭐ Featured</div>' : ''}
      <div class="book-lang-badge" style="background:${catColor[b.category] || '#555'}">${langFlag[b.lang] || b.lang}</div>
      <div class="book-icon">${b.featured ? '📖' : '📚'}</div>
      <div class="book-cat-badge">${(b.category||'').charAt(0).toUpperCase() + (b.category||'').slice(1)}</div>
      <h3 class="book-title">${b.title}</h3>
      <p class="book-author">✍️ ${b.author}</p>
      <p class="book-desc">${b.desc}</p>
      <div class="book-meta">📄 ${b.pages || ''} &nbsp;|&nbsp; 🌐 ${b.source || ''}</div>
      <div class="book-btns">
        <a href="${b.url}" target="_blank" rel="noopener" class="btn-download">📖 Read Online</a>
        <a href="${b.url2 ? b.url2 : (b.url.includes('/details/') ? b.url.replace('/details/','/download/') : b.url)}" target="_blank" rel="noopener" class="btn-download btn-download-alt">⬇️ Download</a>
      </div>
    </div>
  `).join('');
}

function filterBooks() { renderBooks(); }
function filterByLang(lang, el) {
  activeLang = lang;
  document.querySelectorAll('.filter-btn:not([data-cat])').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderBooks();
}
function filterByCategory(cat, el) {
  activeCat = cat;
  document.querySelectorAll('.filter-btn[data-cat]').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderBooks();
}

// ── Init on load ────────────────────────────────────────
// ── QURAN AUDIO PLAYER ──────────────────────────────────
const SURAHS = [
  [1,'Al-Fatihah','الفاتحة','The Opening',7],
  [2,'Al-Baqarah','البقرة','The Cow',286],
  [3,'Aal-Imran','آل عمران','Family of Imran',200],
  [4,'An-Nisa','النساء','The Women',176],
  [5,'Al-Maidah','المائدة','The Table',120],
  [6,'Al-Anam','الأنعام','The Cattle',165],
  [7,'Al-Araf','الأعراف','The Heights',206],
  [8,'Al-Anfal','الأنفال','The Spoils',75],
  [9,'At-Tawbah','التوبة','The Repentance',129],
  [10,'Yunus','يونس','Jonah',109],
  [11,'Hud','هود','Hud',123],
  [12,'Yusuf','يوسف','Joseph',111],
  [13,'Ar-Rad','الرعد','The Thunder',43],
  [14,'Ibrahim','إبراهيم','Abraham',52],
  [15,'Al-Hijr','الحجر','The Rocky Tract',99],
  [16,'An-Nahl','النحل','The Bee',128],
  [17,'Al-Isra','الإسراء','The Night Journey',111],
  [18,'Al-Kahf','الكهف','The Cave',110],
  [19,'Maryam','مريم','Mary',98],
  [20,'Ta-Ha','طه','Ta-Ha',135],
  [21,'Al-Anbiya','الأنبياء','The Prophets',112],
  [22,'Al-Hajj','الحج','The Pilgrimage',78],
  [23,'Al-Muminun','المؤمنون','The Believers',118],
  [24,'An-Nur','النور','The Light',64],
  [25,'Al-Furqan','الفرقان','The Criterion',77],
  [26,'Ash-Shuara','الشعراء','The Poets',227],
  [27,'An-Naml','النمل','The Ant',93],
  [28,'Al-Qasas','القصص','The Stories',88],
  [29,'Al-Ankabut','العنكبوت','The Spider',69],
  [30,'Ar-Rum','الروم','The Romans',60],
  [31,'Luqman','لقمان','Luqman',34],
  [32,'As-Sajdah','السجدة','The Prostration',30],
  [33,'Al-Ahzab','الأحزاب','The Coalition',73],
  [34,'Saba','سبأ','Sheba',54],
  [35,'Fatir','فاطر','Originator',45],
  [36,'Ya-Sin','يس','Ya-Sin',83],
  [37,'As-Saffat','الصافات','Those Ranged in Ranks',182],
  [38,'Sad','ص','Sad',88],
  [39,'Az-Zumar','الزمر','The Groups',75],
  [40,'Ghafir','غافر','The Forgiver',85],
  [41,'Fussilat','فصلت','Explained in Detail',54],
  [42,'Ash-Shura','الشورى','The Consultation',53],
  [43,'Az-Zukhruf','الزخرف','The Ornaments of Gold',89],
  [44,'Ad-Dukhan','الدخان','The Smoke',59],
  [45,'Al-Jathiyah','الجاثية','The Crouching',37],
  [46,'Al-Ahqaf','الأحقاف','The Wind-Curved Sandhills',35],
  [47,'Muhammad','محمد','Muhammad',38],
  [48,'Al-Fath','الفتح','The Victory',29],
  [49,'Al-Hujurat','الحجرات','The Rooms',18],
  [50,'Qaf','ق','Qaf',45],
  [51,'Adh-Dhariyat','الذاريات','The Winnowing Winds',60],
  [52,'At-Tur','الطور','The Mount',49],
  [53,'An-Najm','النجم','The Star',62],
  [54,'Al-Qamar','القمر','The Moon',55],
  [55,'Ar-Rahman','الرحمن','The Most Merciful',78],
  [56,'Al-Waqiah','الواقعة','The Event',96],
  [57,'Al-Hadid','الحديد','The Iron',29],
  [58,'Al-Mujadila','المجادلة','The Pleading Woman',22],
  [59,'Al-Hashr','الحشر','The Exile',24],
  [60,'Al-Mumtahanah','الممتحنة','She that is to be Examined',13],
  [61,'As-Saf','الصف','The Ranks',14],
  [62,'Al-Jumuah','الجمعة','Friday',11],
  [63,'Al-Munafiqun','المنافقون','The Hypocrites',11],
  [64,'At-Taghabun','التغابن','The Mutual Disillusion',18],
  [65,'At-Talaq','الطلاق','The Divorce',12],
  [66,'At-Tahrim','التحريم','The Prohibition',12],
  [67,'Al-Mulk','الملك','The Sovereignty',30],
  [68,'Al-Qalam','القلم','The Pen',52],
  [69,'Al-Haqqah','الحاقة','The Reality',52],
  [70,'Al-Maarij','المعارج','The Ascending Stairways',44],
  [71,'Nuh','نوح','Noah',28],
  [72,'Al-Jinn','الجن','The Jinn',28],
  [73,'Al-Muzzammil','المزمل','The Enshrouded One',20],
  [74,'Al-Muddaththir','المدثر','The Cloaked One',56],
  [75,'Al-Qiyamah','القيامة','The Resurrection',40],
  [76,'Al-Insan','الإنسان','The Human',31],
  [77,'Al-Mursalat','المرسلات','The Emissaries',50],
  [78,'An-Naba','النبأ','The Announcement',40],
  [79,'An-Naziat','النازعات','Those who drag forth',46],
  [80,'Abasa','عبس','He Frowned',42],
  [81,'At-Takwir','التكوير','The Overthrowing',29],
  [82,'Al-Infitar','الانفطار','The Cleaving',19],
  [83,'Al-Mutaffifin','المطففين','The Defrauding',36],
  [84,'Al-Inshiqaq','الانشقاق','The Splitting Open',25],
  [85,'Al-Buruj','البروج','The Mansions of the Stars',22],
  [86,'At-Tariq','الطارق','The Morning Star',17],
  [87,'Al-Ala','الأعلى','The Most High',19],
  [88,'Al-Ghashiyah','الغاشية','The Overwhelming',26],
  [89,'Al-Fajr','الفجر','The Dawn',30],
  [90,'Al-Balad','البلد','The City',20],
  [91,'Ash-Shams','الشمس','The Sun',15],
  [92,'Al-Layl','الليل','The Night',21],
  [93,'Ad-Duha','الضحى','The Morning Hours',11],
  [94,'Ash-Sharh','الشرح','The Relief',8],
  [95,'At-Tin','التين','The Fig',8],
  [96,'Al-Alaq','العلق','The Clot',19],
  [97,'Al-Qadr','القدر','The Power',5],
  [98,'Al-Bayyinah','البينة','The Clear Proof',8],
  [99,'Az-Zalzalah','الزلزلة','The Earthquake',8],
  [100,'Al-Adiyat','العاديات','The Courser',11],
  [101,'Al-Qariah','القارعة','The Calamity',11],
  [102,'At-Takathur','التكاثر','The Rivalry in world increase',8],
  [103,'Al-Asr','العصر','The Declining Day',3],
  [104,'Al-Humazah','الهمزة','The Traducer',9],
  [105,'Al-Fil','الفيل','The Elephant',5],
  [106,'Quraysh','قريش','Quraysh',4],
  [107,'Al-Maun','الماعون','The Small Kindnesses',7],
  [108,'Al-Kawthar','الكوثر','The Abundance',3],
  [109,'Al-Kafirun','الكافرون','The Disbelievers',6],
  [110,'An-Nasr','النصر','The Divine Support',3],
  [111,'Al-Masad','المسد','The Palm Fiber',5],
  [112,'Al-Ikhlas','الإخلاص','The Sincerity',4],
  [113,'Al-Falaq','الفلق','The Daybreak',5],
  [114,'An-Nas','الناس','Mankind',6]
];

let qlCurrentSurah  = 1;
let qlCurrentReciter = 'ar.alafasy';
let qlIsPlaying     = false;
let qlFilteredList  = [...SURAHS];

function qlAudioUrl(num, reciter) {
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

function qlRenderGrid(list) {
  const grid = document.getElementById('qlGrid');
  if (!grid) return;
  grid.innerHTML = list.map(s => {
    const [num, en, ar, meaning, ayahs] = s;
    const active = num === qlCurrentSurah ? 'ql-card-active' : '';
    return `
      <div class="ql-card ${active}" id="qlCard${num}" onclick="qlPlay(${num})">
        <div class="ql-card-num">${num}</div>
        <div class="ql-card-body">
          <div class="ql-card-ar">${ar}</div>
          <div class="ql-card-en">${en}</div>
          <div class="ql-card-meta">${ayahs} ayahs · ${meaning}</div>
        </div>
        <div class="ql-card-play" id="qlCardPlay${num}">${num === qlCurrentSurah && qlIsPlaying ? '⏸' : '▶'}</div>
      </div>`;
  }).join('');
}

function qlFilterSurahs() {
  const q = (document.getElementById('qlSearch')?.value || '').toLowerCase();
  qlFilteredList = q
    ? SURAHS.filter(s => s[1].toLowerCase().includes(q) || s[2].includes(q) || s[3].toLowerCase().includes(q) || String(s[0]) === q)
    : [...SURAHS];
  qlRenderGrid(qlFilteredList);
}

function qlChangeReciter() {
  qlCurrentReciter = document.getElementById('qlReciter').value;
  const audio = document.getElementById('qlAudio');
  if (qlIsPlaying) {
    audio.src = qlAudioUrl(qlCurrentSurah, qlCurrentReciter);
    audio.play();
    qlUpdatePlayerMeta();
  }
}

function qlPlay(num) {
  qlCurrentSurah = num;
  const audio    = document.getElementById('qlAudio');
  const player   = document.getElementById('qlPlayer');

  audio.src = qlAudioUrl(num, qlCurrentReciter);
  audio.play().catch(() => {});
  qlIsPlaying = true;
  audio.onerror = () => {
    showToast('⚠️ Audio unavailable for this reciter. Try another.');
    qlIsPlaying = false;
  };

  player.style.display = 'block';
  // Add bottom padding so content isn't hidden behind player
  document.body.style.paddingBottom = '84px';

  qlUpdatePlayerMeta();
  qlRenderGrid(qlFilteredList);
  document.getElementById('qlPlayBtn').textContent = '⏸';

  // Scroll card into view
  const card = document.getElementById(`qlCard${num}`);
  if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function qlTogglePlay() {
  const audio = document.getElementById('qlAudio');
  const btn   = document.getElementById('qlPlayBtn');
  if (qlIsPlaying) { audio.pause(); qlIsPlaying = false; btn.textContent = '▶'; }
  else             { audio.play();  qlIsPlaying = true;  btn.textContent = '⏸'; }
  const cardPlay = document.getElementById(`qlCardPlay${qlCurrentSurah}`);
  if (cardPlay) cardPlay.textContent = qlIsPlaying ? '⏸' : '▶';
}

function qlPrevSurah() {
  const idx = SURAHS.findIndex(s => s[0] === qlCurrentSurah);
  if (idx > 0) qlPlay(SURAHS[idx - 1][0]);
}
function qlNextSurah() {
  const idx = SURAHS.findIndex(s => s[0] === qlCurrentSurah);
  if (idx < SURAHS.length - 1) qlPlay(SURAHS[idx + 1][0]);
}

function qlUpdatePlayerMeta() {
  const s = SURAHS.find(s => s[0] === qlCurrentSurah);
  if (!s) return;
  const reciterNames = {
    'ar.alafasy':'Mishary Rashid Alafasy',
    'ar.abdurrahmaansudais':'Abdul Rahman Al-Sudais',
    'ar.mahermuaiqly':'Maher Al-Muaiqly',
    'ar.husary':'Mahmoud Khalil Al-Husary',
    'ar.minshawi':'Muhammad Siddiq Al-Minshawi',
    'ar.saoodshuraym':'Saood Al-Shuraym'
  };
  document.getElementById('qlPlayerSurah').textContent   = `${s[0]}. ${s[1]} — ${s[2]}`;
  document.getElementById('qlPlayerReciter').textContent = reciterNames[qlCurrentReciter] || qlCurrentReciter;
}

function qlUpdateProgress() {
  const audio = document.getElementById('qlAudio');
  const fill  = document.getElementById('qlProgressFill');
  const cur   = document.getElementById('qlCurrentTime');
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  fill.style.width = pct + '%';
  cur.textContent  = qlFmtTime(audio.currentTime);
}
function qlUpdateDuration() {
  const audio = document.getElementById('qlAudio');
  document.getElementById('qlDuration').textContent = qlFmtTime(audio.duration);
}
function qlFmtTime(s) {
  if (!s || isNaN(s)) return '—';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2,'0')}`;
}
function qlSeek(e) {
  const audio = document.getElementById('qlAudio');
  const bar   = e.currentTarget;
  const pct   = e.offsetX / bar.offsetWidth;
  audio.currentTime = pct * audio.duration;
}
function qlSetVolume(v) {
  document.getElementById('qlAudio').volume = v;
}
function qlClose() {
  const audio = document.getElementById('qlAudio');
  audio.pause(); audio.src = '';
  qlIsPlaying = false;
  document.getElementById('qlPlayer').style.display = 'none';
  document.body.style.paddingBottom = '';
}

// Initialise surah grid on load
function initQuranPlayer() { qlRenderGrid(SURAHS); }

// ── QIBLA FINDER ────────────────────────────────────────
const KAABA = { lat: 21.4225, lon: 39.8262 };
let qiblaDeviceHeading = 0;
let qiblaBearing       = 0;
let qiblaWatching      = false;

function toRad(d) { return d * Math.PI / 180; }
function toDeg(r) { return r * 180 / Math.PI; }

function calcQiblaBearing(userLat, userLon) {
  const lat1 = toRad(userLat), lat2 = toRad(KAABA.lat);
  const dLon = toRad(KAABA.lon - userLon);
  const x = Math.sin(dLon) * Math.cos(lat2);
  const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (toDeg(Math.atan2(x, y)) + 360) % 360;
}

function calcDistance(lat1, lon1) {
  const R = 6371;
  const dLat = toRad(KAABA.lat - lat1);
  const dLon = toRad(KAABA.lon - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(KAABA.lat)) * Math.sin(dLon/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

function rotateNeedle(angle) {
  const needle = document.getElementById('qiblaNeedle');
  if (needle) needle.style.transform = `rotate(${angle}deg)`;
}

function findQibla() {
  const result = document.getElementById('qiblaResult');
  const btn    = document.querySelector('[onclick="findQibla()"]');
  if (btn) { btn.textContent = '📡 Detecting location…'; btn.disabled = true; }
  if (result) result.textContent = '';

  if (!navigator.geolocation) {
    if (result) result.textContent = '⚠️ Geolocation not supported by your browser.';
    if (btn) { btn.textContent = 'Find My Qibla'; btn.disabled = false; }
    return;
  }

  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    qiblaBearing  = calcQiblaBearing(lat, lon);
    const dist    = calcDistance(lat, lon);
    const dir     = bearingToCompass(qiblaBearing);
    if (result) result.innerHTML =
      `🕋 Face <strong>${Math.round(qiblaBearing)}° ${dir}</strong> · ${dist.toLocaleString()} km from Makkah`;
    if (btn) { btn.textContent = '🔄 Recalculate'; btn.disabled = false; }
    const compassWrap = document.getElementById('qiblaCompassWrap');
    if (compassWrap) compassWrap.style.display = 'flex';
    rotateNeedle(qiblaBearing);
    startDeviceCompass();
  }, err => {
    const msgs = { 1:'Location access denied — please allow location in browser settings.',
                   2:'Location unavailable. Try again.', 3:'Request timed out. Try again.' };
    if (result) result.textContent = '⚠️ ' + (msgs[err.code] || 'Could not get location.');
    if (btn) { btn.textContent = 'Find My Qibla'; btn.disabled = false; }
  }, { timeout: 10000, enableHighAccuracy: true });
}

function startDeviceCompass() {
  if (qiblaWatching) return;
  // DeviceOrientationEvent (iOS 13+ needs permission)
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission().then(state => {
      if (state === 'granted') listenCompass();
    }).catch(() => {});
  } else if (window.DeviceOrientationEvent) {
    listenCompass();
  }
}

function listenCompass() {
  qiblaWatching = true;
  window.addEventListener('deviceorientationabsolute', handleOrientation, true);
  window.addEventListener('deviceorientation', handleOrientation, true);
}

function handleOrientation(e) {
  let heading = null;
  if (e.webkitCompassHeading !== undefined) heading = e.webkitCompassHeading; // iOS
  else if (e.absolute && e.alpha !== null)   heading = 360 - e.alpha;          // Android
  if (heading === null) return;
  qiblaDeviceHeading = heading;
  // Needle should point to qiblaBearing relative to device heading
  rotateNeedle(qiblaBearing - qiblaDeviceHeading);
}

function bearingToCompass(b) {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(b / 22.5) % 16];
}

// ── AYAH OF THE DAY ─────────────────────────────────────
const TOTAL_AYAHS = 6236;
let currentAyahNum = 1;

function getTodayAyahNumber() {
  // Different ayah every day, cycles through all 6236
  const start = new Date('2024-01-01');
  const today = new Date();
  const diff  = Math.floor((today - start) / 86400000);
  return (diff % TOTAL_AYAHS) + 1;
}

async function loadAyah(num) {
  const card    = document.getElementById('ayahCard');
  const counter = document.getElementById('ayahCounter');
  card.innerHTML = '<div class="ayah-loading"><div class="hadith-spinner"></div><p>Loading Ayah…</p></div>';

  try {
    // Fetch Arabic + Urdu (Jalandhari) + English (Sahih International) in one call
    const url = `https://api.alquran.cloud/v1/ayah/${num}/editions/quran-uthmani,ur.jalandhry,en.sahih`;
    const res  = await fetch(url);
    const json = await res.json();

    if (json.code !== 200 || !json.data) throw new Error('API error');

    const arabic  = json.data[0]; // quran-uthmani
    const urdu    = json.data[1]; // ur.jalandhry
    const english = json.data[2]; // en.sahih

    const surahName = arabic.surah.englishName;
    const surahAr   = arabic.surah.name;
    const surahNo   = arabic.surah.number;
    const ayahNo    = arabic.numberInSurah;

    // WhatsApp share text
    const shareText = encodeURIComponent(
      `📖 Ayah of the Day\n\n${arabic.text}\n\n🇬🇧 ${english.text}\n\n📍 Surah ${surahName} (${surahNo}:${ayahNo})\n\n🕌 Al-Falah Islamic Academy`
    );

    counter.textContent = `Ayah ${num} of ${TOTAL_AYAHS}`;

    card.innerHTML = `
      <div class="ayah-surah-tag">
        <span class="ayah-surah-ar">${surahAr}</span>
        <span class="ayah-surah-sep">·</span>
        <span>Surah ${surahName}</span>
        <span class="ayah-ref-badge">${surahNo} : ${ayahNo}</span>
      </div>

      <div class="ayah-arabic">${arabic.text}</div>

      <div class="ayah-divider"></div>

      <div class="ayah-urdu" dir="rtl">${urdu.text}</div>

      <div class="ayah-english">${english.text}</div>

      <div class="ayah-actions">
        <a href="https://wa.me/?text=${shareText}"
           target="_blank" rel="noopener" class="ayah-share-btn whatsapp-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Share on WhatsApp
        </a>
        <button class="ayah-copy-btn" onclick="copyAyah('${arabic.text.replace(/'/g,"\\'")}', '${english.text.replace(/'/g,"\\'")}', 'Surah ${surahName} ${surahNo}:${ayahNo}')">
          📋 Copy Ayah
        </button>
      </div>
    `;
  } catch(e) {
    card.innerHTML = `
      <div class="ayah-error">
        <p>⚠️ Could not load ayah. Please check your internet connection.</p>
        <button class="ayah-btn" onclick="loadAyah(${num})" style="margin-top:12px">Try Again</button>
      </div>`;
    if (counter) counter.textContent = '';
  }
}

function changeAyah(dir) {
  currentAyahNum = ((currentAyahNum - 1 + dir + TOTAL_AYAHS) % TOTAL_AYAHS) + 1;
  loadAyah(currentAyahNum);
}

function copyAyah(arabic, english, ref) {
  const text = `📖 ${arabic}\n\n${english}\n\n📍 ${ref}\n🕌 Al-Falah Islamic Academy`;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.ayah-copy-btn');
    if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => btn.textContent = '📋 Copy Ayah', 2000); }
  });
}

// ── AZAN / PRAYER TIMES ─────────────────────────────────
const PRAYER_NAMES = [
  { key: 'Fajr',    label: 'فجر',    eng: 'Fajr',    icon: '🌅' },
  { key: 'Sunrise', label: 'طلوع',   eng: 'Sunrise', icon: '☀️' },
  { key: 'Dhuhr',   label: 'ظہر',    eng: 'Dhuhr',   icon: '🌤️' },
  { key: 'Asr',     label: 'عصر',    eng: 'Asr',     icon: '🌇' },
  { key: 'Maghrib', label: 'مغرب',   eng: 'Maghrib', icon: '🌆' },
  { key: 'Isha',    label: 'عشاء',   eng: 'Isha',    icon: '🌙' },
];

async function loadAzan() {
  const grid = document.getElementById('azanGrid');
  const city = document.getElementById('azanCity').value;
  grid.innerHTML = '<div class="azan-loading"><div class="hadith-spinner"></div><p>Fetching prayer times…</p></div>';

  try {
    const today = new Date();
    const d = today.getDate(), m = today.getMonth() + 1, y = today.getFullYear();
    // AlAdhan API — method 1 = University of Islamic Sciences, Karachi (Hanafi)
    const url = `https://api.aladhan.com/v1/timingsByCity/${d}-${m}-${y}?city=${encodeURIComponent(city)}&country=Pakistan&method=1&school=1`;
    const res  = await fetch(url);
    const json = await res.json();

    if (json.code !== 200) throw new Error('API error');

    const timings = json.data.timings;
    const dateInfo = json.data.date;

    // Hijri date in proper English. Pakistan's moon-sighting runs ~1 day
    // behind the Umm al-Qura calendar the API uses, so shift by -1 day.
    const HMONTHS = ['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Jumada al-Awwal','Jumada al-Thani','Rajab',"Sha'ban",'Ramadan','Shawwal',"Dhul-Qa'dah",'Dhul-Hijjah'];
    let hijriStr;
    try {
      const pk = new Date(); pk.setDate(pk.getDate() - 1);
      const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura',
        { day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(pk);
      const gv = t => (parts.find(p => p.type === t) || {}).value;
      hijriStr = `${gv('day')} ${HMONTHS[(+gv('month')) - 1]} ${gv('year')} AH`;
    } catch (e) {
      const h = dateInfo.hijri;
      hijriStr = `${h.day} ${HMONTHS[(+h.month.number) - 1] || h.month.en} ${h.year} AH`;
    }
    document.getElementById('azanDateDisplay').textContent =
      `${hijriStr} · ${dateInfo.readable}`;

    // Determine next prayer
    const nowMins = today.getHours() * 60 + today.getMinutes();
    let nextPrayer = null;
    for (const p of PRAYER_NAMES) {
      if (p.key === 'Sunrise') continue; // skip sunrise for "next prayer"
      const [h, min] = (timings[p.key] || '00:00').split(':').map(Number);
      if ((h * 60 + min) > nowMins) { nextPrayer = p.key; break; }
    }
    if (!nextPrayer) nextPrayer = 'Fajr'; // after Isha, next is Fajr tomorrow

    const nextBadge = document.getElementById('azanNextUp');
    if (nextBadge) {
      const np = PRAYER_NAMES.find(p => p.key === nextPrayer);
      nextBadge.textContent = np ? `⏰ Next: ${np.icon} ${np.eng} (${timings[nextPrayer]})` : '';
    }

    // Render grid
    grid.innerHTML = PRAYER_NAMES.map(p => {
      const time = timings[p.key] || '—';
      const isNext = p.key === nextPrayer;
      const [ph, pm] = time.split(':').map(Number);
      const isPast   = (ph * 60 + pm) < nowMins && p.key !== 'Fajr';
      return `
        <div class="azan-card ${isNext ? 'azan-next' : ''} ${isPast ? 'azan-past' : ''}">
          <div class="azan-card-icon">${p.icon}</div>
          <div class="azan-card-arabic">${p.label}</div>
          <div class="azan-card-eng">${p.eng}</div>
          <div class="azan-card-time">${formatTime12(time)}</div>
          ${isNext ? '<div class="azan-next-tag">Next Prayer</div>' : ''}
        </div>`;
    }).join('');

  } catch(e) {
    grid.innerHTML = `<div class="azan-error">⚠️ Could not load prayer times. Please check your internet connection and refresh.</div>`;
  }
}

function formatTime12(t) {
  if (!t || t === '—') return '—';
  let [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2,'0')} ${ampm}`;
}

// ── ISLAMIC CALENDAR ────────────────────────────────────
function loadIslamicCalendar() {
  const now = new Date();

  // Gregorian date display
  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayName  = days[now.getDay()];
  const gregDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  // Islamic (Hijri) date via Intl API (built into modern browsers)
  let hijriStr = '';
  try {
    const hijri = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(now);
    hijriStr = hijri;
  } catch(e) {
    // Fallback approximate calculation
    const jd = Math.floor((now.getTime() / 86400000) + 2440587.5);
    const l  = jd - 1948440 + 10632;
    const n  = Math.floor((l - 1) / 10631);
    const ll = l - 10631 * n + 354;
    const j  = Math.floor((10985 - ll) / 5316) * Math.floor((50 * ll) / 17719)
              + Math.floor(ll / 5670) * Math.floor((43 * ll) / 15238);
    const ll2 = ll - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
               - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
    const m  = Math.floor((24 * ll2) / 709);
    const d  = ll2 - Math.floor((709 * m) / 24);
    const y  = 30 * n + j - 30;
    const hijriMonths = ['Muharram','Safar','Rabi I','Rabi II','Jumada I','Jumada II',
                         'Rajab','Sha\'ban','Ramadan','Shawwal','Dhul Qi\'dah','Dhul Hijjah'];
    hijriStr = `${d} ${hijriMonths[m-1]} ${y} AH`;
  }

  document.getElementById('icalHijri').textContent     = '🌙 ' + hijriStr;
  document.getElementById('icalGregorian').textContent = '📅 ' + gregDate;
  document.getElementById('icalDay').textContent       = '⏰ ' + dayName;

  // Highlight Friday
  if (now.getDay() === 5) {
    document.getElementById('islamicCalBar').classList.add('friday-bar');
    document.getElementById('icalDay').textContent = '⏰ ' + dayName + ' — یوم الجمعہ مبارک';
  }
}

// ══════════════════════════════════════════════════════════
// DARS VIDEOS — ADD NEW VIDEOS HERE
// To add a video: copy a YouTube URL like https://www.youtube.com/watch?v=XXXXXXXXXXX
// Extract the video ID (the part after v=) and add a new object below.
// Set youtube: '' (empty string) to show as Coming Soon card instead.
// ══════════════════════════════════════════════════════════
const DARS_VIDEOS = {
  quran: [
    {
      ep: 1,
      title: 'Surah Al-Fatihah — تفسیر و فضائل',
      desc: 'Detailed explanation of Surah Al-Fatihah — its virtues, meaning, and role as the opening of every prayer.',
      scholar: 'Dr. Muhammad Naeem',
      youtube: '',   // ← paste YouTube video ID here e.g. 'dQw4w9WgXcQ'
      date: '',
      duration: ''
    },
    {
      ep: 2,
      title: 'Surah Al-Baqarah — آیت الکرسی',
      desc: 'Tafsir and virtues of Ayat al-Kursi — the greatest ayah in the Quran. Its meaning, benefits and daily recitation.',
      scholar: 'Dr. Muhammad Naeem',
      youtube: '',
      date: '',
      duration: ''
    },
    {
      ep: 3,
      title: 'Surah Al-Kahf — جمعہ کی فضیلت',
      desc: 'Why Surah Al-Kahf is recited every Friday — its stories, lessons and protection from Dajjal.',
      scholar: 'Dr. Muhammad Naeem',
      youtube: '',
      date: '',
      duration: ''
    }
  ],
  hadith: [
    {
      ep: 1,
      title: 'اربعین نووی — Forty Hadith',
      desc: 'Explanation of Imam al-Nawawi\'s 40 most important Hadith — a foundation for every Muslim.',
      scholar: 'Dr. Muhammad Naeem',
      youtube: '',
      date: '',
      duration: ''
    },
    {
      ep: 2,
      title: 'Sahih al-Bukhari — Introduction',
      desc: 'Introduction to the most authentic Hadith collection — its author, methodology, and importance.',
      scholar: 'Dr. Muhammad Naeem',
      youtube: '',
      date: '',
      duration: ''
    },
    {
      ep: 3,
      title: 'Riyad us-Saliheen — Daily Hadith',
      desc: 'Gardens of the Righteous — selected Hadiths for daily spiritual practice and character building.',
      scholar: 'Dr. Muhammad Naeem',
      youtube: '',
      date: '',
      duration: ''
    }
  ]
};

// ── DARS RENDERING ──────────────────────────────────────
function renderDars(type) {
  const panel = document.getElementById(type === 'quran' ? 'darsQuran' : 'darsHadith');
  if (!panel) return;
  const videos = DARS_VIDEOS[type] || [];
  const countEl = document.getElementById(type === 'quran' ? 'countQuran' : 'countHadith');
  const liveCount = videos.filter(v => v.youtube).length;
  if (countEl) countEl.textContent = liveCount ? `${liveCount}` : '';

  if (!videos.length) { panel.innerHTML = '<p style="color:#888;text-align:center;padding:40px">No videos yet</p>'; return; }

  panel.innerHTML = `<div class="dars-grid">${videos.map(v => `
    <div class="dars-card ${v.youtube ? '' : 'dars-coming-soon'}">
      <div class="dars-thumb ${v.youtube ? '' : 'dars-thumb-placeholder'}">
        ${v.youtube
          ? `<img src="https://img.youtube.com/vi/${v.youtube}/mqdefault.jpg" alt="${v.title}" loading="lazy" /><button class="dars-play-btn" onclick="openDarsModal('${v.youtube}','${v.title.replace(/'/g,"\\'")}')">▶</button>`
          : `<div class="dars-soon-icon">📹</div><div class="dars-soon-label">Coming Soon</div>`}
      </div>
      <div class="dars-info">
        <div class="dars-ep-badge">Ep ${v.ep}</div>
        <h3 class="dars-title">${v.title}</h3>
        <p class="dars-desc">${v.desc}</p>
        <div class="dars-meta">
          <span>👨‍🏫 ${v.scholar}</span>
          ${v.date ? `<span>📅 ${v.date}</span>` : ''}
          ${v.duration ? `<span>⏱ ${v.duration}</span>` : ''}
        </div>
        ${v.youtube
          ? `<button class="dars-watch-btn" onclick="openDarsModal('${v.youtube}','${v.title.replace(/'/g,"\\'")}')">▶ Watch Now</button>`
          : `<button class="dars-watch-btn dars-watch-soon" disabled>🔔 Coming Soon</button>`}
      </div>
    </div>
  `).join('')}</div>`;
}

function openDarsModal(ytId, title) {
  document.getElementById('darsModalTitle').textContent = title;
  document.getElementById('darsModalPlayer').innerHTML =
    `<iframe width="100%" height="360" src="https://www.youtube.com/embed/${ytId}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  document.getElementById('darsModal').style.display = 'flex';
}

function closeDarsModal(e) {
  if (e && e.target !== document.getElementById('darsModal') && !e.target.classList.contains('dars-modal-close')) return;
  document.getElementById('darsModal').style.display = 'none';
  document.getElementById('darsModalPlayer').innerHTML = '';
}

function switchDars(type, btn) {
  document.querySelectorAll('.dars-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('darsQuran').style.display  = type === 'quran'  ? '' : 'none';
  document.getElementById('darsHadith').style.display = type === 'hadith' ? '' : 'none';
}

// ══════════════════════════════════════════════════════════
// PAGE INIT — runs once DOM is ready
// ══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {

  // Navbar scroll shadow
  const navbar = document.getElementById('navbar');
  if (navbar) window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  });

  // Hero slider (home only)
  if (document.querySelector('.hero-slider')) initHeroSlider();

  // Widgets — only run where their section exists on this page
  if (document.getElementById('azanGrid')) loadAzan();
  if (document.getElementById('hadithCard')) { currentHadithIdx = getTodayHadithIndex(); renderHadith(currentHadithIdx); }
  if (document.getElementById('ayahCard')) { currentAyahNum = getTodayAyahNumber(); loadAyah(currentAyahNum); }

  // Below-fold — defer until section scrolls within 300 px of the viewport
  function lazyInit(sectionId, fn) {
    const el = document.getElementById(sectionId);
    if (!el) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { obs.disconnect(); fn(); }
    }, { rootMargin: '300px' });
    obs.observe(el);
  }

  lazyInit('books',        loadBooks);
  lazyInit('dars',         () => { renderDars('quran'); renderDars('hadith'); });
  lazyInit('quran-listen', initQuranPlayer);

});

// ── HERO SLIDER (moving pictures) ────────────────────
function initHeroSlider(){
  const slides=[...document.querySelectorAll('.hero-slide')];
  const dots=[...document.querySelectorAll('.hero-dot')];
  if(slides.length<2) return;
  let i=0,timer;
  function show(n){
    i=(n+slides.length)%slides.length;
    slides.forEach((s,k)=>s.classList.toggle('is-active',k===i));
    dots.forEach((d,k)=>d.classList.toggle('active',k===i));
  }
  function start(){timer=setInterval(()=>show(i+1),5000);}
  function restart(){clearInterval(timer);start();}
  dots.forEach((d,k)=>d.addEventListener('click',()=>{show(k);restart();}));
  show(0);start();
}
