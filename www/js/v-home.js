'use strict';
/* Bosh sahifa: bugungi missiya, jadval, diqqat talab qiladigan ishlar, umumiy holat */

function greeting() { const h = new Date().getHours(); return h < 5 ? 'Xayrli tun' : h < 11 ? 'Xayrli tong' : h < 17 ? 'Xayrli kun' : 'Xayrli kech'; }
function nowISO() { const n = new Date(); return ds(n) + 'T' + mtime(n.getHours() * 60 + n.getMinutes()); }

function attentionList() {
  const t = today(), out = [];
  overdueTasks().slice(0, 5).forEach(x => out.push(['bad', `Vazifa muddati oʻtdi: ${esc(x.title)}`, dueText(x.due), 'plan']));
  D('academic').items.filter(i => !i.done && i.due && daysBetween(t, i.due) <= 3).sort((a, b) => a.due < b.due ? -1 : 1).forEach(i => {
    const c = D('courses').list.find(c => c.id === i.courseId);
    out.push([dueLevel(i.due) || 'warn', `${ACAD_TYPES[i.type] || 'Topshiriq'}: ${esc(i.title)}${c ? ' · ' + esc(c.name) : ''}`, dueText(i.due), 'uni']);
  });
  D('courses').list.forEach(c => { const a = attendanceStats(c); if (a.level !== 'ok') a.why.forEach(w => out.push([a.level, `${esc(c.name)}: ${esc(w)}`, '', 'uni'])); });
  billsDue(monthKey(t)).filter(b => !b.paid && daysBetween(t, b.date) <= 3).forEach(b => out.push([b.date < t ? 'bad' : 'warn', `Toʻlov: ${esc(b.name)} — ${won(b.amt)}`, dueText(b.date), 'money']));
  const mm = monthMoney(monthKey(t)), lim = num(D('money').impulseLimit);
  if (lim && mm.impulse > lim) out.push(['bad', `Impuls xarajatlar chegaradan oshdi: ${won(mm.impulse)} / ${won(lim)}`, '', 'money']);
  const dw = dueWords('ko').length + dueWords('en').length;
  if (dw) out.push(['mid', `${dw} ta soʻz takrorlashni kutmoqda`, '', 'lang']);
  return out;
}

function scheduleFor(date) {
  const items = [];
  classesToday(date).forEach(({ c, s }) => items.push({ t: s.s, e: s.e, k: 'Dars', title: c.name, sub: s.room || c.room || '', cls: 'uni' }));
  inMonth('shifts', monthKey(date)).filter(s => s.date === date && s.st !== 'absent').forEach(s => items.push({ t: s.s, e: s.e, k: 'Ish', title: D('work').job.name || 'Smena', sub: s.st === 'planned' ? 'rejada' : '', cls: 'work' }));
  tasksOn(date).filter(x => x.time).forEach(x => items.push({ t: x.time, k: 'Vazifa', title: x.title, sub: isDone(x, date) ? 'bajarildi' : '', cls: 'plan', done: isDone(x, date) }));
  const pt = prayerTimesFor(date);
  if (pt && S().prayers) PRAYERS.forEach(([k, l]) => { if (pt.t[k]) items.push({ t: pt.t[k], k: 'Namoz', title: l, sub: PRAYER_ST[(day(date).prayers || {})[k]] || '', cls: 'faith' }); });
  return items.sort((a, b) => (a.t || '99') < (b.t || '99') ? -1 : 1);
}

VIEWS.home = () => {
  const t = today(), s = S(), d = day(t);
  const life = lifeAreas();
  const mission = d.mission || [];
  const habits = habitsOn(t);
  const hDone = habits.filter(h => habitStatus(h, t) === 1).length;
  const att = attentionList();
  const sched = scheduleFor(t);
  const mm = monthMoney(monthKey(t));
  const week = lastN(7).map(x => ({ label: UZ_DS[dow(x)], value: dayScore(x) || 0 }));
  const ws = weekStats(weekStart(t));
  const streaks = activeHabits().map(h => ({ h, s: habitStreak(h) })).filter(x => x.s.cur > 0).sort((a, b) => b.s.cur - a.s.cur).slice(0, 4);
  const weak = activeHabits().map(h => ({ h, r: habitRate(h, 14) })).filter(x => x.r.total >= 3 && x.r.p < 0.6).sort((a, b) => a.r.p - b.r.p).slice(0, 3);
  const koT = langTarget('ko', t), enT = langTarget('en', t);
  const koW = wordsAdded('ko', t) + wordsReviewed('ko', t), enW = wordsAdded('en', t) + wordsReviewed('en', t);
  const sl = sleepOf(t);
  const allAtt = D('courses').list.map(attendanceStats).filter(a => a.pct !== null);
  const attPct = allAtt.length ? Math.round(avg(allAtt.map(a => a.pct))) : null;
  const nextDue = D('academic').items.filter(i => !i.done && i.due && i.due >= t).sort((a, b) => a.due < b.due ? -1 : 1)[0];
  const sc = dayScore(t);
  const suggestions = [...overdueTasks(), ...tasksOn(t).filter(x => !isDone(x, t) && +x.prio === 1)].filter(x => !mission.some(m => m.t === x.title)).slice(0, 3);

  return `
  <section class="hero">
    <div class="hero-l">
      <p class="eyebrow">${fmtDL(t)}${hijri(t) ? ' · ' + esc(hijri(t)) : ''}</p>
      <h2 class="hello">${greeting()}, ${esc(s.name || 'Behruz')}</h2>
      <p class="muted">${d.minimal ? 'Bugun minimal kun. Asosiy narsalarni qiling, qolgani ertaga.' : d.light ? 'Bugun yengil kun (uzun smena): til maqsadlari kamaytirildi.' : sc !== null ? `Bugungi ball: <b>${sc}</b>/100` : 'Kunni bitta kichik ishdan boshlang.'}</p>
      <div class="row wrap gap8">
        <button class="btn sm ${d.minimal ? 'primary' : 'ghost'}" data-act="toggle-minimal" aria-pressed="${!!d.minimal}">${ic('bolt')} Minimal kun</button>
        <button class="btn sm ${d.light ? 'primary' : 'ghost'}" data-act="toggle-light" aria-pressed="${!!d.light}">${ic('work')} Uzun smena kuni</button>
      </div>
    </div>
    <div class="hero-r">
      ${ring(life.overall ?? 0, life.overall === null ? '—' : life.overall + '%', 'hayot balansi · 7 kun')}
      <div class="areas">${life.areas.map(([n, v]) => `<div class="area-r"><span>${n}</span>${bar(v === null ? 0 : v * 100, v === null ? 'na' : '')}<span class="mono">${v === null ? '—' : Math.round(v * 100) + '%'}</span></div>`).join('')}</div>
    </div>
  </section>

  <div class="grid g2">
    <section class="card mission">
      ${sectionHead('Bugungi missiya', `<span class="muted sm">${mission.filter(m => m.done).length}/${mission.length || 0} · koʻpi bilan 3 ta</span>`)}
      ${mission.length ? `<ul class="list">${mission.map((m, i) => `<li class="li">${check(m.done ? 1 : undefined, 'mission-toggle', `data-i="${i}"`, m.t)}<span class="li-t ${m.done ? 'done' : ''}">${esc(m.t)}</span>${iconBtn('trash', 'mission-del', `data-i="${i}"`, 'Oʻchirish')}</li>`).join('')}</ul>` : `<p class="muted">Bugun eng muhim 3 ta ishni yozing. Hammasi emas, faqat eng muhimi.</p>`}
      ${mission.length < 3 ? `<form data-form="mission" class="inline-form"><input name="t" id="f-mission" placeholder="Masalan: Algoritmlar uy vazifasini topshirish" maxlength="120" aria-label="Missiya"><button class="btn primary">${ic('plus')} Qoʻshish</button><p class="ferr"></p></form>` : ''}
      ${mission.length < 3 && suggestions.length ? `<div class="sugg"><span class="muted sm">Tavsiya:</span>${suggestions.map(x => `<button class="chip btnchip" data-act="mission-from" data-t="${esc(x.title)}">${esc(x.title)}</button>`).join('')}</div>` : ''}
    </section>

    ${d.minimal ? `<section class="card">
      ${sectionHead('Minimal kun roʻyxati', btn('Tahrirlash', 'go', 'data-v="plan"', 'sm ghost'))}
      <ul class="list">${s.minimum.map(m => `<li class="li">${check((d.minDone || {})[m.id] ? 1 : undefined, 'min-toggle', `data-id="${m.id}"`, m.t)}<span class="li-t ${(d.minDone || {})[m.id] ? 'done' : ''}">${esc(m.t)}</span></li>`).join('')}</ul>
      <p class="muted sm">Shularni bajarsangiz, kun muvaffaqiyatli hisoblanadi (kamida 60 ball).</p>
    </section>` : `<section class="card">
      ${sectionHead('Diqqat talab qiladi', att.length ? chip(att.length, 'bad') : '')}
      ${att.length ? `<ul class="alerts">${att.slice(0, 7).map(([lv, txt, when, v]) => `<li class="al ${lv}"><button class="al-b" data-act="go" data-v="${v}"><span>${txt}</span>${when ? `<em>${when}</em>` : ''}</button></li>`).join('')}</ul>` : `<p class="muted">Shoshilinch ish yoʻq. Muddatlar, toʻlovlar va davomat ogohlantirishlari shu yerda chiqadi.</p>`}
    </section>`}
  </div>

  <div class="grid g2">
    <section class="card">
      ${sectionHead('Bugungi jadval', btn('Reja', 'go', 'data-v="plan"', 'sm ghost'))}
      ${sched.length ? `<ul class="timeline">${sched.map(x => `<li class="tl ${x.cls} ${x.done ? 'done' : ''}"><span class="tl-t mono">${x.t || '—'}${x.e ? '–' + x.e : ''}</span><span class="tl-k">${x.k}</span><span class="tl-n">${esc(x.title)}${x.sub ? ` <em>${esc(x.sub)}</em>` : ''}</span></li>`).join('')}</ul>` : `<p class="muted">Bugun uchun dars, smena yoki vaqtli vazifa yoʻq. Ularni Universitet, Ish va Reja boʻlimlarida qoʻshasiz.</p>`}
    </section>
    <section class="card">
      ${sectionHead('Odatlar', `<span class="mono">${hDone}/${habits.length}</span>`)}
      ${habits.length ? `${bar(pct(hDone, habits.length))}<ul class="list compact">${habits.map(h => { const st = habitStatus(h, t); return `<li class="li">${check(st, 'habit-tick', `data-id="${h.id}" data-d="${t}"`, h.name)}<span class="li-t ${st === 1 ? 'done' : ''}">${esc(h.name)}</span>${h.link ? `<span class="tag">avto</span>` : ''}</li>`; }).join('')}</ul>` : empty('Bugun odat yoʻq', 'Odatlar boʻlimida odat qoʻshing.', btn('Odatlarga oʻtish', 'go', 'data-v="habits"', 'sm'))}
    </section>
  </div>

  <div class="tiles">
    <button class="tile" data-act="go" data-v="uni"><span class="tile-k">${ic('uni')} Universitet</span><b>${attPct === null ? '—' : attPct + '%'}</b><span>davomat${nextDue ? ` · keyingi: ${esc(nextDue.title)} (${dueText(nextDue.due)})` : ''}</span></button>
    <button class="tile" data-act="go" data-v="lang"><span class="tile-k">${ic('lang')} Koreys</span><b>${koW}/${koT.words}</b><span>soʻz bugun · ${langMinutes('ko', t)} daq</span></button>
    <button class="tile" data-act="go" data-v="lang"><span class="tile-k">${ic('lang')} Ingliz</span><b>${enW}/${enT.words}</b><span>soʻz bugun · ${langMinutes('en', t)} daq</span></button>
    <button class="tile" data-act="go" data-v="money"><span class="tile-k">${ic('money')} Shu oy</span><b class="${mm.saved < 0 ? 'neg' : ''}">${won(mm.saved)}</b><span>+${won(mm.inc)} / −${won(mm.out)}</span></button>
    <button class="tile" data-act="go" data-v="faith"><span class="tile-k">${ic('faith')} Namoz</span><b>${prayersDone(t)}/5</b><span>${d.quran ? d.quran + ' sahifa Qurʼon' : 'Qurʼon hali belgilanmagan'}</span></button>
    <button class="tile" data-act="go" data-v="fit"><span class="tile-k">${ic('fit')} Tana</span><b>${sl && sleepDur(sl) ? hrs(sleepDur(sl)) : '—'}</b><span>uyqu · suv ${d.water || 0}/${s.water} · ${inMonth('workouts', monthKey(t)).some(w => w.date === t) ? 'mashq bor' : d.rest ? 'dam olish kuni' : 'mashq yoʻq'}</span></button>
  </div>

  <div class="grid g2">
    <section class="card">
      ${sectionHead('Hafta', `<span class="muted sm">kunlik ball</span>`)}
      ${week.some(w => w.value) ? barChart(week, { h: 150, max: 100, fmt: v => Math.round(v) }) : `<p class="muted">Odat, namoz yoki missiyani belgilaganingizda grafik paydo boʻladi.</p>`}
      <div class="kv">
        <span>Odatlar</span><b>${ws.hTotal ? pct(ws.hDone, ws.hTotal) + '%' : '—'}</b>
        <span>Darslar</span><b>${ws.attTotal ? `${ws.attP}/${ws.attTotal}` : '—'}</b>
        <span>Vazifalar</span><b>${ws.tasksDone}</b>
        <span>Mashq</span><b>${ws.workouts}</b>
      </div>
    </section>
    <section class="card">
      ${sectionHead('Seriyalar')}
      ${streaks.length ? `<ul class="list compact">${streaks.map(x => `<li class="li">${ic('flame', 'fl')}<span class="li-t">${esc(x.h.name)}</span><b class="mono">${x.s.cur} kun</b></li>`).join('')}</ul>` : `<p class="muted">Hali seriya yoʻq. Bir odatni ikki kun ketma-ket bajaring, seriya boshlanadi.</p>`}
      ${weak.length ? `<h4 class="sub">Yaxshilash kerak (14 kun)</h4><ul class="list compact">${weak.map(x => `<li class="li"><span class="li-t">${esc(x.h.name)}</span><span class="mono">${Math.round(x.r.p * 100)}%</span></li>`).join('')}</ul><p class="muted sm">Qoida: bir kun oʻtkazib yuborish mumkin, ikki kun ketma-ket emas.</p>` : ''}
    </section>
  </div>`;
};

/* missiya */
FORM.mission = (o, f) => {
  const t = (o.t || '').trim();
  if (!t) return 'Missiya matnini yozing.';
  const d = day(today());
  if ((d.mission || []).length >= 3) return 'Koʻpi bilan 3 ta. Avval bittasini oʻchiring.';
  setDay(today(), x => { (x.mission = x.mission || []).push({ id: uid(), t, done: false }); });
  render();
};
ACT['mission-from'] = el => { if ((day(today()).mission || []).length >= 3) return toast('Koʻpi bilan 3 ta missiya'); setDay(today(), x => { (x.mission = x.mission || []).push({ id: uid(), t: el.dataset.t, done: false }); }); render(); };
ACT['mission-toggle'] = el => { setDay(today(), x => { const m = x.mission[+el.dataset.i]; m.done = !m.done; }); render(); };
ACT['mission-del'] = el => { setDay(today(), x => { x.mission.splice(+el.dataset.i, 1); }); render(); };
ACT['toggle-minimal'] = () => { setDay(today(), x => { x.minimal = !x.minimal; }); render(); };
ACT['toggle-light'] = () => { setDay(today(), x => { x.light = !x.light; }); render(); };
ACT['min-toggle'] = el => { setDay(today(), x => { x.minDone = x.minDone || {}; x.minDone[el.dataset.id] = !x.minDone[el.dataset.id]; }); render(); };
