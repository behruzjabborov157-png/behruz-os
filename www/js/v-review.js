'use strict';
/* Sharh va oʻsish: haftalik va oylik sharh (saqlangan maʼlumotdan haqiqiy statistika), kundalik, maqsadlar, orzular taxtasi, yutuqlar */

const VISION_AREAS = ['Imon', 'Bilim', 'Sogʻliq', 'Moliya', 'Karyera', 'Oila', 'Shaxsiyat'];

VIEWS.review = () => {
  const tab = curTab('review', 'week');
  return tabs('review', [['week', 'Haftalik sharh'], ['month', 'Oylik sharh'], ['journal', 'Kundalik'], ['goals', 'Maqsadlar'], ['vision', 'Orzular taxtasi'], ['xp', 'Yutuqlar']]) +
    ({ week: revWeek, month: revMonth, journal: revJournal, goals: revGoals, vision: revVision, xp: revXP }[tab] || revWeek)();
};

function weekKey(start) { return start; }
function revWeek() {
  const ref = APP.sel.rweek || today(), start = weekStart(ref), end = addDays(start, 6);
  const w = weekStats(start), g = D('growth'), saved = g.weekly[weekKey(start)] || {};
  const nextP = saved.next || ['', '', ''];
  const sleepStr = w.sleepAvg ? `${hrs(w.sleepAvg)} oʻrtacha · ${w.onTime}/${w.sleepLogged} kecha vaqtida` : 'yozilmagan';
  const doneMission = sum(w.days, d => (day(d).mission || []).filter(m => m.done).length), allMission = sum(w.days, d => (day(d).mission || []).length);
  return `<div class="row between wrap gap8"><div class="datenav"><button class="ibtn" data-act="rwnav" data-n="-7" aria-label="Oldingi hafta">${ic('left')}</button><span class="dn-l">${fmtD(start)} – ${fmtD(end)}</span><button class="ibtn" data-act="rwnav" data-n="7" ${start >= weekStart(today()) ? 'disabled' : ''} aria-label="Keyingi hafta">${ic('right')}</button></div>${saved.savedAt ? chip('Sharh yozilgan', 'ok') : chip('Sharh yozilmagan', 'ghostchip')}</div>
  <section class="card">
    ${sectionHead('Raqamlar', '<span class="muted sm">faqat siz kiritgan maʼlumotlardan</span>')}
    <div class="qa">
      <div><b>Nimalarga erishdim?</b><p>${w.tasksDone} ta vazifa · ${doneMission}/${allMission} missiya · ${w.hTotal ? pct(w.hDone, w.hTotal) + '% odatlar' : 'odatlar belgilanmagan'} · oʻrtacha kun bali ${w.avgScore ?? '—'}</p></div>
      <div><b>Qaysi odatlarni koʻp oʻtkazdim?</b><p>${w.topMiss.length ? w.topMiss.map(x => `${esc(x.h.name)} (${x.n} marta)`).join(', ') : 'Oʻtkazilgan odat yoʻq yoki belgilanmagan'}</p></div>
      <div><b>Nechta darsda qatnashdim?</b><p>${w.attTotal ? `${w.attP}/${w.attTotal} (${pct(w.attP, w.attTotal)}%)${w.attAbs ? ` · ${w.attAbs} ta qoldirildi` : ''}` : 'Davomat belgilanmagan'}</p></div>
      <div><b>Qancha topdim, sarfladim, jamgʻardim?</b><p>+${won(w.inc)} · −${won(w.out)} · ${won(w.saved)}${w.impulse ? ` · impuls ${won(w.impulse)}` : ''}</p></div>
      <div><b>Tillarni qanchalik izchil oʻrgandim?</b><p>Koreys: ${w.langDays.ko}/7 kun, ${w.langMin.ko} daq, ${w.words.ko} yangi soʻz · Ingliz: ${w.langDays.en}/7 kun, ${w.langMin.en} daq, ${w.words.en} yangi soʻz</p></div>
      <div><b>Uyqu va sport?</b><p>Uyqu: ${sleepStr} · ${w.workouts} ta mashgʻulot</p></div>
      <div><b>Eng koʻp vaqtni nima oldi?</b><p>${w.topWaste ? `${w.topWaste[0]}: ${hrs(w.topWaste[1])}` : 'Ekran vaqti yozilmagan'}</p></div>
      ${S().prayers ? `<div><b>Namoz</b><p>${w.prayerDays ? `${w.prayers}/${w.prayerDays * 5} (${pct(w.prayers, w.prayerDays * 5)}%)` : 'belgilanmagan'}</p></div>` : ''}
    </div>
  </section>
  <section class="card">
    ${sectionHead('Oʻz soʻzlarim bilan')}
    <form data-form="rev-week" class="stack" data-k="${weekKey(start)}">
      ${field('Bu hafta nimadan faxrlanaman?', area('wins', saved.wins))}
      ${field('Nima xalaqit berdi? Nimani oʻrgandim?', area('lessons', saved.lessons))}
      <fieldset class="fs"><legend>Keyingi haftaning 3 ta eng muhim ishi</legend>${[0, 1, 2].map(i => inp('n' + i, nextP[i], 'text', `placeholder="${i + 1}." aria-label="${i + 1}-ustuvor ish"`)).join('')}</fieldset>
      <label class="cbx"><input type="checkbox" name="toTasks"> Bu 3 ta ishni keyingi haftaning dushanbasiga vazifa sifatida qoʻshish</label>
      <div class="row end"><button class="btn primary">Sharhni saqlash</button></div><p class="ferr"></p>
    </form>
  </section>`;
}
ACT.rwnav = el => { APP.sel.rweek = addDays(APP.sel.rweek || today(), +el.dataset.n); if (APP.sel.rweek > today()) APP.sel.rweek = today(); render(); };
FORM['rev-week'] = (o, f) => {
  const next = [o.n0, o.n1, o.n2].map(x => (x || '').trim());
  if (!(o.wins || '').trim() && !(o.lessons || '').trim() && !next.some(Boolean)) return 'Kamida bitta maydonni toʻldiring.';
  const g = D('growth'), k = f.dataset.k, prev = g.weekly[k] || {};
  g.weekly[k] = { wins: o.wins || '', lessons: o.lessons || '', next, savedAt: nowISO(), tasked: prev.tasked };
  if (o.toTasks && !prev.tasked) { const mon = addDays(k, 7); next.filter(Boolean).forEach(t => D('tasks').list.push({ id: uid(), title: t, cat: 'Shaxsiy', prio: 1, due: mon, time: '', est: '', recur: 'none', done: false, doneDates: [], created: nowISO() })); g.weekly[k].tasked = true; save('tasks'); }
  save('growth'); toast('Haftalik sharh saqlandi'); render();
};

function revMonth() {
  const mk = selMonth('rmonth'), days = monthDays(mk).filter(d => d <= today());
  const g = D('growth'), saved = g.monthly[mk] || {};
  const mm = monthMoney(mk), mp = monthPay(mk);
  const scores = days.map(dayScore).filter(v => v !== null);
  const habits = activeHabits().map(h => { let done = 0, total = 0; days.forEach(d => { if (!habitCounted(h, d)) return; const st = habitStatus(h, d); if (d === today() && st === undefined) return; total++; if (st === 1) done++; }); return { h, done, total }; }).filter(x => x.total);
  const att = D('attendance').recs.filter(r => monthKey(r.date) === mk && r.st !== 'e');
  const xp = sum(days, dayXP);
  const scoreChart = days.map(d => ({ label: +d.slice(8) + '', value: dayScore(d) || 0 }));
  return `<div class="row between wrap gap8">${monthNav('rmonth', mk)}</div>
  <div class="tiles">
    <div class="tile static"><span class="tile-k">Oʻrtacha kun bali</span><b>${scores.length ? Math.round(avg(scores)) : '—'}</b><span>${scores.length} kun maʼlumot</span></div>
    <div class="tile static"><span class="tile-k">XP</span><b>${xp}</b><span>shu oy</span></div>
    <div class="tile static"><span class="tile-k">Davomat</span><b>${att.length ? pct(att.filter(r => r.st !== 'a').length, att.length) + '%' : '—'}</b><span>${att.length} dars</span></div>
    <div class="tile static"><span class="tile-k">Jamgʻarildi</span><b class="${mm.saved < 0 ? 'neg' : ''}">${won(mm.saved)}</b><span>ish: ${hrs(mp.min)}</span></div>
  </div>
  <div class="grid g2">
    <section class="card">${sectionHead('Kunlik ball')}${scores.length ? barChart(scoreChart, { h: 150, max: 100, fmt: v => Math.round(v) }) : '<p class="muted">Maʼlumot yoʻq.</p>'}</section>
    <section class="card">${sectionHead('Odatlar')}${habits.length ? `<ul class="bva">${sortBy(habits, x => x.done / x.total).map(x => `<li><div class="row between"><span>${esc(x.h.name)}</span><span class="mono">${x.done}/${x.total}</span></div>${bar(pct(x.done, x.total))}</li>`).join('')}</ul>` : '<p class="muted">Belgilanmagan.</p>'}</section>
  </div>
  <section class="card">${sectionHead('Oy sharhi')}
    <form data-form="rev-month" class="stack" data-k="${mk}">
      ${field('Bu oyning eng katta yutugʻi', area('wins', saved.wins))}${field('Eng katta qiyinchilik', area('hard', saved.hard))}${field('Keyingi oy uchun bitta asosiy oʻzgarish', inp('change', saved.change))}
      <div class="row end"><button class="btn primary">Saqlash</button></div><p class="ferr"></p>
    </form>
  </section>`;
}
FORM['rev-month'] = (o, f) => { if (!(o.wins || o.hard || o.change)) return 'Kamida bitta maydonni toʻldiring.'; D('growth').monthly[f.dataset.k] = { wins: o.wins || '', hard: o.hard || '', change: o.change || '', savedAt: nowISO() }; save('growth'); toast('Saqlandi'); render(); };

function revJournal() {
  const f = APP.filter.journal || (APP.filter.journal = { q: '' });
  let l = sortBy(allM('journal'), j => j.date + (j.t || ''), -1);
  if (f.q) { const q = f.q.toLowerCase(); l = l.filter(j => j.text.toLowerCase().includes(q)); }
  const moods = ['😞', '😕', '😐', '🙂', '😄'];
  return `<section class="card">
    ${sectionHead('Shaxsiy kundalik', '<span class="muted sm">faqat siz koʻrasiz</span>')}
    <form data-form="journal" class="stack">
      <textarea name="text" id="f-journal" rows="4" placeholder="Bugun nima boʻldi? Nimani his qildim?"></textarea>
      <div class="row between wrap gap8"><div class="moods" role="radiogroup" aria-label="Kayfiyat">${moods.map((m, i) => `<label><input type="radio" name="mood" value="${i + 1}"><span aria-label="${i + 1} / 5">${m}</span></label>`).join('')}</div><button class="btn primary sm">Yozish</button></div><p class="ferr"></p>
    </form>
    <label class="search">${ic('search')}<input id="f-jq" data-chg="jf" value="${esc(f.q)}" placeholder="Kundalikdan qidirish" aria-label="Qidirish"></label>
    ${l.length ? `<ul class="entries">${l.slice(0, 60).map(j => `<li class="entry"><div class="row between"><span class="muted sm">${fmtDL(j.date)} ${j.mood ? moods[j.mood - 1] : ''}</span>${iconBtn('trash', 'journal-del', `data-id="${j.id}"`, 'Oʻchirish')}</div><p>${esc(j.text).replace(/\n/g, '<br>')}</p></li>`).join('')}</ul>` : `<p class="muted">${f.q ? 'Hech narsa topilmadi.' : 'Hali yozuv yoʻq.'}</p>`}
  </section>`;
}
CHG.jf = el => { APP.filter.journal.q = el.value; render(); };
FORM.journal = o => { const t = (o.text || '').trim(); if (!t) return 'Matn yozing.'; upsertM('journal', { id: uid(), date: today(), t: nowISO(), text: t, mood: o.mood ? +o.mood : null }); render(); };
ACT['journal-del'] = el => confirmBox('Bu yozuv butunlay oʻchirilsinmi?', () => removeM('journal', el.dataset.id));

function revGoals() {
  const gl = D('growth').goals;
  const groups = [['short', 'Qisqa muddatli (shu semestr / 3–6 oy)'], ['long', 'Uzoq muddatli (1–5 yil)']];
  return groups.map(([k, l]) => `<section class="card">
    ${sectionHead(l, btn(`${ic('plus')} Maqsad`, 'goal2-edit', `data-k="${k}"`, 'primary sm'))}
    ${gl.filter(g => g.kind === k).length ? `<ul class="goals">${gl.filter(g => g.kind === k).map(g => { const ms = g.ms || [], d = ms.filter(m => m.done).length; const p = ms.length ? pct(d, ms.length) : (g.progress || 0); return `<li class="goal ${g.done ? 'dim' : ''}"><div class="row between gap8"><b>${esc(g.title)}</b><span class="row gap8">${chip(esc(g.area || ''), 'ghostchip')}${g.deadline ? `<span class="muted sm">${fmtD(g.deadline)}</span>` : ''}${iconBtn('edit', 'goal2-edit', `data-id="${g.id}"`, 'Tahrirlash')}</span></div>${g.why ? `<p class="muted sm">Nega: ${esc(g.why)}</p>` : ''}${bar(p)}
      ${ms.length ? `<ul class="list compact">${ms.map((m, i) => `<li class="li">${check(m.done ? 1 : undefined, 'ms-tick', `data-id="${g.id}" data-i="${i}"`, m.t)}<span class="li-t ${m.done ? 'done' : ''}">${esc(m.t)}</span></li>`).join('')}</ul>` : ''}</li>`; }).join('')}</ul>` : `<p class="muted">Maqsad yoʻq. Har bir maqsadni kichik bosqichlarga (milestone) boʻling.</p>`}
  </section>`).join('');
}
ACT['ms-tick'] = el => { const g = D('growth').goals.find(x => x.id === el.dataset.id); const m = g.ms[+el.dataset.i]; m.done = !m.done; g.done = g.ms.every(x => x.done); save('growth'); render(); };
ACT['goal2-edit'] = el => {
  const id = el.dataset.id, l = D('growth').goals, g = l.find(x => x.id === id) || { kind: el.dataset.k || 'short', area: 'Bilim', ms: [] };
  openModal({
    title: id ? 'Maqsadni tahrirlash' : 'Yangi maqsad',
    body: `${field('Maqsad', inp('title', g.title, 'text', 'required placeholder="Masalan: Semestrni 3.5+ GPA bilan tugatish"'))}
    <div class="fgrid">${field('Muddat turi', sel('kind', [['short', 'Qisqa'], ['long', 'Uzoq']], g.kind))}${field('Soha', sel('area', VISION_AREAS, g.area))}${field('Muddat', inp('deadline', g.deadline, 'date'))}</div>
    ${field('Nega bu men uchun muhim?', inp('why', g.why))}
    ${field('Bosqichlar (har birini yangi qatorga)', area('ms', (g.ms || []).map(m => m.t).join('\n'), 'rows="5"'))}`,
    danger: id ? { label: 'Oʻchirish', fn: () => { l.splice(l.indexOf(g), 1); save('growth'); } } : null,
    onSubmit: o => {
      if (!(o.title || '').trim()) return 'Maqsadni yozing.';
      const lines = (o.ms || '').split('\n').map(x => x.trim()).filter(Boolean);
      const old = g.ms || [];
      Object.assign(g, { title: o.title.trim(), kind: o.kind, area: o.area, deadline: o.deadline || '', why: o.why || '', ms: lines.map(t => ({ t, done: !!(old.find(m => m.t === t) || {}).done })) });
      g.done = g.ms.length > 0 && g.ms.every(m => m.done);
      if (!id) { g.id = uid(); l.push(g); } save('growth');
    }
  });
};

function revVision() {
  const v = D('growth').vision;
  return `<section class="card">
    ${sectionHead('Orzular taxtasi', btn(`${ic('plus')} Kartochka`, 'vision-edit', '', 'primary sm'))}
    <p class="muted sm">5 yildan keyin qanday odam boʻlishni xohlaysiz? Har bir sohada bitta aniq tasvir yozing. Qiyin kunlarda shu yerga qayting.</p>
    ${v.length ? `<div class="vision">${v.map(x => `<button class="vcard" data-act="vision-edit" data-id="${x.id}" style="--vc:${esc(x.color || 'var(--accent)')}"><span class="vc-a">${esc(x.area)}</span><b>${esc(x.title)}</b>${x.text ? `<span>${esc(x.text)}</span>` : ''}</button>`).join('')}</div>` : empty('Taxta boʻsh', 'Masalan: “Seulda IT kompaniyada dasturchi”, “Har kuni besh vaqt namoz”, “Oilamga yordam bera oladigan daromad”.')}
  </section>`;
}
ACT['vision-edit'] = el => {
  const id = el.dataset.id, l = D('growth').vision, x = l.find(v => v.id === id) || { area: 'Karyera', color: COURSE_COLORS[l.length % COURSE_COLORS.length] };
  openModal({
    title: id ? 'Kartochka' : 'Yangi kartochka',
    body: `<div class="fgrid">${field('Soha', sel('area', VISION_AREAS, x.area))}${field('Rang', inp('color', x.color, 'color'))}</div>${field('Sarlavha', inp('title', x.title, 'text', 'required'))}${field('Batafsil', area('text', x.text))}`,
    danger: id ? { label: 'Oʻchirish', fn: () => { l.splice(l.indexOf(x), 1); save('growth'); } } : null,
    onSubmit: o => { if (!(o.title || '').trim()) return 'Sarlavha yozing.'; Object.assign(x, { area: o.area, color: o.color, title: o.title.trim(), text: o.text || '' }); if (!id) { x.id = uid(); l.push(x); } save('growth'); }
  });
};

function revXP() {
  const xp = totalXP(), lv = levelOf(xp), b = badges();
  const days = lastN(30), xs = days.map(d => ({ label: +d.slice(8) + '', value: dayXP(d) }));
  const wk = sum(lastN(7), dayXP);
  const months = [-5, -4, -3, -2, -1, 0].map(n => addMonths(monthKey(today()), n)).map(mk => { const ds2 = monthDays(mk).filter(d => d <= today() && d >= (S().startDate || today())); const sc = ds2.map(dayScore).filter(v => v !== null); return { mk, xp: sum(ds2, dayXP), score: sc.length ? Math.round(avg(sc)) : null, days: ds2.length }; }).filter(m => m.days);
  return `<div class="tiles">
    <div class="tile static"><span class="tile-k">Daraja</span><b>${lv.level}</b><span>${lv.into}/${lv.need} XP keyingi darajagacha</span></div>
    <div class="tile static"><span class="tile-k">Jami XP</span><b>${xp}</b><span>shu hafta ${wk}</span></div>
    <div class="tile static"><span class="tile-k">Nishonlar</span><b>${b.filter(x => x[2]).length}/${b.length}</b><span>qoʻlga kiritildi</span></div>
  </div>
  <section class="card">${sectionHead('Kunlik XP · 30 kun')}${barChart(xs, { h: 140, fmt: v => Math.round(v), max: 250 })}
    <p class="muted sm">Qoidalar: kuniga eng koʻpi 250 XP. Yarim tundan keyin (00:30–05:00) bajarilgan vazifa XP bermaydi. Vaqtida uxlash +20, toʻliq minimal kun +25, yomon kundan keyin qaytish +30. Oʻtkazib yuborilgan kun uchun XP olib tashlanmaydi.</p></section>
  <section class="card">${sectionHead('Nishonlar')}<div class="badges">${b.map(([n, d, ok, icn]) => `<div class="badge ${ok ? 'on' : ''}">${ic(icn)}<b>${n}</b><span>${d}</span></div>`).join('')}</div></section>
  <section class="card">${sectionHead('Oylik hisobot')}
    ${months.length ? `<div class="tbl-w"><table class="tbl"><thead><tr><th>Oy</th><th>XP</th><th>Oʻrtacha ball</th><th>Jamgʻarildi</th><th>Davomat</th></tr></thead><tbody>${[...months].reverse().map(m => { const att = D('attendance').recs.filter(r => monthKey(r.date) === m.mk && r.st !== 'e'); return `<tr><td>${fmtM(m.mk)}</td><td class="mono">${m.xp}</td><td class="mono">${m.score ?? '—'}</td><td class="mono">${won(monthMoney(m.mk).saved)}</td><td class="mono">${att.length ? pct(att.filter(r => r.st !== 'a').length, att.length) + '%' : '—'}</td></tr>`; }).join('')}</tbody></table></div>` : '<p class="muted">Maʼlumot yoʻq.</p>'}
  </section>`;
}
