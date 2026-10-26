'use strict';
/* BEHRUZ OS — yadro: sana yordamchilari, saqlash (Store), oy hujjatlari */

const APP = { view: 'home', tab: {}, sel: {}, filter: {} };

const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
const UZ_DAYS = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
const UZ_DS = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function pad(n) { return String(n).padStart(2, '0'); }
function ds(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function today() { return ds(new Date()); }
function parseD(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function addDays(s, n) { const d = parseD(s); d.setDate(d.getDate() + n); return ds(d); }
function dow(s) { return parseD(s).getDay(); }
function weekStart(s) { const d = parseD(s); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return ds(d); }
function weekDays(s) { const st = weekStart(s); return [0, 1, 2, 3, 4, 5, 6].map(i => addDays(st, i)); }
function daysBetween(a, b) { return Math.round((parseD(b) - parseD(a)) / 86400000); }
function dateRange(a, b) { const out = []; let c = a; while (c <= b) { out.push(c); c = addDays(c, 1); } return out; }
function lastN(n, end = today()) { return dateRange(addDays(end, -(n - 1)), end); }
function monthKey(s) { return s.slice(0, 7); }
function monthDays(mk) { const [y, m] = mk.split('-').map(Number); const n = new Date(y, m, 0).getDate(); return Array.from({ length: n }, (_, i) => mk + '-' + pad(i + 1)); }
function addMonths(mk, n) { const [y, m] = mk.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return d.getFullYear() + '-' + pad(d.getMonth() + 1); }
function fmtD(s) { if (!s) return ''; const d = parseD(s); return d.getDate() + '-' + UZ_MONTHS[d.getMonth()]; }
function fmtDL(s) { const d = parseD(s); return `${UZ_DAYS[d.getDay()]}, ${d.getDate()}-${UZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`; }
function fmtM(mk) { const [y, m] = mk.split('-').map(Number); return `${UZ_MONTHS[m - 1][0].toUpperCase() + UZ_MONTHS[m - 1].slice(1)} ${y}`; }
function won(n) { const v = Math.round(n || 0); return (v < 0 ? '−₩' : '₩') + Math.abs(v).toLocaleString('en-US'); }
function num(v) { const n = parseFloat(String(v ?? '').replace(/[,\s₩]/g, '')); return isFinite(n) ? n : 0; }
function numOrNull(v) { if (v === null || v === undefined || String(v).trim() === '') return null; const n = num(v); return n; }
function tmin(t) { if (!t) return null; const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); }
function mtime(m) { m = ((Math.round(m) % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ':' + pad(m % 60); }
function pct(a, b) { return b ? Math.round(a / b * 100) : 0; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function sum(arr, f = x => x) { return arr.reduce((s, x) => s + (Number(f(x)) || 0), 0); }
function avg(arr) { return arr.length ? sum(arr) / arr.length : 0; }
function hrs(min) { const h = Math.floor(min / 60), m = Math.round(min % 60); return h ? (m ? `${h} soat ${m} daq` : `${h} soat`) : `${m} daq`; }
function plural(n, w) { return n + ' ' + w; }
function sortBy(arr, f, dir = 1) { return [...arr].sort((a, b) => { const x = f(a), y = f(b); return (x > y ? 1 : x < y ? -1 : 0) * dir; }); }
function hijri(s) {
  try { return new Intl.DateTimeFormat('uz-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(parseD(s)); }
  catch (e) { return ''; }
}

/* ---------- Standart hujjatlar ---------- */
const DEFAULT_MINIMUM = [
  'Bomdod va qolgan namozlarni oʻqish',
  'Darslarga borish (bor boʻlsa)',
  '5 ta koreyscha soʻz',
  '10 daqiqa yurish',
  'Belgilangan vaqtda uxlash'
];

const DEFAULTS = {
  settings: () => ({
    onboarded: false, startDate: today(), name: 'Behruz', semester: '', semStart: '', semEnd: '',
    wake: '07:00', sleep: '23:30', sleepHours: 7.5, lateNight: '00:30',
    koWords: 10, enWords: 5, koWordsLight: 3, enWordsLight: 2, koMin: 30, enMin: 20, koMinLight: 10, enMinLight: 5,
    topikTarget: 3, water: 8, protein: 0, steps: 0, workoutDays: [1, 3, 5],
    prayers: true, quranPages: 2,
    prayerCalc: { on: false, lat: '', lng: '', method: 'MWL', asr: 'hanafi' },
    prayerManual: { fajr: '', dhuhr: '', asr: '', maghrib: '', isha: '' },
    socialLimit: 60, gamingLimit: 60,
    minimum: DEFAULT_MINIMUM.map(t => ({ id: uid(), t })),
    gpaScale: 4.5,
    gradeMap: [['A+', 4.5], ['A0', 4.0], ['B+', 3.5], ['B0', 3.0], ['C+', 2.5], ['C0', 2.0], ['D+', 1.5], ['D0', 1.0], ['F', 0]]
  }),
  habits: () => ({ list: [] }),
  courses: () => ({ list: [] }),
  attendance: () => ({ recs: [] }),
  academic: () => ({ items: [], semesters: [] }),
  tasks: () => ({ list: [] }),
  'vocab-ko': () => ({ list: [] }),
  'vocab-en': () => ({ list: [] }),
  language: () => ({ grammar: [], mocks: [] }),
  money: () => ({ budget: {}, bills: [], goals: [], emergencyTarget: 0, emergencySaved: 0, balance: null, balanceDate: '', impulseLimit: 0, coolHours: 24, wishlist: [], fiMonths: 6 }),
  work: () => ({ job: { name: '', wage: 0, payday: 10, juhyu: false, tax: 0 }, template: [], payments: [], apps: [], skills: [], projects: [], roadmap: [] }),
  fitness: () => ({ plan: {}, measurements: true }),
  faith: () => ({ duas: [] }),
  growth: () => ({ goals: [], vision: [], weekly: {}, monthly: {} })
};
const MONTH_DEF = () => ({ days: {}, tx: [], shifts: [], workouts: [], body: [], lang: [], triggers: [], journal: [], reflect: [] });

/* ---------- Saqlash ----------
   cloud: claude db, foydalanuvchining shaxsiy data/users/<id>/ qismi
   local: shu brauzerning localStorage xotirasi (zaxira yoʻl)          */
const Store = {
  mode: 'loading', ver: 0, uid: null, db: null, docs: {}, timers: {}, writing: {}, again: {}, status: 'ok', err: '',
  lsKey(n) { return 'behruz-os:' + n; },

  async init() {
    let db = null, user = null;
    if (window.claude && typeof window.claude.use === 'function') {
      try { [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]); } catch (e) { }
    }
    let id = null;
    if (user) { try { id = await user.id(); } catch (e) { } }
    if (db && id) {
      this.db = db; this.uid = id;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const snap = await db.collection('data/users/' + id).get();
          snap.docs.forEach(d => { if (d.exists) this.docs[d.id] = structuredClone(d.data()); });
          this.mode = 'cloud';
          return;
        } catch (e) {
          this.err = (e && e.code) || 'unavailable';
          await new Promise(r => setTimeout(r, 800 + Math.random() * 700));
        }
      }
      // bulutga ulanib boʻlmadi: maʼlumotni yoʻqotmaslik uchun yozishni bloklaymiz
      this.mode = 'offline';
      return;
    }
    try {
      const idx = JSON.parse(localStorage.getItem(this.lsKey('_index')) || '[]');
      idx.forEach(n => { const v = localStorage.getItem(this.lsKey(n)); if (v) this.docs[n] = JSON.parse(v); });
      this.mode = 'local';
    } catch (e) { this.mode = 'memory'; }
  },

  get(name) {
    if (!this.docs[name]) {
      this.docs[name] = name.startsWith('m-') ? MONTH_DEF() : (DEFAULTS[name] ? DEFAULTS[name]() : {});
    } else if (!this.docs[name].__filled) {
      const def = name.startsWith('m-') ? MONTH_DEF() : (DEFAULTS[name] ? DEFAULTS[name]() : {});
      for (const k in def) if (!(k in this.docs[name])) this.docs[name][k] = def[k];
    }
    Object.defineProperty(this.docs[name], '__filled', { value: true, enumerable: false, configurable: true });
    return this.docs[name];
  },

  save(name) {
    if (this.mode === 'offline') { this.setStatus('error', 'Bulut xotirasiga ulanib boʻlmadi. Sahifani qayta yuklang — oʻzgarishlar saqlanmayapti.'); return; }
    this.ver++;
    clearTimeout(this.timers[name]);
    this.setStatus('saving');
    this.timers[name] = setTimeout(() => this.flush(name), 700);
  },

  async flush(name) {
    clearTimeout(this.timers[name]); delete this.timers[name];
    if (this.writing[name]) { this.again[name] = true; return; }
    this.writing[name] = true;
    const body = JSON.parse(JSON.stringify(this.docs[name] || {}));
    try {
      await this.write(name, body);
      this.err = '';
    } catch (e) {
      const code = (e && e.code) || 'unknown';
      if (code === 'unavailable') {
        await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
        try { await this.write(name, body); } catch (e2) { this.fail(e2); }
      } else this.fail(e);
    } finally {
      this.writing[name] = false;
      if (this.again[name]) { this.again[name] = false; this.flush(name); }
      else if (!Object.keys(this.timers).length && !Object.values(this.writing).some(Boolean) && this.status !== 'error') this.setStatus('ok');
    }
  },

  async write(name, body) {
    if (this.mode === 'cloud') await this.db.doc('data/users/' + this.uid + '/' + name).set(body);
    else if (this.mode === 'local') {
      localStorage.setItem(this.lsKey(name), JSON.stringify(body));
      const idx = new Set(JSON.parse(localStorage.getItem(this.lsKey('_index')) || '[]'));
      if (!idx.has(name)) { idx.add(name); localStorage.setItem(this.lsKey('_index'), JSON.stringify([...idx])); }
    }
  },

  fail(e) {
    const code = (e && e.code) || '';
    const msg = code === 'quota_exceeded' ? 'Xotira toʻldi. Eski maʼlumotlarni oʻchiring yoki zaxira nusxa olib, tozalang.'
      : code === 'invalid_argument' ? 'Bu boʻlim juda katta boʻlib ketdi (256 KB chegarasi) yoki yozishga ruxsat yoʻq.'
        : code === 'revoked' ? 'Kirish huquqi oʻzgardi. Sahifani qayta oching.'
          : (e && e.name === 'QuotaExceededError') ? 'Brauzer xotirasi toʻldi. Zaxira nusxa oling.'
            : 'Saqlab boʻlmadi. Internetni tekshirib, qayta urinib koʻring.';
    this.setStatus('error', msg);
  },

  async flushAll() { await Promise.all(Object.keys(this.timers).map(n => this.flush(n))); },

  async removeAll() {
    Object.values(this.timers).forEach(clearTimeout); this.timers = {};
    const names = Object.keys(this.docs);
    for (const n of names) {
      try {
        if (this.mode === 'cloud') await this.db.doc('data/users/' + this.uid + '/' + n).delete();
        else if (this.mode === 'local') localStorage.removeItem(this.lsKey(n));
      } catch (e) { }
    }
    if (this.mode === 'local') { try { localStorage.removeItem(this.lsKey('_index')); } catch (e) { } }
    this.docs = {};
  },

  setStatus(s, msg) {
    this.status = s; if (msg) this.err = msg;
    const el = document.getElementById('sync');
    if (el) el.outerHTML = syncBadge();
  }
};

/* ---------- Oy hujjatlari (kunlik yozuvlar, tranzaksiyalar, smenalar...) ---------- */
function M(mk) { return Store.get('m-' + mk); }
function saveM(mk) { Store.save('m-' + mk); }
function day(date) { const m = Store.docs['m-' + monthKey(date)]; return (m && m.days && m.days[date]) || {}; }
function setDay(date, fn) { const m = M(monthKey(date)); const d = m.days[date] || (m.days[date] = {}); fn(d); saveM(monthKey(date)); }
function monthKeys() { return Object.keys(Store.docs).filter(k => k.startsWith('m-')).map(k => k.slice(2)).sort(); }
function allM(kind) { return monthKeys().flatMap(mk => (Store.docs['m-' + mk][kind] || [])); }
function inMonth(kind, mk) { const m = Store.docs['m-' + mk]; return (m && m[kind]) || []; }
function upsertM(kind, item) {
  const target = monthKey(item.date);
  for (const mk of monthKeys()) {
    const arr = Store.docs['m-' + mk][kind]; if (!arr) continue;
    const i = arr.findIndex(x => x.id === item.id);
    if (i >= 0) {
      if (mk === target) { arr[i] = item; saveM(mk); return item; }
      arr.splice(i, 1); saveM(mk);
    }
  }
  const m = M(target); (m[kind] || (m[kind] = [])).push(item); saveM(target);
  return item;
}
function removeM(kind, id) {
  for (const mk of monthKeys()) {
    const arr = Store.docs['m-' + mk][kind]; if (!arr) continue;
    const i = arr.findIndex(x => x.id === id);
    if (i >= 0) { arr.splice(i, 1); saveM(mk); return; }
  }
}
function findM(kind, id) { return allM(kind).find(x => x.id === id); }

/* qisqa yoʻllar */
const S = () => Store.get('settings');
const D = n => Store.get(n);
const save = n => Store.save(n);

window.addEventListener('pagehide', () => { Store.flushAll(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') Store.flushAll(); });
