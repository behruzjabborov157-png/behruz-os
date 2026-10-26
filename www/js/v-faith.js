'use strict';
/* Ibodat: besh vaqt namoz, Qurʼon maqsadi, zikr va duo eslatmalari, shaxsiy mulohazalar, izchillik kalendari.
   Ohang: aybdorlik emas, davom etishga undash. */

const FAITH_NOTES = [
  'Bitta namoz qolgan boʻlsa ham, kun tugamadi. Keyingisiga eʼtibor bering.',
  'Qazo qilish mumkin. Eng muhimi, qaytish.',
  'Oz boʻlsa ham doimiy amal yaxshi.',
  'Bugun bir sahifa boʻlsa ham Qurʼon oʻqing.'
];

VIEWS.faith = () => {
  if (!S().prayers) return `<section class="card">${empty('Namoz kuzatuvi oʻchirilgan', 'Sozlamalarda yoqishingiz mumkin. Qurʼon va mulohaza qismlari baribir ishlaydi.', btn('Yoqish', 'faith-on', '', 'primary'))}</section>` + faithRest();
  const tab = curTab('faith', 'today');
  return tabs('faith', [['today', 'Bugun'], ['cal', 'Kalendar'], ['notes', 'Zikr va duolar'], ['reflect', 'Mulohazalar'], ['times', 'Namoz vaqtlari']]) +
    ({ today: faithToday, cal: faithCal, notes: faithNotes, reflect: faithReflect, times: faithTimes }[tab] || faithToday)();
};
ACT['faith-on'] = () => { S().prayers = true; save('settings'); render(); };
function faithRest() { return faithNotes() + faithReflect(); }

function faithToday() {
  const date = selDate('faith'), d = day(date), p = d.prayers || {}, pt = prayerTimesFor(date);
  const done = prayersDone(date), missed = PRAYERS.filter(([k]) => p[k] === 'miss');
  const qg = num(S().quranPages);
  const streak = streakOf(x => prayersDone(x) === 5 ? 1 : 0);
  return `<div class="row between wrap gap8">${dateNav('faith', date)}<span class="mono">${done}/5</span></div>
  <section class="card">
    <ul class="prayers">${PRAYERS.map(([k, l]) => `<li class="pr ${p[k] || ''}"><div class="pr-n"><b>${l}</b>${pt && pt.t[k] ? `<span class="mono muted sm">${pt.t[k]}</span>` : ''}</div>
      <div class="seg">${Object.entries(PRAYER_ST).map(([s, sl]) => `<button class="seg-b ${p[k] === s ? 'on ' + (s === 'on' ? 'ok' : s === 'late' ? 'mid' : s === 'qaza' ? 'warn' : 'bad') : ''}" data-act="prayer" data-d="${date}" data-k="${k}" data-s="${s}" aria-pressed="${p[k] === s}">${sl}</button>`).join('')}</div></li>`).join('')}</ul>
    ${missed.length ? `<p class="note">${ic('faith')} ${missed.map(([, l]) => l).join(', ')} qoldi. Qazo qilib, “Qazo qilindi” deb belgilashingiz mumkin. ${FAITH_NOTES[0]}</p>` : done === 5 ? `<p class="note ok">Alhamdulillah, besh vaqt namoz.${streak > 1 ? ` ${streak} kun ketma-ket.` : ''}</p>` : `<p class="muted sm">${FAITH_NOTES[(new Date().getDate()) % FAITH_NOTES.length]}</p>`}
  </section>
  <div class="grid g2">
    <section class="card">
      ${sectionHead('Qurʼon', qg ? `<span class="mono">${d.quran || 0}/${qg} sahifa</span>` : '')}
      ${qg ? bar(pct(d.quran || 0, qg)) : ''}
      <form data-form="quran" class="inline-form" data-d="${date}"><input name="pages" id="f-quran" type="number" min="0" max="604" value="${d.quran ?? ''}" placeholder="Sahifa" aria-label="Oʻqilgan sahifalar"><input name="where" id="f-qwhere" value="${esc(d.quranWhere || '')}" placeholder="Qayerdaman (sura/oyat)" aria-label="Qayerdaman"><button class="btn sm">Saqlash</button><p class="ferr"></p></form>
      <p class="muted sm">Oxirgi joy: ${esc(lastQuranPlace() || '—')}</p>
    </section>
    <section class="card">
      ${sectionHead('Bugungi zikr')}
      <form data-form="dhikr" class="stack" data-d="${date}"><textarea name="t" id="f-dhikr" rows="3" placeholder="Bugun qaysi zikr va duolarni oʻqidim">${esc(d.dhikr || '')}</textarea><div class="row end"><button class="btn sm">Saqlash</button></div></form>
    </section>
  </div>`;
}
function lastQuranPlace() { for (const d of lastN(120).reverse()) { const w = day(d).quranWhere; if (w) return `${w} (${fmtD(d)})`; } return ''; }
ACT.prayer = el => { const { d, k, s } = el.dataset; setDay(d, x => { x.prayers = x.prayers || {}; if (x.prayers[k] === s) delete x.prayers[k]; else x.prayers[k] = s; }); render(); };
FORM.quran = (o, f) => { const n = num(o.pages); if (n < 0 || n > 604) return 'Sahifa soni 0–604 oraligʻida.'; setDay(f.dataset.d, d => { if (o.pages === '') delete d.quran; else d.quran = n; d.quranWhere = (o.where || '').trim(); }); toast('Saqlandi'); render(); };
FORM.dhikr = (o, f) => { setDay(f.dataset.d, d => { d.dhikr = o.t || ''; }); toast('Saqlandi'); render(); };

function faithCal() {
  const mk = selMonth('faith-m');
  const days = monthDays(mk).filter(d => d <= today());
  const marked = days.filter(d => prayersMarked(d));
  const full = days.filter(d => prayersDone(d) === 5).length;
  const byPrayer = PRAYERS.map(([k, l]) => ({ label: l, value: marked.length ? Math.round(marked.filter(d => ['on', 'late', 'qaza'].includes((day(d).prayers || {})[k])).length / marked.length * 100) : 0 }));
  const onTime = sum(marked, d => PRAYERS.filter(([k]) => (day(d).prayers || {})[k] === 'on').length);
  return `<div class="grid g2">
    <section class="card">${sectionHead('Izchillik', monthNav('faith-m', mk))}${heatmap(mk, d => prayersMarked(d) ? prayersDone(d) / 5 : null)}</section>
    <section class="card">${sectionHead('Shu oy')}
      <div class="kv"><span>Toʻliq kunlar (5/5)</span><b>${full}/${days.length}</b><span>Oʻz vaqtida</span><b>${marked.length ? pct(onTime, marked.length * 5) + '%' : '—'}</b><span>Qurʼon sahifalari</span><b>${sum(days, d => day(d).quran || 0)}</b><span>Eng uzun seriya</span><b>${maxRun(d => prayersDone(d) === 5 ? 1 : 0, days)} kun</b></div>
      ${marked.length ? barChart(byPrayer, { h: 140, max: 100, fmt: v => Math.round(v) + '%', color: 'var(--ok)' }) : '<p class="muted">Namoz belgilansa, qaysi vaqt qiyinroq ekani shu yerda koʻrinadi.</p>'}
    </section>
  </div>`;
}

function faithNotes() {
  const l = D('faith').duas;
  return `<section class="card">
    ${sectionHead('Zikr va duolar', btn(`${ic('plus')} Qoʻshish`, 'dua-edit', '', 'primary sm'))}
    ${l.length ? `<ul class="list">${l.map(x => `<li class="li"><span class="li-t"><b>${esc(x.title || '')}</b>${x.ar ? `<br><span class="ar" lang="ar" dir="rtl">${esc(x.ar)}</span>` : ''}${x.text ? `<br><span class="sm">${esc(x.text)}</span>` : ''}${x.note ? `<br><span class="muted sm">${esc(x.note)}</span>` : ''}</span>${iconBtn('edit', 'dua-edit', `data-id="${x.id}"`, 'Tahrirlash')}</li>`).join('')}</ul>` : empty('Hali yozilmagan', 'Yodlayotgan duo va zikrlaringizni, maʼnosi va qachon oʻqilishi bilan yozib boring.')}
  </section>`;
}
ACT['dua-edit'] = el => {
  const id = el.dataset.id, l = D('faith').duas, x = l.find(d => d.id === id) || {};
  openModal({
    title: id ? 'Tahrirlash' : 'Zikr yoki duo',
    body: `${field('Nomi', inp('title', x.title, 'text', 'required placeholder="Masalan: Ertalabki zikr"'))}${field('Arabcha matn (ixtiyoriy)', area('ar', x.ar, 'dir="rtl" lang="ar"'))}${field('Oʻqilishi yoki maʼnosi', area('text', x.text))}${field('Eslatma', inp('note', x.note, 'text', 'placeholder="Qachon oʻqiladi"'))}`,
    danger: id ? { label: 'Oʻchirish', fn: () => { l.splice(l.indexOf(x), 1); save('faith'); } } : null,
    onSubmit: o => { if (!(o.title || '').trim()) return 'Nomini yozing.'; Object.assign(x, { title: o.title.trim(), ar: o.ar || '', text: o.text || '', note: o.note || '' }); if (!id) { x.id = uid(); l.push(x); } save('faith'); }
  });
};

function faithReflect() {
  const l = sortBy(allM('reflect'), r => r.date + (r.t || ''), -1);
  return `<section class="card">
    ${sectionHead('Shaxsiy mulohazalar', '<span class="muted sm">faqat siz koʻrasiz</span>')}
    <form data-form="reflect" class="stack"><textarea name="text" id="f-reflect" rows="3" placeholder="Bugun imonim haqida nimani sezdim? Nima uchun shukr qilaman?"></textarea><div class="row end"><button class="btn primary sm">Yozish</button></div><p class="ferr"></p></form>
    ${l.length ? `<ul class="entries">${l.slice(0, 40).map(r => `<li class="entry"><div class="row between"><span class="muted sm">${fmtDL(r.date)}</span>${iconBtn('trash', 'reflect-del', `data-id="${r.id}"`, 'Oʻchirish')}</div><p>${esc(r.text)}</p></li>`).join('')}</ul>` : ''}
  </section>`;
}
FORM.reflect = o => { const t = (o.text || '').trim(); if (!t) return 'Matn yozing.'; upsertM('reflect', { id: uid(), date: today(), t: nowISO(), text: t }); render(); };
ACT['reflect-del'] = el => { confirmBox('Bu mulohaza oʻchirilsinmi?', () => removeM('reflect', el.dataset.id)); };

function faithTimes() {
  const s = S(), c = s.prayerCalc, m = s.prayerManual, date = today();
  const calc = c.on && c.lat !== '' && c.lng !== '' ? prayerTimes(date, +c.lat, +c.lng, c.method, c.asr) : null;
  return `<div class="grid g2">
    <section class="card">
      ${sectionHead('Hisoblangan vaqtlar', '<span class="muted sm">ixtiyoriy</span>')}
      <p class="muted sm">Brauzer bu sahifaga joylashuvingizni bermaydi, shuning uchun koordinatalarni qoʻlda kiriting (xaritada joyingizni bosib, ikkita raqamni koʻchiring). Vaqt astronomik formula bilan hisoblanadi. Masjid jadvalidan bir-ikki daqiqa farq qilishi mumkin, shunday boʻlsa masjid jadvaliga amal qiling.</p>
      <form data-form="pt-calc" class="stack">
        <label class="cbx"><input type="checkbox" name="on" ${c.on ? 'checked' : ''}> Hisoblashni yoqish</label>
        <div class="fgrid">${field('Kenglik (latitude)', inp('lat', c.lat, 'text', 'inputmode="decimal" placeholder="37.55"'))}${field('Uzunlik (longitude)', inp('lng', c.lng, 'text', 'inputmode="decimal" placeholder="127.07"'))}</div>
        <div class="fgrid">${field('Hisob usuli', sel('method', Object.entries(PT_METHODS).map(([k, v]) => [k, v.name]), c.method))}${field('Asr', sel('asr', [['hanafi', 'Hanafiy (soya 2 baravar)'], ['shafi', 'Shofiiy (soya 1 baravar)']], c.asr))}</div>
        <div class="row end"><button class="btn primary sm">Saqlash</button></div><p class="ferr"></p>
      </form>
      ${calc ? `<div class="kv">${[['fajr', 'Bomdod'], ['sunrise', 'Quyosh chiqishi'], ['dhuhr', 'Peshin'], ['asr', 'Asr'], ['maghrib', 'Shom'], ['isha', 'Xufton']].map(([k, l]) => `<span>${l}</span><b class="mono">${calc[k] || '—'}</b>`).join('')}</div>` : ''}
    </section>
    <section class="card">
      ${sectionHead('Qoʻlda kiritilgan vaqtlar')}
      <p class="muted sm">Hisoblash oʻchiq boʻlsa, shu vaqtlar ishlatiladi (masalan masjid jadvalidan).</p>
      <form data-form="pt-manual" class="stack"><div class="fgrid">${PRAYERS.map(([k, l]) => field(l, inp('m-' + k, m[k], 'time'))).join('')}</div><div class="row end"><button class="btn sm">Saqlash</button></div></form>
    </section>
  </div>`;
}
FORM['pt-calc'] = o => {
  const on = !!o.on, lat = String(o.lat || '').trim(), lng = String(o.lng || '').trim();
  if (on && (lat === '' || lng === '' || isNaN(+lat) || isNaN(+lng))) return 'Kenglik va uzunlikni raqamda kiriting.';
  if (on && (Math.abs(+lat) > 66 || Math.abs(+lng) > 180)) return 'Koordinatalar notoʻgʻri koʻrinadi (kenglik ±66 gacha).';
  S().prayerCalc = { on, lat, lng, method: o.method, asr: o.asr }; save('settings'); toast('Saqlandi'); render();
};
FORM['pt-manual'] = o => { const m = {}; PRAYERS.forEach(([k]) => m[k] = o['m-' + k] || ''); S().prayerManual = m; save('settings'); toast('Saqlandi'); render(); };
