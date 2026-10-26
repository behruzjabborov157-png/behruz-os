'use strict';
/* BEHRUZ OS — hisob-kitoblar: odatlar, ball, XP, namoz vaqtlari, GPA, takrorlash, maosh */

const PRAYERS = [['fajr', 'Bomdod'], ['dhuhr', 'Peshin'], ['asr', 'Asr'], ['maghrib', 'Shom'], ['isha', 'Xufton']];
const PRAYER_ST = { on: 'Oʻz vaqtida', late: 'Kechikib', qaza: 'Qazo qilindi', miss: 'Oʻqilmadi' };

/* ---------- Kunlik koʻrsatkichlar ---------- */
function prayersDone(date) { const p = day(date).prayers || {}; return PRAYERS.filter(([k]) => ['on', 'late', 'qaza'].includes(p[k])).length; }
function prayersMarked(date) { const p = day(date).prayers || {}; return PRAYERS.filter(([k]) => p[k]).length; }
function isLight(date) { const d = day(date); return !!(d.light || d.minimal); }
function langTarget(lang, date) {
  const s = S(), light = isLight(date);
  return lang === 'ko' ? { words: light ? s.koWordsLight : s.koWords, min: light ? s.koMinLight : s.koMin }
    : { words: light ? s.enWordsLight : s.enWords, min: light ? s.enMinLight : s.enMin };
}
function wordsAdded(lang, date) { return D('vocab-' + lang).list.filter(w => w.added === date).length; }
function wordsReviewed(lang, date) { return ((day(date).vr || {})[lang]) || 0; }
function langMinutes(lang, date) { return sum(inMonth('lang', monthKey(date)).filter(l => l.date === date && l.lang === lang), l => l.min); }
function langMet(lang, date) {
  const t = langTarget(lang, date);
  const w = wordsAdded(lang, date) + wordsReviewed(lang, date), m = langMinutes(lang, date);
  if (!w && !m) return null;
  return (t.words && w >= t.words) || (t.min && m >= t.min) ? 1 : 0;
}
function sleepOf(date) { return day(date).sleep || null; }
function sleepDur(sl) { if (!sl || !sl.bed || !sl.wake) return null; let b = tmin(sl.bed), w = tmin(sl.wake); let d = w - b; if (d <= 0) d += 1440; return d; }
/* uxlash vaqtini oʻqish: 18:00 dan keyingi = shu kecha, undan oldin = yarim tundan keyin */
function bedLate(bed) { const b = tmin(bed), t = tmin(S().sleep); const nb = b < 720 ? b + 1440 : b, nt = t < 720 ? t + 1440 : t; return nb - nt; }
function sleptOnTime(date) { const sl = sleepOf(date); if (!sl || !sl.bed) return null; return bedLate(sl.bed) <= 15 ? 1 : 0; }
function wokeOnTime(date) { const sl = sleepOf(date); if (!sl || !sl.wake) return null; return tmin(sl.wake) - tmin(S().wake) <= 15 ? 1 : 0; }
function classesToday(date) { const d = dow(date); return D('courses').list.flatMap(c => (c.sessions || []).filter(s => +s.d === d).map(s => ({ c, s }))); }
function attendanceOn(date) { return D('attendance').recs.filter(r => r.date === date); }
function classesStatus(date) {
  const recs = attendanceOn(date);
  if (!recs.length) return null;
  return recs.some(r => r.st === 'a') ? 0 : 1;
}
function tasksOn(date) { return D('tasks').list.filter(t => occursOn(t, date)); }
function tasksStatus(date) { const l = tasksOn(date); if (!l.length) return null; return l.every(t => isDone(t, date)) ? 1 : (date < today() ? 0 : null); }
function exerciseStatus(date) { const d = day(date); if (inMonth('workouts', monthKey(date)).some(w => w.date === date) || (d.walk || 0) >= 20) return 1; return d.rest ? 1 : (date < today() && (d.walk !== undefined) ? 0 : null); }
function waterStatus(date) { const w = day(date).water; if (w === undefined) return null; return w >= S().water ? 1 : (date < today() ? 0 : null); }
function socialStatus(date) { const d = day(date); if (d.social === undefined && d.scroll === undefined) return null; return (d.social || 0) + (d.scroll || 0) <= S().socialLimit ? 1 : 0; }
function gamingStatus(date) { const d = day(date); if (d.gaming === undefined) return null; return d.gaming <= S().gamingLimit ? 1 : 0; }
function quranStatus(date) { const q = day(date).quran; if (q === undefined) return null; return q > 0 ? 1 : 0; }
function prayerStatus(date) { if (!prayersMarked(date)) return null; return prayersDone(date) === 5 ? 1 : (prayersMarked(date) === 5 || date < today() ? 0 : null); }
function impulseStatus(date) { return allM('tx').some(t => t.date === date && t.impulse) ? 0 : null; }

const LINKS = {
  wake: ['Uygʻonish vaqti', wokeOnTime], sleep: ['Uxlash vaqti', sleptOnTime], prayers: ['5 vaqt namoz', prayerStatus],
  quran: ['Qurʼon sahifalari', quranStatus], classes: ['Davomat', classesStatus], ko: ['Koreys maqsadi', d => langMet('ko', d)],
  en: ['Ingliz maqsadi', d => langMet('en', d)], exercise: ['Mashq yoki yurish', exerciseStatus], water: ['Suv', waterStatus],
  social: ['Ijtimoiy tarmoq chegarasi', socialStatus], gaming: ['Oʻyin chegarasi', gamingStatus], impulse: ['Impuls xaridlar', impulseStatus],
  tasks: ['Bugungi vazifalar', tasksStatus], review: ['Kun sharhi', d => day(d).reviewed ? 1 : null]
};

/* ---------- Odatlar ---------- */
function habitScheduled(h, date) {
  if (date < (h.created || '0000')) return false;
  if (h.archivedAt && date >= h.archivedAt) return false;
  if (!(h.days || []).includes(dow(date))) return false;
  if (h.link === 'classes' && !classesToday(date).length) return false;
  return true;
}
function habitManual(h, date) { const v = (day(date).h || {})[h.id]; return v === undefined ? undefined : v; }
function habitStatus(h, date) {
  const m = habitManual(h, date);
  if (m !== undefined) return m;
  if (h.link && LINKS[h.link]) { const v = LINKS[h.link][1](date); if (v !== null) return v; }
  return undefined;
}
/* minimal kunda minimal roʻyxatga kirmagan odat "oʻtkazib yuborilgan" hisoblanmaydi */
function habitCounted(h, date) { return habitScheduled(h, date) && !(day(date).minimal && !h.core); }
function habitStreak(h) {
  let streak = 0, best = 0, run = 0, miss = 0, cur = null;
  const t = today();
  let d = t;
  const start = h.created || S().startDate;
  // joriy seriya: ketma-ket ikki marta oʻtkazmaslik qoidasi
  while (d >= start) {
    if (habitCounted(h, d)) {
      const st = habitStatus(h, d);
      if (st === 1) { streak++; miss = 0; }
      else if (d === t && st === undefined) { /* bugun hali oldinda */ }
      else { miss++; if (miss >= 2) break; }
    }
    d = addDays(d, -1);
    if (daysBetween(d, t) > 400) break;
  }
  cur = streak;
  // eng yaxshi seriya (oddiy ketma-ketlik)
  for (const x of dateRange(start > addDays(t, -365) ? start : addDays(t, -365), t)) {
    if (!habitCounted(h, x)) continue;
    if (habitStatus(h, x) === 1) { run++; best = Math.max(best, run); } else if (x !== t) run = 0;
  }
  return { cur, best };
}
function habitRate(h, n = 30) {
  const t = today(); let done = 0, total = 0;
  for (const d of lastN(n)) {
    if (!habitCounted(h, d)) continue;
    const st = habitStatus(h, d);
    if (d === t && st === undefined) continue;
    total++; if (st === 1) done++;
  }
  return { done, total, p: total ? done / total : null };
}
function activeHabits() { return sortBy(D('habits').list.filter(h => !h.archivedAt), h => h.order ?? 0); }
function habitsOn(date) { return D('habits').list.filter(h => habitCounted(h, date)); }
function habitsDayRatio(date) { const l = habitsOn(date); if (!l.length) return null; const done = l.filter(h => habitStatus(h, date) === 1).length; return done / l.length; }

/* ---------- Vazifalar ---------- */
function occursOn(t, date) {
  if (!t.recur || t.recur === 'none') return t.due === date;
  if (!t.due || date < t.due) return false;
  if (t.until && date > t.until) return false;
  const d = dow(date);
  if (t.recur === 'daily') return true;
  if (t.recur === 'weekdays') return d >= 1 && d <= 5;
  if (t.recur === 'weekly') return d === dow(t.due);
  if (t.recur === 'monthly') return date.slice(8) === t.due.slice(8);
  return false;
}
function isDone(t, date) { return (!t.recur || t.recur === 'none') ? !!t.done : (t.doneDates || []).includes(date); }
function overdueTasks() { const t = today(); return D('tasks').list.filter(x => (!x.recur || x.recur === 'none') && x.due && x.due < t && !x.done); }

/* ---------- Kunlik ball (0–100) ---------- */
function dayScore(date) {
  const parts = [];
  const hr = habitsDayRatio(date); if (hr !== null) parts.push([30, hr]);
  if (S().prayers && prayersMarked(date)) parts.push([25, prayersDone(date) / 5]);
  const mis = day(date).mission || []; if (mis.length) parts.push([20, mis.filter(m => m.done).length / mis.length]);
  const att = attendanceOn(date); if (att.length) parts.push([15, att.filter(r => r.st !== 'a').length / att.length]);
  const so = sleptOnTime(date); if (so !== null) parts.push([10, so]);
  if (!parts.length) return null;
  let sc = Math.round(sum(parts, p => p[0] * p[1]) / sum(parts, p => p[0]) * 100);
  const d = day(date);
  if (d.minimal) { const mn = S().minimum; if (mn.length && mn.every(m => (d.minDone || {})[m.id])) sc = Math.max(sc, 60); }
  return sc;
}

/* ---------- XP va darajalar ----------
   Qoidalar: kuniga eng koʻpi 250 XP; yarim tundan keyin (00:30–05:00) bajarilgan vazifa XP bermaydi;
   vaqtida uxlash bonus beradi; yomon kundan keyingi yaxshi kun "qaytish" bonusi beradi. */
function dayXP(date) {
  const d = day(date);
  let xp = 0;
  xp += D('habits').list.filter(h => habitCounted(h, date) && habitStatus(h, date) === 1).length * 5;
  xp += (d.mission || []).filter(m => m.done).length * 10;
  const late = tmin(S().lateNight || '00:30');
  const tasksDone = D('tasks').list.filter(t => {
    if (t.recur && t.recur !== 'none') return (t.doneDates || []).includes(date);
    return t.done && t.doneAt && t.doneAt.slice(0, 10) === date && !(tmin(t.doneAt.slice(11, 16)) >= late && tmin(t.doneAt.slice(11, 16)) < 300);
  }).length;
  xp += Math.min(tasksDone, 10) * 8;
  xp += prayersDone(date) * 6;
  xp += attendanceOn(date).filter(r => r.st === 'p' || r.st === 'l').length * 10;
  xp += Math.min(wordsAdded('ko', date) + wordsAdded('en', date), 20);
  xp += Math.min(Math.floor((wordsReviewed('ko', date) + wordsReviewed('en', date)) / 2), 15);
  if (sleptOnTime(date) === 1) xp += 20;
  if (d.reviewed) xp += 10;
  if (d.minimal && S().minimum.length && S().minimum.every(m => (d.minDone || {})[m.id])) xp += 25;
  const prev = dayScore(addDays(date, -1)), cur = dayScore(date);
  if (prev !== null && prev < 30 && cur !== null && cur >= 50) xp += 30;
  return Math.min(xp, 250);
}
let XP_CACHE = { key: '', val: 0 };
function totalXP() {
  const key = Store.ver + ':' + Object.keys(Store.docs).length;
  if (XP_CACHE.key === key && XP_CACHE.t === today()) return XP_CACHE.val;
  let xp = 0;
  const start = S().startDate || today();
  for (const d of dateRange(start < addDays(today(), -730) ? addDays(today(), -730) : start, today())) xp += dayXP(d);
  XP_CACHE = { key, val: xp, t: today() };
  return xp;
}
function levelOf(xp) {
  let level = 1; while (75 * level * (level + 1) <= xp) level++;
  const base = 75 * (level - 1) * level, next = 75 * level * (level + 1);
  return { level, into: xp - base, need: next - base, xp };
}

/* ---------- Namoz vaqtlari (astronomik hisob, praytimes.org usuli) ---------- */
const PT_METHODS = {
  MWL: { name: 'Muslim World League', fajr: 18, isha: 17 },
  ISNA: { name: 'ISNA (Shimoliy Amerika)', fajr: 15, isha: 15 },
  Egypt: { name: 'Misr', fajr: 19.5, isha: 17.5 },
  Makkah: { name: 'Umm al-Quro (Makka)', fajr: 18.5, isha: '90' },
  Karachi: { name: 'Karachi', fajr: 18, isha: 18 }
};
function prayerTimes(date, lat, lng, methodKey = 'MWL', asrMode = 'hanafi') {
  const dtr = d => d * Math.PI / 180, rtd = r => r * 180 / Math.PI;
  const sin = d => Math.sin(dtr(d)), cos = d => Math.cos(dtr(d)), tan = d => Math.tan(dtr(d));
  const arcsin = x => rtd(Math.asin(x)), arccos = x => rtd(Math.acos(x)), arctan2 = (y, x) => rtd(Math.atan2(y, x)), arccot = x => rtd(Math.atan(1 / x));
  const fix = (a, b) => { a = a - b * Math.floor(a / b); return a < 0 ? a + b : a; };
  const [Y, Mo, Da] = date.split('-').map(Number);
  const julian = (y, m, d) => { if (m <= 2) { y -= 1; m += 12; } const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4); return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5; };
  const jDate = julian(Y, Mo, Da) - lng / (15 * 24);
  const sunPos = jd => {
    const Dd = jd - 2451545.0, g = fix(357.529 + 0.98560028 * Dd, 360), q = fix(280.459 + 0.98564736 * Dd, 360);
    const L = fix(q + 1.915 * sin(g) + 0.020 * sin(2 * g), 360), e = 23.439 - 0.00000036 * Dd;
    const RA = fix(arctan2(cos(e) * sin(L), cos(L)) / 15, 24);
    return { decl: arcsin(sin(e) * sin(L)), eqt: q / 15 - RA };
  };
  const midDay = t => fix(12 - sunPos(jDate + t).eqt, 24);
  const angleTime = (angle, t, ccw) => {
    const decl = sunPos(jDate + t).decl, noon = midDay(t);
    const v = (-sin(angle) - sin(decl) * sin(lat)) / (cos(decl) * cos(lat));
    if (v < -1 || v > 1) return NaN;
    const tt = arccos(v) / 15;
    return noon + (ccw ? -tt : tt);
  };
  const m = PT_METHODS[methodKey] || PT_METHODS.MWL;
  const factor = asrMode === 'hanafi' ? 2 : 1;
  const asrT = t => { const decl = sunPos(jDate + t).decl; return angleTime(-arccot(factor + tan(Math.abs(lat - decl))), t); };
  let T = { fajr: angleTime(m.fajr, 5 / 24, true), sunrise: angleTime(0.833, 6 / 24, true), dhuhr: midDay(12 / 24), asr: asrT(13 / 24), sunset: angleTime(0.833, 18 / 24), isha: 0 };
  T.maghrib = T.sunset;
  T.isha = typeof m.isha === 'string' ? T.maghrib + (+m.isha) / 60 : angleTime(m.isha, 18 / 24);
  const tz = -parseD(date).getTimezoneOffset() / 60;
  const out = {};
  for (const k in T) { const h = T[k] + tz - lng / 15; out[k] = isFinite(h) ? mtime(Math.round(fix(h, 24) * 60)) : ''; }
  return out;
}
function prayerTimesFor(date) {
  const s = S();
  if (s.prayerCalc && s.prayerCalc.on && s.prayerCalc.lat !== '' && s.prayerCalc.lng !== '') {
    return { src: 'calc', t: prayerTimes(date, +s.prayerCalc.lat, +s.prayerCalc.lng, s.prayerCalc.method, s.prayerCalc.asr) };
  }
  const man = s.prayerManual || {};
  if (PRAYERS.some(([k]) => man[k])) return { src: 'manual', t: man };
  return null;
}

/* ---------- GPA ---------- */
function gradePoint(g) { const r = (S().gradeMap || []).find(x => x[0] === g); return r ? r[1] : null; }
function gpaOf(rows) {
  const counted = rows.filter(r => r.grade && gradePoint(r.grade) !== null && num(r.credits) > 0);
  const cr = sum(counted, r => num(r.credits));
  return { gpa: cr ? sum(counted, r => gradePoint(r.grade) * num(r.credits)) / cr : null, credits: cr, total: sum(rows, r => num(r.credits)) };
}
function courseScore(c) {
  const items = D('academic').items.filter(i => i.courseId === c.id && i.score !== null && i.score !== undefined && i.score !== '' && num(i.max) > 0);
  if (!items.length) return null;
  const wsum = sum(items, i => num(i.weight) || 1);
  return sum(items, i => (num(i.score) / num(i.max)) * (num(i.weight) || 1)) / wsum * 100;
}
function attendanceStats(c) {
  const recs = D('attendance').recs.filter(r => r.c === c.id);
  const p = recs.filter(r => r.st === 'p').length, l = recs.filter(r => r.st === 'l').length, a = recs.filter(r => r.st === 'a').length, e = recs.filter(r => r.st === 'e').length;
  const counted = p + l + a;
  const r = c.rules || {};
  const effAbs = a + (num(r.lateAs) > 0 ? Math.floor(l / num(r.lateAs)) : 0);
  const pctv = counted ? (counted - effAbs) / counted * 100 : null;
  let level = 'ok', why = [];
  if (r.minPct && pctv !== null) { if (pctv < r.minPct) { level = 'bad'; why.push(`Davomat ${Math.round(pctv)}% — siz belgilagan ${r.minPct}% dan past`); } else if (pctv < r.minPct + 5) { level = 'warn'; why.push(`Davomat ${Math.round(pctv)}% — chegaraga yaqin (${r.minPct}%)`); } }
  if (r.maxAbs) { if (effAbs >= r.maxAbs) { level = 'bad'; why.push(`${effAbs} ta qoldirish — chegara ${r.maxAbs}`); } else if (effAbs >= r.maxAbs - 1) { if (level !== 'bad') level = 'warn'; why.push(`Yana 1 ta qoldirish chegaraga yetkazadi (${r.maxAbs})`); } }
  const sc = courseScore(c);
  if (c.target && sc !== null && sc < c.target) { if (level === 'ok') level = 'warn'; why.push(`Joriy ball ${Math.round(sc)}% — maqsad ${c.target}%`); }
  return { p, l, a, e, total: recs.length, effAbs, pct: pctv, level, why, score: sc };
}
function dueLevel(due) { if (!due) return ''; const n = daysBetween(today(), due); return n < 0 ? 'bad' : n <= 2 ? 'warn' : n <= 7 ? 'mid' : ''; }
function dueText(due) { if (!due) return 'Muddat yoʻq'; const n = daysBetween(today(), due); return n < 0 ? `${-n} kun oʻtib ketdi` : n === 0 ? 'Bugun' : n === 1 ? 'Ertaga' : `${n} kundan keyin`; }

/* ---------- Takrorlash (Leitner qutilari) ---------- */
const SRS_DAYS = [0, 1, 3, 7, 14, 30, 60];
function dueWords(lang) { const t = today(); return D('vocab-' + lang).list.filter(w => (w.due || w.added || t) <= t); }

/* ---------- Ish haqi ---------- */
function shiftMin(s) { if (!s.s || !s.e) return 0; let d = tmin(s.e) - tmin(s.s); if (d <= 0) d += 1440; return Math.max(0, d - (num(s.brk) || 0)); }
function monthPay(mk) {
  const job = D('work').job, wage = num(job.wage);
  const shifts = inMonth('shifts', mk).filter(s => s.st !== 'absent' && s.st !== 'planned');
  const planned = inMonth('shifts', mk).filter(s => s.st === 'planned');
  const min = sum(shifts, shiftMin), plannedMin = sum(planned, shiftMin);
  const base = sum(shifts, s => shiftMin(s) / 60 * (num(s.wage) || wage));
  let juhyu = 0;
  if (job.juhyu) {
    const weeks = {};
    shifts.forEach(s => { const w = weekStart(s.date); weeks[w] = (weeks[w] || 0) + shiftMin(s) / 60; });
    for (const w in weeks) if (weeks[w] >= 15) juhyu += Math.min(weeks[w], 40) / 40 * 8 * wage;
  }
  const gross = base + juhyu, tax = gross * (num(job.tax) / 100);
  return { min, plannedMin, base, juhyu, gross, tax, net: gross - tax, plannedPay: plannedMin / 60 * wage, count: shifts.length };
}

/* ---------- Pul ---------- */
const OUT_CATS = ['Ijara', 'Kontrakt (tuition)', 'Transport', 'Ovqat', 'Telefon', 'Kommunal', 'Kiyim', 'Oʻyin / skinlar', 'Sogʻliq', 'Taʼlim', 'Oilaga yordam', 'Sadaqa', 'Boshqa'];
const IN_CATS = ['Ish haqi', 'Stipendiya', 'Oiladan', 'Boshqa daromad'];
function monthMoney(mk) {
  const tx = inMonth('tx', mk);
  const inc = sum(tx.filter(t => t.type === 'in'), t => t.amt), out = sum(tx.filter(t => t.type === 'out'), t => t.amt);
  const byCat = {}; tx.filter(t => t.type === 'out').forEach(t => byCat[t.cat] = (byCat[t.cat] || 0) + num(t.amt));
  const impulse = sum(tx.filter(t => t.type === 'out' && (t.impulse || t.cat === 'Oʻyin / skinlar')), t => t.amt);
  const earned = sum(tx.filter(t => t.type === 'in' && t.cat === 'Ish haqi'), t => t.amt);
  return { inc, out, saved: inc - out, byCat, impulse, earned, count: tx.length };
}
function avgMonthly(n = 3) {
  const cur = monthKey(today());
  const mks = [1, 2, 3, 4, 5, 6].slice(0, n).map(i => addMonths(cur, -i)).filter(mk => inMonth('tx', mk).length);
  const use = mks.length ? mks : (inMonth('tx', cur).length ? [cur] : []);
  if (!use.length) return null;
  const ms = use.map(monthMoney);
  return { out: avg(ms.map(m => m.out)), inc: avg(ms.map(m => m.inc)), earned: avg(ms.map(m => m.earned)), months: use.length };
}

/* ---------- Hafta statistikasi (sharh va bosh sahifa uchun) ---------- */
function weekStats(start) {
  const days = dateRange(start, addDays(start, 6)).filter(d => d <= today());
  const habits = D('habits').list;
  const missCount = {};
  let hDone = 0, hTotal = 0;
  days.forEach(d => habits.forEach(h => {
    if (!habitCounted(h, d)) return;
    const st = habitStatus(h, d);
    if (d === today() && st === undefined) return;
    hTotal++; if (st === 1) hDone++; else missCount[h.id] = (missCount[h.id] || 0) + 1;
  }));
  const topMiss = Object.entries(missCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id, n]) => ({ h: habits.find(x => x.id === id), n })).filter(x => x.h);
  const att = D('attendance').recs.filter(r => r.date >= start && r.date <= addDays(start, 6));
  const tasksDone = D('tasks').list.reduce((n, t) => n + ((!t.recur || t.recur === 'none') ? (t.done && t.doneAt && t.doneAt.slice(0, 10) >= start && t.doneAt.slice(0, 10) <= addDays(start, 6) ? 1 : 0) : (t.doneDates || []).filter(x => x >= start && x <= addDays(start, 6)).length), 0);
  const tx = allM('tx').filter(t => t.date >= start && t.date <= addDays(start, 6));
  const inc = sum(tx.filter(t => t.type === 'in'), t => t.amt), out = sum(tx.filter(t => t.type === 'out'), t => t.amt);
  const langDays = { ko: days.filter(d => langMet('ko', d) === 1).length, en: days.filter(d => langMet('en', d) === 1).length };
  const langMin = { ko: sum(days, d => langMinutes('ko', d)), en: sum(days, d => langMinutes('en', d)) };
  const words = { ko: sum(days, d => wordsAdded('ko', d)), en: sum(days, d => wordsAdded('en', d)) };
  const sleeps = days.map(sleepOf).filter(s => s && s.bed && s.wake);
  const sleepAvg = sleeps.length ? avg(sleeps.map(sleepDur)) : null;
  const onTime = days.filter(d => sleptOnTime(d) === 1).length, sleepLogged = days.filter(d => sleptOnTime(d) !== null).length;
  const workouts = allM('workouts').filter(w => w.date >= start && w.date <= addDays(start, 6)).length;
  const social = sum(days, d => (day(d).social || 0)), scroll = sum(days, d => (day(d).scroll || 0)), gaming = sum(days, d => (day(d).gaming || 0)), latePhone = sum(days, d => (day(d).latePhone || 0));
  const wasters = [['Ijtimoiy tarmoq', social], ['Maqsadsiz scroll', scroll], ['Oʻyin', gaming], ['Kechki telefon', latePhone]].sort((a, b) => b[1] - a[1]);
  const pr = sum(days, prayersDone), prMarked = days.filter(d => prayersMarked(d)).length;
  const scores = days.map(dayScore).filter(v => v !== null);
  return {
    days, hDone, hTotal, topMiss, attP: att.filter(r => r.st === 'p' || r.st === 'l').length, attTotal: att.filter(r => r.st !== 'e').length, attAbs: att.filter(r => r.st === 'a').length,
    tasksDone, inc, out, saved: inc - out, langDays, langMin, words, sleepAvg, onTime, sleepLogged, workouts, social, scroll, gaming, latePhone,
    topWaste: wasters[0][1] > 0 ? wasters[0] : null, prayers: pr, prayerDays: prMarked, avgScore: scores.length ? Math.round(avg(scores)) : null,
    impulse: sum(tx.filter(t => t.type === 'out' && (t.impulse || t.cat === 'Oʻyin / skinlar')), t => t.amt)
  };
}

/* ---------- Hayot sohalari (7 kun) ---------- */
function lifeAreas() {
  const days = lastN(7);
  const areas = [];
  const pm = days.filter(d => prayersMarked(d));
  if (S().prayers) areas.push(['Imon', pm.length ? sum(pm, prayersDone) / (pm.length * 5) : null]);
  const att = D('attendance').recs.filter(r => r.date >= days[0] && r.st !== 'e');
  const overdueAcad = D('academic').items.filter(i => !i.done && i.due && i.due < today()).length;
  areas.push(['Oʻqish', att.length ? clamp(att.filter(r => r.st !== 'a').length / att.length - overdueAcad * 0.1, 0, 1) : (overdueAcad ? clamp(1 - overdueAcad * 0.2, 0, 1) : null)]);
  const ld = days.map(d => [langMet('ko', d), langMet('en', d)]).flat().filter(v => v !== null);
  areas.push(['Tillar', ld.length ? sum(days, d => (langMet('ko', d) === 1 ? .5 : 0) + (langMet('en', d) === 1 ? .5 : 0)) / 7 : null]);
  const hs = [];
  const sl = days.map(sleptOnTime).filter(v => v !== null); if (sl.length) hs.push(avg(sl));
  const ex = days.map(exerciseStatus).filter(v => v !== null); if (ex.length) hs.push(avg(ex));
  const wa = days.map(waterStatus).filter(v => v !== null); if (wa.length) hs.push(avg(wa));
  areas.push(['Sogʻliq', hs.length ? avg(hs) : null]);
  const mm = monthMoney(monthKey(today())), money = D('money');
  const budgetTotal = sum(Object.values(money.budget || {}), num);
  let fin = null;
  if (mm.count) {
    const parts = [];
    if (budgetTotal) parts.push(clamp(1 - Math.max(0, mm.out - budgetTotal * (new Date().getDate() / 30)) / budgetTotal, 0, 1));
    if (money.impulseLimit) parts.push(mm.impulse <= money.impulseLimit ? 1 : clamp(1 - (mm.impulse - money.impulseLimit) / money.impulseLimit, 0, 1));
    if (mm.inc) parts.push(clamp(mm.saved / mm.inc + 0.5, 0, 1));
    fin = parts.length ? avg(parts) : null;
  }
  areas.push(['Moliya', fin]);
  const dis = days.map(d => [socialStatus(d), gamingStatus(d)]).flat().filter(v => v !== null);
  areas.push(['Intizom', dis.length ? avg(dis) : null]);
  const withData = areas.filter(a => a[1] !== null);
  return { areas, overall: withData.length ? Math.round(avg(withData.map(a => a[1])) * 100) : null };
}

/* ---------- Yutuqlar ---------- */
function streakOf(fn, endInclusive = today()) { let n = 0, d = endInclusive; if (fn(d) !== 1) d = addDays(d, -1); while (fn(d) === 1) { n++; d = addDays(d, -1); if (n > 999) break; } return n; }
function maxRun(fn, days) { let best = 0, run = 0; days.forEach(d => { if (fn(d) === 1) { run++; best = Math.max(best, run); } else run = 0; }); return best; }
function badges() {
  const start = S().startDate || today();
  const span = dateRange(start < addDays(today(), -365) ? addDays(today(), -365) : start, today());
  const prayerFull = d => prayersDone(d) === 5 ? 1 : 0;
  const prRun = maxRun(prayerFull, span);
  const sleepRun = maxRun(sleptOnTime, span);
  const ko = D('vocab-ko').list.length, en = D('vocab-en').list.length;
  const workouts = allM('workouts').length;
  const anyHabit = monthKeys().some(mk => Object.values(Store.docs['m-' + mk].days || {}).some(d => d.h && Object.values(d.h).includes(1))) || D('habits').list.some(h => span.some(d => habitStatus(h, d) === 1));
  const weekFullAtt = (() => { const weeks = {}; D('attendance').recs.forEach(r => { const w = weekStart(r.date); (weeks[w] = weeks[w] || []).push(r); }); return Object.values(weeks).some(rs => rs.length >= 5 && rs.every(r => r.st === 'p')); })();
  const money = D('money'), budgetTotal = sum(Object.values(money.budget || {}), num);
  const pastMonths = monthKeys().filter(mk => mk < monthKey(today()) && mk >= monthKey(S().startDate || today()) && inMonth('tx', mk).length >= 10);
  const underBudget = budgetTotal > 0 && pastMonths.some(mk => monthMoney(mk).out <= budgetTotal);
  const noImpulse = pastMonths.some(mk => monthMoney(mk).impulse === 0);
  const skipped = (money.wishlist || []).filter(w => w.status === 'skipped').length;
  const comeback = span.some(d => { const p = dayScore(addDays(d, -1)), c = dayScore(d); return p !== null && p < 30 && c !== null && c >= 50; });
  const reviews = Object.keys(D('growth').weekly || {}).length;
  const mocks = D('language').mocks.length;
  const ef = money.emergencyTarget ? money.emergencySaved / money.emergencyTarget : 0;
  const minDays = span.filter(d => day(d).minimal && S().minimum.every(m => (day(d).minDone || {})[m.id])).length;
  return [
    ['Birinchi qadam', 'Birinchi odatni bajardingiz', anyHabit, 'habits'],
    ['Namozda 7 kun', '7 kun ketma-ket 5 vaqt namoz', prRun >= 7, 'faith'],
    ['Namozda 30 kun', '30 kun ketma-ket 5 vaqt namoz', prRun >= 30, 'faith'],
    ['Erta uxlovchi', '7 kecha ketma-ket vaqtida uxlash', sleepRun >= 7, 'moon'],
    ['100 ta soʻz', 'Lugʻatda 100 ta koreyscha soʻz', ko >= 100, 'lang'],
    ['500 ta soʻz', 'Lugʻatda 500 ta koreyscha soʻz', ko >= 500, 'lang'],
    ['English 100', 'Lugʻatda 100 ta inglizcha soʻz', en >= 100, 'lang'],
    ['Toʻliq hafta', 'Bir haftada barcha darslarda (kamida 5 ta) qatnashish', weekFullAtt, 'uni'],
    ['Byudjet ichida', 'Bir oyni byudjetdan oshirmay yakunlash', underBudget, 'money'],
    ['Impulssiz oy', 'Bir oy davomida oʻyin/skin xaridisiz', noImpulse, 'shield'],
    ['Voz kechdim', 'Istaklar roʻyxatidan 3 ta narsadan voz kechish', skipped >= 3, 'shield'],
    ['Jamgʻarma yarmi', 'Favqulodda jamgʻarmaning 50%', ef >= 0.5, 'money'],
    ['Sportchi', '10 ta mashgʻulot yozildi', workouts >= 10, 'fit'],
    ['Qaytish', 'Yomon kundan keyin yaxshi kun bilan qaytdingiz', comeback, 'bolt'],
    ['Minimal kun qahramoni', '3 ta minimal kunni toʻliq bajarish', minDays >= 3, 'bolt'],
    ['Haftalik sharh', 'Birinchi haftalik sharh yozildi', reviews >= 1, 'review'],
    ['TOPIK sinovi', 'Birinchi sinov imtihoni natijasi', mocks >= 1, 'lang']
  ];
}
