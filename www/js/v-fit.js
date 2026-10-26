'use strict';
/* Sport va sogʻliq: kunlik suv/yurish/ovqat, mashqlar va rekordlar, tana oʻlchamlari, uyqu, dam olish */

VIEWS.fit = () => {
  const tab = curTab('fit', 'today');
  return tabs('fit', [['today', 'Bugun'], ['workout', 'Mashqlar'], ['body', 'Tana'], ['sleep', 'Uyqu'], ['plan', 'Reja va maqsad']]) +
    ({ today: fitToday, workout: fitWorkout, body: fitBody, sleep: fitSleep, plan: fitPlan }[tab] || fitToday)();
};

function fitToday() {
  const date = selDate('fit'), d = day(date), s = S();
  const meals = d.meals || [], prot = sum(meals, m => m.p);
  const wo = inMonth('workouts', monthKey(date)).filter(w => w.date === date);
  const plan = (D('fitness').plan || {})[dow(date)];
  return `<div class="row between wrap gap8">${dateNav('fit', date)}<button class="btn sm ${d.rest ? 'primary' : 'ghost'}" data-act="fit-rest" data-d="${date}">${ic('moon')} Dam olish kuni${d.rest ? ': ha' : ''}</button></div>
  <div class="grid g3">
    <section class="card">
      ${sectionHead('Suv', `<span class="mono">${d.water || 0}/${s.water} stakan</span>`)}
      <div class="water">${Array.from({ length: Math.max(s.water, d.water || 0) }, (_, i) => `<button class="wg ${i < (d.water || 0) ? 'on' : ''}" data-act="water" data-d="${date}" data-n="${i + 1}" aria-label="${i + 1} stakan">${ic('drop')}</button>`).join('')}</div>
      <div class="row gap8">${btn('−1', 'water-step', `data-d="${date}" data-n="-1"`, 'sm ghost')}${btn('+1 stakan', 'water-step', `data-d="${date}" data-n="1"`, 'sm')}</div>
      <p class="muted sm">1 stakan ≈ 250 ml</p>
    </section>
    <section class="card">
      ${sectionHead('Harakat')}
      <form data-form="fit-move" class="stack" data-d="${date}">
        <div class="fgrid">${field('Yurish (daq)', inp('walk', d.walk ?? '', 'number', 'min="0" max="600"'))}${field('Qadamlar', inp('steps', d.steps ?? '', 'number', 'min="0" max="100000"'), s.steps ? `maqsad ${s.steps}` : '')}</div>
        <button class="btn sm">Saqlash</button><p class="ferr"></p>
      </form>
      ${wo.length ? `<p>${ic('fit')} ${wo.map(w => esc(w.name)).join(', ')}</p>` : `<p class="muted">${plan ? `Bugungi reja: <b>${esc(plan)}</b>` : 'Bugun mashq yozilmagan.'}</p>`}
      ${btn(`${ic('plus')} Mashq yozish`, 'wo-edit', `data-d="${date}"`, 'sm ghost')}
    </section>
    <section class="card">
      ${sectionHead('Ovqat va oqsil', `<span class="mono">${prot}${s.protein ? '/' + s.protein : ''} g</span>`)}
      ${s.protein ? bar(pct(prot, s.protein)) : ''}
      ${meals.length ? `<ul class="list compact">${meals.map((m, i) => `<li class="li"><span class="li-t">${esc(m.t)}</span><span class="mono sm">${m.p || 0} g</span>${iconBtn('trash', 'meal-del', `data-d="${date}" data-i="${i}"`, 'Oʻchirish')}</li>`).join('')}</ul>` : '<p class="muted sm">Ovqat yozilmagan.</p>'}
      <form data-form="meal" class="inline-form" data-d="${date}"><input name="t" id="f-meal" placeholder="Masalan: tovuq, guruch" aria-label="Ovqat"><input name="p" id="f-mealp" type="number" min="0" max="300" placeholder="Oqsil g" aria-label="Oqsil, gramm"><button class="btn sm">${ic('plus')}</button><p class="ferr"></p></form>
    </section>
  </div>`;
}
ACT.water = el => { const n = +el.dataset.n; setDay(el.dataset.d, d => { d.water = d.water === n ? n - 1 : n; }); render(); };
ACT['water-step'] = el => { setDay(el.dataset.d, d => { d.water = Math.max(0, (d.water || 0) + +el.dataset.n); }); render(); };
ACT['fit-rest'] = el => { setDay(el.dataset.d, d => { d.rest = !d.rest; }); render(); };
FORM['fit-move'] = (o, f) => { if (num(o.walk) < 0 || num(o.steps) < 0) return 'Manfiy son boʻlmaydi.'; setDay(f.dataset.d, d => { if (o.walk !== '') d.walk = num(o.walk); else delete d.walk; if (o.steps !== '') d.steps = num(o.steps); else delete d.steps; }); toast('Saqlandi'); render(); };
FORM.meal = (o, f) => { const t = (o.t || '').trim(); if (!t) return 'Nima yeganingizni yozing.'; setDay(f.dataset.d, d => { (d.meals = d.meals || []).push({ t, p: num(o.p) }); }); render(); };
ACT['meal-del'] = el => { setDay(el.dataset.d, d => { d.meals.splice(+el.dataset.i, 1); }); render(); };

function personalRecords() {
  const pr = {};
  allM('workouts').forEach(w => (w.ex || []).forEach(e => {
    const kg = num(e.kg), reps = num(e.reps); if (!e.n) return;
    const k = e.n.trim().toLowerCase(), est = kg ? kg * (1 + reps / 30) : 0;
    if (!pr[k] || kg > pr[k].kg || (kg === pr[k].kg && reps > pr[k].reps)) pr[k] = { name: e.n.trim(), kg, reps, date: w.date, est: Math.max(est, pr[k]?.est || 0) };
    else pr[k].est = Math.max(pr[k].est, est);
  }));
  return Object.values(pr).sort((a, b) => b.kg - a.kg);
}
function fitWorkout() {
  const list = sortBy(allM('workouts'), w => w.date, -1);
  const pr = personalRecords();
  const weeks = [-7, -6, -5, -4, -3, -2, -1, 0].map(n => weekStart(addDays(today(), n * 7))).map(w => ({ label: fmtD(w).split('-')[0] + '/' + (+w.slice(5, 7)), value: list.filter(x => x.date >= w && x.date <= addDays(w, 6)).length }));
  return `<div class="grid g2">
    <section class="card">
      ${sectionHead('Mashgʻulotlar', btn(`${ic('plus')} Mashq`, 'wo-edit', '', 'primary sm'))}
      ${list.length ? `<ul class="list">${list.slice(0, 30).map(w => `<li class="li"><span class="li-t"><b>${esc(w.name)}</b> <span class="muted sm">${fmtD(w.date)}${w.dur ? ' · ' + w.dur + ' daq' : ''}</span><br><span class="sm">${(w.ex || []).map(e => `${esc(e.n)} ${e.sets}×${e.reps}${num(e.kg) ? ' @' + e.kg + 'kg' : ''}`).join(' · ')}</span></span>${iconBtn('edit', 'wo-edit', `data-id="${w.id}"`, 'Tahrirlash')}</li>`).join('')}</ul>` : empty('Mashq yozilmagan', 'Har bir mashgʻulotda qilgan mashqlaringizni yozing: nomi, set, takror va vazn.')}
    </section>
    <div class="stack">
      <section class="card">${sectionHead('Haftalik mashgʻulotlar')}${barChart(weeks, { h: 130, target: S().workoutDays.length || null, fmt: v => Math.round(v) })}</section>
      <section class="card">${sectionHead('Shaxsiy rekordlar')}
        ${pr.length ? `<div class="tbl-w"><table class="tbl"><thead><tr><th>Mashq</th><th>Eng ogʻir</th><th>Taxminiy 1RM</th><th>Sana</th></tr></thead><tbody>${pr.map(p => `<tr><td>${esc(p.name)}</td><td class="mono">${p.kg ? p.kg + ' kg × ' + p.reps : p.reps + ' takror'}</td><td class="mono">${p.est ? Math.round(p.est) + ' kg' : '—'}</td><td>${fmtD(p.date)}</td></tr>`).join('')}</tbody></table></div><p class="muted sm">1RM (bir martalik maksimum) Epley formulasi bilan taxminan hisoblanadi. Uni sinab koʻrish shart emas.</p>` : '<p class="muted">Vaznli mashq yozilsa, rekordlar shu yerda chiqadi.</p>'}
      </section>
    </div>
  </div>`;
}
ACT['wo-edit'] = el => {
  const id = el.dataset.id, w = id ? findM('workouts', id) : { date: el.dataset.d || today(), name: (D('fitness').plan || {})[dow(el.dataset.d || today())] || '', ex: [] };
  const rows = Math.max(6, (w.ex || []).length + 2);
  openModal({
    title: id ? 'Mashqni tahrirlash' : 'Mashq yozish', wide: true,
    body: `<div class="fgrid">${field('Nomi', inp('name', w.name, 'text', 'required placeholder="Koʻkrak va yelka"'))}${field('Sana', inp('date', w.date, 'date', 'required'))}${field('Davomiyligi (daq)', inp('dur', w.dur, 'number', 'min="0" max="300"'))}</div>
    <p class="muted sm">Mashqlar: nomi, setlar soni, takrorlar, vazn (kg, ixtiyoriy)</p>
    ${Array.from({ length: rows }, (_, k) => { const e = (w.ex || [])[k] || {}; return `<div class="fgrid ex-r">${inp('en' + k, e.n, 'text', 'placeholder="Mashq" aria-label="Mashq nomi"')}${inp('es' + k, e.sets, 'number', 'placeholder="Set" min="0" aria-label="Setlar"')}${inp('er' + k, e.reps, 'number', 'placeholder="Takror" min="0" aria-label="Takrorlar"')}${inp('ek' + k, e.kg, 'number', 'placeholder="kg" min="0" step="0.5" aria-label="Vazn"')}</div>`; }).join('')}
    ${field('Izoh (his-tuygʻu, ogʻriq)', inp('note', w.note))}`,
    danger: id ? { label: 'Oʻchirish', fn: () => removeM('workouts', id) } : null,
    onSubmit: o => {
      if (!(o.name || '').trim() || !o.date) return 'Nomi va sanasini kiriting.';
      const ex = Object.keys(o).filter(k => /^en\d+$/.test(k)).map(k => k.slice(2)).map(k => ({ n: (o['en' + k] || '').trim(), sets: num(o['es' + k]), reps: num(o['er' + k]), kg: (o['ek' + k] ?? '') === '' ? '' : num(o['ek' + k]) })).filter(e => e.n);
      if (ex.some(e => !e.sets || !e.reps)) return 'Har bir mashq uchun set va takror sonini kiriting.';
      upsertM('workouts', Object.assign(w, { id: w.id || uid(), name: o.name.trim(), date: o.date, dur: num(o.dur), ex, note: o.note || '' }));
    }
  });
};

function fitBody() {
  const list = sortBy(allM('body'), b => b.date);
  const g = S().weightGoal;
  const last = list[list.length - 1], first = list[0];
  return `<div class="tiles">
    <div class="tile static"><span class="tile-k">Hozirgi vazn</span><b>${last && last.kg ? last.kg + ' kg' : '—'}</b><span>${last ? fmtD(last.date) : ''}</span></div>
    <div class="tile static"><span class="tile-k">Oʻzgarish</span><b>${first && last && first.kg && last.kg && first !== last ? (last.kg - first.kg > 0 ? '+' : '') + (last.kg - first.kg).toFixed(1) + ' kg' : '—'}</b><span>${first ? fmtD(first.date) + ' dan beri' : ''}</span></div>
    <div class="tile static"><span class="tile-k">Maqsad</span><b>${g ? g + ' kg' : '—'}</b><span>${g && last && last.kg ? Math.abs(last.kg - g).toFixed(1) + ' kg qoldi' : 'Reja boʻlimida belgilang'}</span></div>
  </div>
  <section class="card">
    ${sectionHead('Vazn', btn(`${ic('plus')} Oʻlchov`, 'body-edit', '', 'primary sm'))}
    ${list.filter(b => b.kg).length > 1 ? lineChart(list.filter(b => b.kg).map(b => ({ x: fmtD(b.date), y: num(b.kg) })), { h: 180, goal: g || null, fmt: v => v.toFixed(1) }) : '<p class="muted">Kamida ikki marta vazn kiritilsa, grafik chiqadi. Haftasiga bir marta, bir xil vaqtda (masalan ertalab) oʻlchash yetarli.</p>'}
    ${list.length ? `<div class="tbl-w"><table class="tbl"><thead><tr><th>Sana</th><th>Vazn</th><th>Bel</th><th>Koʻkrak</th><th>Qoʻl</th><th></th></tr></thead><tbody>${[...list].reverse().map(b => `<tr><td>${fmtD(b.date)}</td><td class="mono">${b.kg || '—'}</td><td class="mono">${b.waist || '—'}</td><td class="mono">${b.chest || '—'}</td><td class="mono">${b.arm || '—'}</td><td>${iconBtn('edit', 'body-edit', `data-id="${b.id}"`, 'Tahrirlash')}</td></tr>`).join('')}</tbody></table></div>` : ''}
    <p class="muted sm">Sogʻlom tezlik: haftasiga taxminan 0.25–0.75 kg. Kuchli parhez va tez natija vaʼdalaridan saqlaning.</p>
  </section>`;
}
ACT['body-edit'] = el => {
  const id = el.dataset.id, b = id ? findM('body', id) : { date: today() };
  openModal({
    title: id ? 'Oʻlchovni tahrirlash' : 'Tana oʻlchovi',
    body: `<div class="fgrid">${field('Sana', inp('date', b.date, 'date', 'required'))}${field('Vazn (kg)', inp('kg', b.kg, 'number', 'min="30" max="250" step="0.1"'))}</div><div class="fgrid">${field('Bel (sm)', inp('waist', b.waist, 'number', 'step="0.5"'))}${field('Koʻkrak (sm)', inp('chest', b.chest, 'number', 'step="0.5"'))}${field('Qoʻl (sm)', inp('arm', b.arm, 'number', 'step="0.5"'))}</div>`,
    danger: id ? { label: 'Oʻchirish', fn: () => removeM('body', id) } : null,
    onSubmit: o => {
      if (!o.date) return 'Sanani tanlang.';
      if (!o.kg && !o.waist && !o.chest && !o.arm) return 'Kamida bitta oʻlchovni kiriting.';
      if (o.kg && (num(o.kg) < 30 || num(o.kg) > 250)) return 'Vazn 30–250 kg oraligʻida boʻlsin.';
      upsertM('body', Object.assign(b, { id: b.id || uid(), date: o.date, kg: o.kg ? num(o.kg) : '', waist: o.waist ? num(o.waist) : '', chest: o.chest ? num(o.chest) : '', arm: o.arm ? num(o.arm) : '' }));
    }
  });
};

function fitSleep() {
  const date = selDate('sleep'), sl = sleepOf(date) || {}, s = S();
  const days = lastN(14);
  const pts = days.map(d => { const x = sleepOf(d); const dur = sleepDur(x); return { x: +d.slice(8) + '', y: dur ? +(dur / 60).toFixed(1) : null }; });
  const logged = days.map(sleepOf).filter(x => x && x.bed && x.wake);
  const beds = logged.map(x => { const b = tmin(x.bed); return b < 720 ? b + 1440 : b; });
  const sd = beds.length > 1 ? Math.sqrt(avg(beds.map(b => (b - avg(beds)) ** 2))) : null;
  const q = logged.filter(x => x.q).map(x => +x.q);
  return `<div class="grid g2">
    <section class="card">
      <div class="row between wrap gap8">${dateNav('sleep', date)}</div>
      <p class="muted sm">Shu kuni ertalab uygʻongan uyquni yozing (kecha yotgan vaqt → bugun turgan vaqt).</p>
      <form data-form="sleep" class="stack" data-d="${date}">
        <div class="fgrid">${field('Yotdim', inp('bed', sl.bed, 'time'), `maqsad ${s.sleep}`)}${field('Turdim', inp('wake', sl.wake, 'time'), `maqsad ${s.wake}`)}${field('Sifat (1–5)', sel('q', [['', '—'], '1', '2', '3', '4', '5'], sl.q || ''))}</div>
        ${field('Izoh', inp('note', sl.note, 'text', 'placeholder="Kech telefon, kofe, smena…"'))}
        <div class="row between wrap gap8"><span class="mono">${sleepDur(sl) ? hrs(sleepDur(sl)) : ''}</span><button class="btn primary sm">Saqlash</button></div><p class="ferr"></p>
      </form>
    </section>
    <section class="card">
      ${sectionHead('14 kun')}
      ${pts.some(p => p.y) ? lineChart(pts, { h: 160, goal: s.sleepHours, fmt: v => v.toFixed(1) + 's' }) : '<p class="muted">Uyqu yozilganda grafik chiqadi.</p>'}
      <div class="kv"><span>Oʻrtacha</span><b>${logged.length ? hrs(avg(logged.map(sleepDur))) : '—'}</b><span>Vaqtida yotdim</span><b>${days.filter(d => sleptOnTime(d) === 1).length}/${days.filter(d => sleptOnTime(d) !== null).length}</b><span>Barqarorlik</span><b>${sd === null ? '—' : sd <= 30 ? 'yaxshi (±' + Math.round(sd) + ' daq)' : 'oʻzgaruvchan (±' + Math.round(sd) + ' daq)'}</b><span>Sifat</span><b>${q.length ? avg(q).toFixed(1) + '/5' : '—'}</b></div>
    </section>
  </div>`;
}
FORM.sleep = (o, f) => {
  if (!o.bed && !o.wake) return 'Yotgan yoki turgan vaqtni kiriting.';
  setDay(f.dataset.d, d => { d.sleep = { bed: o.bed || '', wake: o.wake || '', q: o.q || '', note: o.note || '' }; });
  toast('Uyqu saqlandi'); render();
};

function fitPlan() {
  const s = S(), plan = D('fitness').plan || {};
  return `<section class="card">
    ${sectionHead('Mashq jadvali va maqsadlar')}
    <form data-form="fit-plan" class="stack">
      ${WEEK_ORDER.map(d => field(UZ_DAYS[d], inp('p' + d, plan[d] || '', 'text', 'placeholder="Dam olish yoki mashq nomi, masalan: Oyoq + 20 daq yurish"'))).join('')}
      <div class="fgrid">${field('Maqsad vazn (kg)', inp('weightGoal', s.weightGoal ?? '', 'number', 'min="30" max="250" step="0.1"'))}${field('Kunlik oqsil (g)', inp('protein', s.protein || '', 'number', 'min="0" max="300"'))}${field('Kunlik suv (stakan)', inp('water', s.water, 'number', 'min="1" max="20"'))}${field('Kunlik qadam', inp('steps', s.steps || '', 'number', 'min="0" max="40000"'))}${field('Uyqu (soat)', inp('sleepHours', s.sleepHours, 'number', 'min="4" max="12" step="0.5"'))}</div>
      <div class="row end"><button class="btn primary">Saqlash</button></div><p class="ferr"></p>
    </form>
    <p class="muted sm">Mashq qilinadigan kunlar (jadvalda “dam” soʻzi boʻlmagan kunlar) haftalik maqsad sifatida hisoblanadi. Agar kasal yoki charchagan boʻlsangiz, “Dam olish kuni” tugmasini bosing: bu muvaffaqiyatsizlik emas.</p>
  </section>`;
}
FORM['fit-plan'] = o => {
  const s = S(), plan = {};
  WEEK_ORDER.forEach(d => { const v = (o['p' + d] || '').trim(); if (v) plan[d] = v; });
  if (o.water && (num(o.water) < 1 || num(o.water) > 20)) return 'Suv 1–20 stakan oraligʻida.';
  D('fitness').plan = plan;
  s.workoutDays = WEEK_ORDER.filter(d => plan[d] && !/dam/i.test(plan[d]));
  Object.assign(s, { weightGoal: o.weightGoal ? num(o.weightGoal) : null, protein: num(o.protein), water: num(o.water) || 8, steps: num(o.steps), sleepHours: num(o.sleepHours) || 7.5 });
  save('fitness'); save('settings'); toast('Saqlandi'); render();
};
