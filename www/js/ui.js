'use strict';
/* BEHRUZ OS — interfeys: ikonlar, navigatsiya, modal, grafiklar, umumiy komponentlar */

const ICON = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  plan: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M7 13h4M7 17h7"/>',
  habits: '<path d="M4 12.5 9 17.5 20 6.5"/>',
  uni: '<path d="M2 9 12 4l10 5-10 5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5M22 9v6"/>',
  lang: '<path d="M4 5h9M8.5 3v2M6 5c0 4 3 7 6 8M11 5c0 3-2.5 7-7 9"/><path d="m13 21 4-9 4 9M14.5 18h5"/>',
  money: '<rect x="2.5" y="6" width="19" height="13" rx="2"/><path d="M2.5 10h19M16 15h2"/>',
  work: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
  fit: '<path d="M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11"/>',
  faith: '<path d="M15.5 3.5a8.5 8.5 0 1 0 5 13.5 7 7 0 0 1-5-13.5z"/><path d="m18 6 .6 1.4L20 8l-1.4.6L18 10l-.6-1.4L16 8l1.4-.6z"/>',
  discipline: '<path d="M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  review: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  config: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  left: '<path d="m15 6-6 6 6 6"/>',
  right: '<path d="m9 6 6 6-6 6"/>',
  up: '<path d="m6 15 6-6 6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  flame: '<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5 1-8.5z"/>',
  alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  grip: '<circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/>',
  shield: '<path d="M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6z"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>'
};
function ic(n, cls = '') { return `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON[n] || ''}</svg>`; }

const NAV = [
  ['home', 'Bosh sahifa'], ['plan', 'Reja va vazifalar'], ['habits', 'Odatlar'], ['uni', 'Universitet'],
  ['lang', 'Tillar'], ['money', 'Pul'], ['work', 'Ish va karyera'], ['fit', 'Sport va sogʻliq'],
  ['faith', 'Ibodat'], ['discipline', 'Intizom markazi'], ['review', 'Sharh va oʻsish'], ['config', 'Sozlamalar']
];
const MOBILE_NAV = ['home', 'plan', 'habits', 'money'];
const VIEWS = {};
const ACT = {}, CHG = {}, FORM = {};

/* ---------- Asosiy chizish ---------- */
function render() {
  const app = document.getElementById('app');
  if (Store.mode === 'loading') { app.innerHTML = `<div class="boot"><div class="boot-mark">B</div><p>BEHRUZ OS yuklanmoqda…</p></div>`; return; }
  if (!S().onboarded) { app.innerHTML = renderOnboarding(); return; }
  const v = VIEWS[APP.view] ? APP.view : 'home';
  const title = (NAV.find(n => n[0] === v) || NAV[0])[1];
  let body;
  try { body = VIEWS[v](); }
  catch (e) { console.error(e); body = `<div class="card"><h3>Bu boʻlimni chizishda xato chiqdi</h3><p class="muted">${esc(e.message)}</p><p class="muted">Maʼlumotlaringiz joyida. Boshqa boʻlimga oʻtib, qaytib koʻring.</p></div>`; }
  const xp = totalXP();
  const lv = levelOf(xp);
  app.innerHTML = `
  <aside class="side" aria-label="Boʻlimlar">
    <div class="brand"><span class="brand-mark">B</span><span><b>BEHRUZ</b> OS</span></div>
    <nav class="side-nav">${NAV.map(([k, l]) => `<a href="#${k}" data-act="go" data-v="${k}" class="nav-i ${k === v ? 'on' : ''}" ${k === v ? 'aria-current="page"' : ''}>${ic(k)}<span>${l}</span></a>`).join('')}</nav>
    <div class="side-foot">${levelChip(lv)}</div>
  </aside>
  <div class="main">
    <header class="top">
      <h1 class="top-title">${title}</h1>
      <div class="top-r">${syncBadge()}<span class="lv-mini" title="Daraja">${ic('star')} ${lv.level}</span></div>
    </header>
    ${Store.status === 'error' ? `<div class="banner bad" role="alert">${ic('alert')}<span>${esc(Store.err)}</span><button class="btn sm" data-act="retry-save">Qayta urinish</button></div>` : ''}
    ${Store.mode === 'local' && !localNoteHidden() ? `<div class="banner warn">${ic('alert')}<span>Maʼlumotlar shu qurilmaning oʻzida saqlanadi. Telefon va kompyuter oʻrtasida avtomatik sinxronlanmaydi: Sozlamalar → Zaxira nusxa orqali koʻchiring.</span><button class="btn sm ghost" data-act="hide-local-note">Tushunarli</button></div>` : ''}
    ${Store.mode === 'memory' ? `<div class="banner bad">${ic('alert')}<span>Bu oynada saqlash ishlamayapti. Kiritganlaringiz sahifa yopilganda yoʻqoladi.</span></div>` : ''}
    <main id="view" class="view">${body}</main>
  </div>
  <nav class="bottom" aria-label="Asosiy boʻlimlar">
    ${MOBILE_NAV.map(k => `<a href="#${k}" data-act="go" data-v="${k}" class="bn ${k === v ? 'on' : ''}">${ic(k)}<span>${NAV.find(n => n[0] === k)[1].split(' ')[0]}</span></a>`).join('')}
    <button class="bn ${MOBILE_NAV.includes(v) ? '' : 'on'}" data-act="more">${ic('more')}<span>Yana</span></button>
  </nav>
  <div id="modal-root"></div><div id="toast-root" aria-live="polite"></div>`;
}

function syncBadge() {
  const m = Store.mode, s = Store.status;
  const label = s === 'error' ? 'Saqlanmadi' : s === 'saving' ? 'Saqlanmoqda…' : m === 'cloud' ? 'Saqlandi' : m === 'local' ? 'Brauzerda' : m === 'offline' ? 'Oflayn' : 'Saqlanmaydi';
  const cls = s === 'error' || m === 'offline' || m === 'memory' ? 'bad' : s === 'saving' ? 'mid' : 'ok';
  return `<span id="sync" class="sync ${cls}" title="${m === 'cloud' ? 'Shaxsiy bulut xotirasi: faqat siz koʻrasiz' : ''}"><i></i>${label}</span>`;
}
function levelChip(lv) {
  return `<div class="lvl"><div class="lvl-row"><span>Daraja <b>${lv.level}</b></span><span class="mono">${lv.into}/${lv.need} XP</span></div>${bar(pct(lv.into, lv.need))}</div>`;
}

function go(v) { APP.view = v; try { history.replaceState(null, '', '#' + v); } catch (e) { location.hash = v; } render(); window.scrollTo(0, 0); }
ACT.go = el => go(el.dataset.v);
ACT.tab = el => { APP.tab[el.dataset.view] = el.dataset.t; render(); };
ACT.more = () => openModal({ title: 'Boʻlimlar', body: `<div class="more-grid">${NAV.map(([k, l]) => `<button class="more-i" data-act="go-close" data-v="${k}">${ic(k)}<span>${l}</span></button>`).join('')}</div>`, noSubmit: true });
ACT['go-close'] = el => { closeModal(); go(el.dataset.v); };
ACT['retry-save'] = () => { Store.status = 'ok'; Object.keys(Store.docs).forEach(n => Store.save(n)); render(); };

function tabs(view, list) {
  const cur = APP.tab[view] || list[0][0];
  return `<div class="tabs" role="tablist">${list.map(([k, l]) => `<button role="tab" aria-selected="${k === cur}" class="tab ${k === cur ? 'on' : ''}" data-act="tab" data-view="${view}" data-t="${k}">${l}</button>`).join('')}</div>`;
}
function curTab(view, def) { return APP.tab[view] || def; }

/* ---------- Komponentlar ---------- */
function bar(p, cls = '') { return `<div class="bar ${cls}" role="progressbar" aria-valuenow="${clamp(p, 0, 100)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${clamp(p, 0, 100)}%"></i></div>`; }
function chip(text, kind = '') { return `<span class="chip ${kind}">${text}</span>`; }
function stat(label, value, sub = '', kind = '') { return `<div class="stat ${kind}"><span class="stat-l">${label}</span><span class="stat-v">${value}</span>${sub ? `<span class="stat-s">${sub}</span>` : ''}</div>`; }
function empty(title, text, btn = '') { return `<div class="empty"><b>${title}</b><p>${text}</p>${btn}</div>`; }
function check(on, act, attrs = '', label = '') {
  const st = on === 1 || on === true ? 'on' : on === 0 ? 'miss' : '';
  return `<button class="chk ${st}" role="checkbox" aria-checked="${st === 'on'}" data-act="${act}" ${attrs} aria-label="${esc(label)}">${st === 'on' ? ic('habits') : st === 'miss' ? ic('x') : ''}</button>`;
}
function btn(label, act, attrs = '', cls = '') { return `<button class="btn ${cls}" data-act="${act}" ${attrs}>${label}</button>`; }
function iconBtn(icon, act, attrs = '', label = '') { return `<button class="ibtn" data-act="${act}" ${attrs} aria-label="${esc(label)}" title="${esc(label)}">${ic(icon)}</button>`; }
function sectionHead(title, right = '') { return `<div class="sh"><h2>${title}</h2><div class="sh-r">${right}</div></div>`; }
function field(label, input, hint = '') { return `<label class="field"><span class="fl">${label}</span>${input}${hint ? `<span class="fh">${hint}</span>` : ''}</label>`; }
function inp(name, val = '', type = 'text', extra = '') { return `<input id="f-${name}" name="${name}" type="${type}" value="${esc(val ?? '')}" ${extra}>`; }
function sel(name, opts, val, extra = '') { return `<select id="f-${name}" name="${name}" ${extra}>${opts.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${String(v) === String(val) ? 'selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`; }
function area(name, val = '', extra = '') { return `<textarea id="f-${name}" name="${name}" rows="3" ${extra}>${esc(val ?? '')}</textarea>`; }
function daysPicker(name, vals = []) { return `<div class="daypick">${WEEK_ORDER.map(d => `<label><input type="checkbox" name="${name}" value="${d}" ${vals.includes(d) ? 'checked' : ''}><span>${UZ_DS[d]}</span></label>`).join('')}</div>`; }
function dateNav(key, date, extra = '', future = false) {
  const f = future ? 'data-f="1"' : '';
  return `<div class="datenav"><button class="ibtn" data-act="dnav" data-k="${key}" data-n="-1" ${f} aria-label="Oldingi kun">${ic('left')}</button><span class="dn-l">${date === today() ? 'Bugun · ' : ''}${fmtD(date)}, ${UZ_DAYS[dow(date)].toLowerCase()}</span><button class="ibtn" data-act="dnav" data-k="${key}" data-n="1" ${f} aria-label="Keyingi kun" ${date >= today() && !future ? 'disabled' : ''}>${ic('right')}</button>${date !== today() ? `<button class="btn sm ghost" data-act="dnav" data-k="${key}" data-n="0" ${f}>Bugun</button>` : ''}${extra}</div>`;
}
function selDate(key) { return APP.sel[key] || today(); }
ACT.dnav = el => { const k = el.dataset.k, n = +el.dataset.n; APP.sel[k] = n === 0 ? today() : addDays(selDate(k), n); if (!el.dataset.f && APP.sel[k] > today()) APP.sel[k] = today(); render(); };
function monthNav(key, mk) {
  return `<div class="datenav"><button class="ibtn" data-act="mnav" data-k="${key}" data-n="-1" aria-label="Oldingi oy">${ic('left')}</button><span class="dn-l">${fmtM(mk)}</span><button class="ibtn" data-act="mnav" data-k="${key}" data-n="1" aria-label="Keyingi oy">${ic('right')}</button>${mk !== monthKey(today()) ? `<button class="btn sm ghost" data-act="mnav" data-k="${key}" data-n="0">Shu oy</button>` : ''}</div>`;
}
function selMonth(key) { return APP.sel[key] || monthKey(today()); }
ACT.mnav = el => { const k = el.dataset.k, n = +el.dataset.n; APP.sel[k] = n === 0 ? monthKey(today()) : addMonths(selMonth(k), n); render(); };

function fd(form) {
  const o = {};
  const f = new FormData(form);
  for (const [k, v] of f.entries()) { if (k in o) { o[k] = [].concat(o[k], v); } else o[k] = v; }
  return o;
}
function arr(v) { return v === undefined ? [] : [].concat(v); }

/* ---------- Modal ---------- */
let MODAL = null;
function openModal({ title, body, onSubmit, submit = 'Saqlash', noSubmit = false, danger = null, wide = false }) {
  MODAL = { onSubmit, danger };
  const root = document.getElementById('modal-root');
  root.innerHTML = `<div class="ov" data-act="ov-close"><div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="mt">
    <div class="mh"><h3 id="mt">${title}</h3><button class="ibtn" data-act="close" aria-label="Yopish">${ic('x')}</button></div>
    <form id="mform" class="mb" novalidate>${body}<p class="ferr" id="ferr" role="alert"></p>
    ${noSubmit ? '' : `<div class="mf">${danger ? `<button type="button" class="btn danger ghost" data-act="m-danger">${danger.label}</button>` : ''}<span class="sp"></span><button type="button" class="btn ghost" data-act="close">Bekor qilish</button><button type="submit" class="btn primary">${submit}</button></div>`}
    </form></div></div>`;
  const form = document.getElementById('mform');
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!MODAL || !MODAL.onSubmit) return closeModal();
    const res = MODAL.onSubmit(fd(form), form);
    if (typeof res === 'string') { document.getElementById('ferr').textContent = res; return; }
    if (res !== false) { closeModal(); render(); }
  });
  const first = root.querySelector('input:not([type=checkbox]):not([type=hidden]),select,textarea');
  if (first) setTimeout(() => first.focus(), 30);
}
function closeModal() { const r = document.getElementById('modal-root'); if (r) r.innerHTML = ''; MODAL = null; }
ACT.close = () => closeModal();
ACT['ov-close'] = (el, e) => { if (e.target === el) closeModal(); };
ACT['m-danger'] = el => {
  if (!MODAL || !MODAL.danger) return;
  if (el.dataset.sure !== '1') { el.dataset.sure = '1'; el.textContent = 'Ishonchingiz komilmi? Yana bosing'; return; }
  MODAL.danger.fn(); closeModal(); render();
};
document.addEventListener('keydown', e => { if (e.key === 'Escape' && MODAL) closeModal(); });

function confirmBox(text, onYes, yes = 'Ha, oʻchirish') {
  openModal({ title: 'Tasdiqlang', body: `<p>${text}</p>`, submit: yes, onSubmit: () => { onYes(); } });
}

function toast(msg) {
  const r = document.getElementById('toast-root'); if (!r) return;
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; r.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

/* ---------- Grafiklar (SVG, saqlangan maʼlumotdan) ---------- */
function niceMax(v) { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; }
function barChart(data, { h = 160, fmt = v => v, max = null, target = null, color = 'var(--accent)', stacked = null } = {}) {
  if (!data.length) return '';
  const W = 600, H = h, pl = 44, pr = 8, pt = 12, pb = 24;
  const vals = data.map(d => stacked ? sum(stacked.map(s => d[s.key] || 0)) : d.value);
  const mx = max || niceMax(Math.max(...vals, target || 0, 0.0001));
  const iw = W - pl - pr, ih = H - pt - pb, bw = iw / data.length;
  const y = v => pt + ih - (v / mx) * ih;
  let g = '';
  for (let i = 0; i <= 4; i++) { const v = mx * i / 4; g += `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${pl - 6}" y="${y(v) + 4}" text-anchor="end">${esc(fmt(v))}</text>`; }
  let b = '';
  data.forEach((d, i) => {
    const x = pl + i * bw + bw * 0.18, w = Math.max(2, bw * 0.64);
    if (stacked) {
      let acc = 0;
      stacked.forEach(s => { const v = d[s.key] || 0; if (v > 0) { b += `<rect x="${x}" y="${y(acc + v)}" width="${w}" height="${Math.max(0, y(acc) - y(acc + v))}" rx="2" style="fill:${s.color}"><title>${esc(d.label)} · ${esc(s.label)}: ${esc(fmt(v))}</title></rect>`; acc += v; } });
    } else {
      const v = d.value || 0;
      b += `<rect x="${x}" y="${y(v)}" width="${w}" height="${Math.max(0, y(0) - y(v))}" rx="3" style="fill:${d.color || color}"><title>${esc(d.label)}: ${esc(fmt(v))}</title></rect>`;
    }
    if (data.length <= 16 || i % Math.ceil(data.length / 12) === 0) b += `<text class="ax" x="${x + w / 2}" y="${H - 6}" text-anchor="middle">${esc(d.label)}</text>`;
  });
  const t = target ? `<line class="tgt" x1="${pl}" x2="${W - pr}" y1="${y(target)}" y2="${y(target)}"/>` : '';
  const legend = stacked ? `<div class="legend">${stacked.map(s => `<span><i style="background:${s.color}"></i>${esc(s.label)}</span>`).join('')}${target ? `<span><i class="lt"></i>Chegara</span>` : ''}</div>` : (target ? `<div class="legend"><span><i class="lt"></i>Maqsad / chegara: ${esc(fmt(target))}</span></div>` : '');
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" preserveAspectRatio="none" style="height:${h}px">${g}${b}${t}</svg>${legend}</div>`;
}
function lineChart(points, { h = 160, fmt = v => v, goal = null, minZero = false } = {}) {
  const pts = points.filter(p => p.y !== null && p.y !== undefined);
  if (pts.length < 1) return '';
  const W = 600, H = h, pl = 44, pr = 12, pt = 12, pb = 24;
  let lo = Math.min(...pts.map(p => p.y), goal ?? Infinity), hi = Math.max(...pts.map(p => p.y), goal ?? -Infinity);
  if (minZero) lo = 0;
  if (hi === lo) { hi += 1; lo -= 1; }
  const padv = (hi - lo) * 0.12; lo -= minZero ? 0 : padv; hi += padv;
  const iw = W - pl - pr, ih = H - pt - pb;
  const x = i => pl + (points.length === 1 ? iw / 2 : i / (points.length - 1) * iw);
  const y = v => pt + ih - (v - lo) / (hi - lo) * ih;
  let g = '';
  for (let i = 0; i <= 3; i++) { const v = lo + (hi - lo) * i / 3; g += `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${pl - 6}" y="${y(v) + 4}" text-anchor="end">${esc(fmt(v))}</text>`; }
  const idx = points.map((p, i) => [p, i]).filter(([p]) => p.y !== null && p.y !== undefined);
  const path = idx.map(([p, i], k) => `${k ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.y).toFixed(1)}`).join(' ');
  const areaP = idx.length > 1 ? `${path} L${x(idx[idx.length - 1][1]).toFixed(1)},${pt + ih} L${x(idx[0][1]).toFixed(1)},${pt + ih} Z` : '';
  const lbl = points.map((p, i) => (points.length <= 14 || i % Math.ceil(points.length / 10) === 0 || i === points.length - 1) ? `<text class="ax" x="${x(i)}" y="${H - 6}" text-anchor="middle">${esc(p.x)}</text>` : '').join('');
  const last = idx[idx.length - 1];
  const dots = idx.map(([p, i]) => `<circle cx="${x(i)}" cy="${y(p.y)}" r="${p === last[0] ? 4.5 : 2.5}" class="${p === last[0] ? 'dot-end' : 'dot'}"><title>${esc(p.x)}: ${esc(fmt(p.y))}</title></circle>`).join('');
  const gl = goal !== null && goal !== undefined ? `<line class="tgt" x1="${pl}" x2="${W - pr}" y1="${y(goal)}" y2="${y(goal)}"/>` : '';
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" preserveAspectRatio="none" style="height:${h}px">${g}${areaP ? `<path d="${areaP}" class="area"/>` : ''}<path d="${path}" class="line"/>${gl}${dots}${lbl}</svg>${goal !== null && goal !== undefined ? `<div class="legend"><span><i class="lt"></i>Maqsad: ${esc(fmt(goal))}</span></div>` : ''}</div>`;
}
/* oy issiqlik xaritasi: valFn(date) -> 0..1 yoki null (rejalashtirilmagan) */
function heatmap(mk, valFn, { title = '' } = {}) {
  const days = monthDays(mk);
  const lead = (dow(days[0]) + 6) % 7;
  const t = today();
  const cells = Array(lead).fill('<span class="hc pad"></span>').concat(days.map(d => {
    const v = d > t ? null : valFn(d);
    const lvl = v === null || v === undefined ? 'na' : v >= 1 ? 'l4' : v >= .75 ? 'l3' : v >= .5 ? 'l2' : v > 0 ? 'l1' : 'l0';
    return `<span class="hc ${lvl} ${d === t ? 'today' : ''}" title="${fmtD(d)}${v !== null && v !== undefined ? ': ' + Math.round(v * 100) + '%' : ''}">${+d.slice(8)}</span>`;
  })).join('');
  return `<div class="heat">${title ? `<div class="heat-t">${title}</div>` : ''}<div class="heat-h">${WEEK_ORDER.map(d => `<span>${UZ_DS[d]}</span>`).join('')}</div><div class="heat-g">${cells}</div>
  <div class="heat-k"><span>Kam</span><i class="hc l0"></i><i class="hc l1"></i><i class="hc l2"></i><i class="hc l3"></i><i class="hc l4"></i><span>Toʻliq</span><i class="hc na"></i><span>Belgilanmagan</span></div></div>`;
}
function ring(p, label, sub = '') {
  const r = 42, c = 2 * Math.PI * r, v = clamp(p, 0, 100);
  return `<div class="ring"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="${r}" class="ring-bg"/><circle cx="50" cy="50" r="${r}" class="ring-fg" stroke-dasharray="${(c * v / 100).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 50 50)"/></svg><div class="ring-c"><b>${label}</b>${sub ? `<span>${sub}</span>` : ''}</div></div>`;
}
function strip(dates, valFn) {
  return `<div class="strip">${dates.map(d => { const v = valFn(d); return `<i class="${v === 1 ? 'on' : v === 0 ? 'miss' : v === null ? 'na' : 'un'}" title="${fmtD(d)}"></i>`; }).join('')}</div>`;
}

/* ---------- Umumiy hodisalar ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const fn = ACT[el.dataset.act];
  if (!fn) return;
  if (el.tagName === 'A' || el.tagName === 'BUTTON') e.preventDefault();
  fn(el, e);
});
document.addEventListener('change', e => {
  const el = e.target.closest('[data-chg]');
  if (el && CHG[el.dataset.chg]) CHG[el.dataset.chg](el, e);
});
document.addEventListener('submit', e => {
  const f = e.target;
  if (f.id === 'mform') return;
  if (f.dataset.form && FORM[f.dataset.form]) { e.preventDefault(); const r = FORM[f.dataset.form](fd(f), f); if (typeof r === 'string') { const er = f.querySelector('.ferr'); if (er) er.textContent = r; } }
});

/* Ilova (APK / kompyuter) rejimi: mahalliy saqlash haqidagi eslatmani yopish */
function localNoteHidden() { try { return localStorage.getItem('behruz-os:_noteHidden') === '1'; } catch (e) { return false; } }
ACT['hide-local-note'] = () => { try { localStorage.setItem('behruz-os:_noteHidden', '1'); } catch (e) { } render(); };
