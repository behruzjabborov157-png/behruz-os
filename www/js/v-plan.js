'use strict';
/* Reja: kun, hafta (sudrab koʻchirish), oy kalendari, vazifalar roʻyxati, minimal kun */

const TASK_CATS = ['Universitet', 'Ish', 'Til', 'Sogʻliq', 'Ibodat', 'Moliya', 'Karyera', 'Shaxsiy'];
const PRIO = { 1: ['Yuqori', 'bad'], 2: ['Oʻrta', 'warn'], 3: ['Past', ''] };
const RECUR = [['none', 'Takrorlanmaydi'], ['daily', 'Har kuni'], ['weekdays', 'Ish kunlari (Du–Ju)'], ['weekly', 'Har hafta'], ['monthly', 'Har oy']];

VIEWS.plan = () => {
  const tab = curTab('plan', 'day');
  const head = tabs('plan', [['day', 'Kun'], ['week', 'Hafta'], ['month', 'Oy'], ['tasks', 'Vazifalar'], ['minimum', 'Minimal kun']]);
  return head + ({ day: planDay, week: planWeek, month: planMonth, tasks: planTasks, minimum: planMinimum }[tab] || planDay)();
};

function taskRow(x, date, opts = {}) {
  const done = isDone(x, date);
  const [pl, pc] = PRIO[x.prio] || PRIO[2];
  return `<li class="task ${done ? 'done' : ''}" ${opts.drag && (!x.recur || x.recur === 'none') ? `draggable="true" data-drag="${x.id}"` : ''}>
    ${check(done ? 1 : undefined, 'task-done', `data-id="${x.id}" data-d="${date}"`, x.title)}
    <button class="task-m" data-act="task-edit" data-id="${x.id}">
      <span class="task-t">${esc(x.title)}</span>
      <span class="task-s">${x.time ? `<span class="mono">${x.time}</span>` : ''}${chip(esc(x.cat || ''), 'ghostchip')}${chip(pl, pc)}${x.est ? `<span>${hrs(+x.est)}</span>` : ''}${x.recur && x.recur !== 'none' ? `<span>${RECUR.find(r => r[0] === x.recur)[1].toLowerCase()}</span>` : ''}${opts.showDue && x.due ? `<span class="${!done ? dueLevel(x.due) : ''}">${fmtD(x.due)}</span>` : ''}</span>
    </button>
  </li>`;
}

function planDay() {
  const date = selDate('plan');
  const list = sortBy(tasksOn(date), x => (isDone(x, date) ? '1' : '0') + (x.time || '99') + x.prio);
  const sched = scheduleFor(date).filter(x => x.k !== 'Vazifa');
  const est = sum(list.filter(x => !isDone(x, date)), x => +x.est || 0);
  const d = day(date);
  const overdue = date === today() ? overdueTasks() : [];
  return `
  <div class="grid g2">
    <section class="card">
      <div class="row between wrap gap8">${dateNav('plan', date, '', true)}${btn(`${ic('plus')} Vazifa`, 'task-edit', `data-due="${date}"`, 'primary sm')}</div>
      ${est ? `<p class="muted sm">Qolgan ishlar taxminan ${hrs(est)} oladi.</p>` : ''}
      ${list.length ? `<ul class="tasks">${list.map(x => taskRow(x, date)).join('')}</ul>` : empty('Bu kunga vazifa yoʻq', 'Vazifa qoʻshing yoki haftalik rejadan koʻchiring.')}
      ${overdue.length ? `<h4 class="sub bad-t">Muddati oʻtgan (${overdue.length})</h4><ul class="tasks">${overdue.map(x => taskRow(x, x.due, { showDue: true })).join('')}</ul>` : ''}
    </section>
    <section class="card">
      ${sectionHead('Kun jadvali')}
      ${sched.length ? `<ul class="timeline">${sched.map(x => `<li class="tl ${x.cls}"><span class="tl-t mono">${x.t || '—'}${x.e ? '–' + x.e : ''}</span><span class="tl-k">${x.k}</span><span class="tl-n">${esc(x.title)}${x.sub ? ` <em>${esc(x.sub)}</em>` : ''}</span></li>`).join('')}</ul>` : '<p class="muted">Dars, smena yoki namoz vaqtlari kiritilmagan.</p>'}
      <h4 class="sub">Kun sharhi</h4>
      <form data-form="day-review" class="stack" data-d="${date}">
        <textarea name="note" id="f-daynote" rows="3" placeholder="Bugun nima yaxshi boʻldi? Nimani ertaga boshqacha qilaman?">${esc(d.note || '')}</textarea>
        <div class="row between wrap gap8"><label class="cbx"><input type="checkbox" name="reviewed" ${d.reviewed ? 'checked' : ''}> Kunni sharhladim</label><button class="btn sm">Saqlash</button></div>
      </form>
    </section>
  </div>`;
}
FORM['day-review'] = (o, f) => { setDay(f.dataset.d, d => { d.note = o.note || ''; d.reviewed = !!o.reviewed; }); toast('Kun sharhi saqlandi'); render(); };

function planWeek() {
  const ref = APP.sel.week || today();
  const days = weekDays(ref);
  return `<section class="card">
    <div class="row between wrap gap8"><div class="datenav"><button class="ibtn" data-act="wnav" data-n="-7" aria-label="Oldingi hafta">${ic('left')}</button><span class="dn-l">${fmtD(days[0])} – ${fmtD(days[6])}</span><button class="ibtn" data-act="wnav" data-n="7" aria-label="Keyingi hafta">${ic('right')}</button>${weekStart(ref) !== weekStart(today()) ? btn('Shu hafta', 'wnav', 'data-n="0"', 'sm ghost') : ''}</div>
    <span class="muted sm">Kompyuterda vazifani boshqa kunga sudrab koʻchiring. Telefonda vazifani bosib, sanasini oʻzgartiring.</span></div>
    <div class="week">${days.map(d => {
    const l = sortBy(tasksOn(d), x => (isDone(x, d) ? '1' : '0') + (x.time || '99'));
    const cls = classesToday(d).length, sh = inMonth('shifts', monthKey(d)).filter(s => s.date === d && s.st !== 'absent');
    return `<div class="wcol ${d === today() ? 'today' : ''}" data-drop="${d}">
        <div class="wcol-h"><b>${UZ_DAYS[dow(d)]}</b><span>${fmtD(d)}</span></div>
        <div class="wcol-i">${cls ? `<span class="tag uni">${cls} dars</span>` : ''}${sh.length ? `<span class="tag work">smena ${sh.map(s => s.s).join(', ')}</span>` : ''}</div>
        <ul class="tasks sm">${l.map(x => taskRow(x, d, { drag: true })).join('')}</ul>
        <button class="addbtn" data-act="task-edit" data-due="${d}">${ic('plus')} Qoʻshish</button>
      </div>`;
  }).join('')}</div>
  </section>`;
}
ACT.wnav = el => { const n = +el.dataset.n; APP.sel.week = n === 0 ? today() : addDays(APP.sel.week || today(), n); render(); };

function planMonth() {
  const mk = selMonth('plan-m');
  const days = monthDays(mk), lead = (dow(days[0]) + 6) % 7;
  const acad = D('academic').items, bills = billsDue(mk);
  return `<section class="card">
    ${sectionHead('Oylik kalendar', monthNav('plan-m', mk))}
    <div class="cal"><div class="cal-h">${WEEK_ORDER.map(d => `<span>${UZ_DS[d]}</span>`).join('')}</div>
    <div class="cal-g">${Array(lead).fill('<span class="cc pad"></span>').join('')}${days.map(d => {
    const t = tasksOn(d), a = acad.filter(i => i.due === d), b = bills.filter(x => x.date === d);
    const open = t.filter(x => !isDone(x, d)).length;
    return `<button class="cc ${d === today() ? 'today' : ''}" data-act="cal-day" data-d="${d}"><span class="cc-n">${+d.slice(8)}</span>
        ${t.length ? `<span class="dot plan" title="${t.length} vazifa">${open || '✓'}</span>` : ''}${a.length ? `<span class="dot uni" title="${a.map(i => esc(i.title)).join(', ')}">${a.length}</span>` : ''}${b.length ? `<span class="dot money" title="${b.map(x => esc(x.name)).join(', ')}">₩</span>` : ''}</button>`;
  }).join('')}</div></div>
    <div class="legend"><span><i class="dot-k plan"></i>Vazifalar (ochiq)</span><span><i class="dot-k uni"></i>Imtihon / topshiriq</span><span><i class="dot-k money"></i>Toʻlov</span></div>
  </section>`;
}
ACT['cal-day'] = el => { if (el.dataset.d > today()) { APP.tab.plan = 'tasks'; APP.filter.tasks = Object.assign(APP.filter.tasks || {}, { date: el.dataset.d }); } else { APP.sel.plan = el.dataset.d; APP.tab.plan = 'day'; } render(); };

function planTasks() {
  const f = APP.filter.tasks || (APP.filter.tasks = { st: 'open', cat: '', prio: '', q: '', sort: 'due', date: '' });
  let list = D('tasks').list.slice();
  const t = today();
  if (f.st === 'open') list = list.filter(x => x.recur && x.recur !== 'none' ? !(x.until && x.until < t) : !x.done);
  if (f.st === 'done') list = list.filter(x => (!x.recur || x.recur === 'none') && x.done);
  if (f.cat) list = list.filter(x => x.cat === f.cat);
  if (f.prio) list = list.filter(x => String(x.prio) === f.prio);
  if (f.date) list = list.filter(x => occursOn(x, f.date));
  if (f.q) { const q = f.q.toLowerCase(); list = list.filter(x => (x.title + ' ' + (x.desc || '') + ' ' + (x.notes || '')).toLowerCase().includes(q)); }
  list = f.sort === 'prio' ? sortBy(list, x => x.prio + (x.due || '9999')) : f.sort === 'new' ? sortBy(list, x => x.created || '', -1) : sortBy(list, x => (x.due || '9999') + (x.time || ''));
  return `<section class="card">
    <div class="filters">
      <label class="search">${ic('search')}<input id="f-tq" data-chg="tf" data-k="q" value="${esc(f.q)}" placeholder="Qidirish" aria-label="Qidirish"></label>
      ${sel('tst', [['open', 'Faol'], ['done', 'Bajarilgan'], ['all', 'Hammasi']], f.st, 'data-chg="tf" data-k="st" aria-label="Holat"')}
      ${sel('tcat', [['', 'Barcha turkumlar'], ...TASK_CATS], f.cat, 'data-chg="tf" data-k="cat" aria-label="Turkum"')}
      ${sel('tprio', [['', 'Har qanday muhimlik'], ['1', 'Yuqori'], ['2', 'Oʻrta'], ['3', 'Past']], f.prio, 'data-chg="tf" data-k="prio" aria-label="Muhimlik"')}
      ${sel('tsort', [['due', 'Muddat boʻyicha'], ['prio', 'Muhimlik boʻyicha'], ['new', 'Yangilari avval']], f.sort, 'data-chg="tf" data-k="sort" aria-label="Tartib"')}
      ${f.date ? `<button class="chip btnchip" data-act="tf-clear-date">${fmtD(f.date)} ${ic('x')}</button>` : ''}
      ${btn(`${ic('plus')} Vazifa`, 'task-edit', '', 'primary sm')}
    </div>
    ${list.length ? `<ul class="tasks">${list.map(x => taskRow(x, x.recur && x.recur !== 'none' ? (f.date || t) : (x.due || t), { showDue: true })).join('')}</ul>` : empty('Vazifa topilmadi', f.q || f.cat || f.prio ? 'Filtrni oʻzgartirib koʻring.' : 'Birinchi vazifangizni qoʻshing.', btn('Vazifa qoʻshish', 'task-edit', '', 'sm'))}
  </section>`;
}
CHG.tf = el => { APP.filter.tasks[el.dataset.k] = el.value; render(); };
ACT['tf-clear-date'] = () => { APP.filter.tasks.date = ''; render(); };

function planMinimum() {
  const list = S().minimum;
  return `<section class="card">
    ${sectionHead('Minimal kun roʻyxati')}
    <p class="muted">Qiyin kunlarda (kasallik, uzun smena, kayfiyat yoʻq) hamma narsani tashlab qoʻymaslik uchun eng kichik roʻyxat. Bosh sahifada “Minimal kun” tugmasini bossangiz, faqat shular va “minimal kunda ham” belgilangan odatlar hisoblanadi.</p>
    <ul class="list">${list.map((m, i) => `<li class="li"><span class="li-t">${esc(m.t)}</span>${iconBtn('up', 'min-move', `data-i="${i}" data-n="-1"`, 'Yuqoriga')}${iconBtn('trash', 'min-del', `data-i="${i}"`, 'Oʻchirish')}</li>`).join('')}</ul>
    <form data-form="min-add" class="inline-form"><input name="t" id="f-minadd" maxlength="80" placeholder="Masalan: 1 sahifa Qurʼon" aria-label="Yangi band"><button class="btn primary">${ic('plus')} Qoʻshish</button><p class="ferr"></p></form>
    <p class="muted sm">Roʻyxat qisqa boʻlsin: 3–6 ta band yetarli.</p>
  </section>`;
}
FORM['min-add'] = o => { const t = (o.t || '').trim(); if (!t) return 'Matn yozing.'; S().minimum.push({ id: uid(), t }); save('settings'); render(); };
ACT['min-del'] = el => { S().minimum.splice(+el.dataset.i, 1); save('settings'); render(); };
ACT['min-move'] = el => { const l = S().minimum, i = +el.dataset.i, j = i - 1; if (j < 0) return; [l[i], l[j]] = [l[j], l[i]]; save('settings'); render(); };

/* vazifa amallari */
ACT['task-done'] = el => {
  const x = D('tasks').list.find(t => t.id === el.dataset.id); if (!x) return;
  const date = el.dataset.d;
  if (x.recur && x.recur !== 'none') { x.doneDates = x.doneDates || []; const i = x.doneDates.indexOf(date); if (i >= 0) x.doneDates.splice(i, 1); else x.doneDates.push(date); }
  else { x.done = !x.done; x.doneAt = x.done ? nowISO() : null; }
  save('tasks'); render();
};
ACT['task-edit'] = el => {
  const id = el.dataset.id, x = D('tasks').list.find(t => t.id === id) || { prio: 2, cat: 'Shaxsiy', recur: 'none', due: el.dataset.due || today() };
  openModal({
    title: id ? 'Vazifani tahrirlash' : 'Yangi vazifa',
    body: `${field('Nomi', inp('title', x.title, 'text', 'required maxlength="140"'))}
      ${field('Tavsif', area('desc', x.desc))}
      <div class="fgrid">${field('Turkum', sel('cat', TASK_CATS, x.cat))}${field('Muhimlik', sel('prio', [['1', 'Yuqori'], ['2', 'Oʻrta'], ['3', 'Past']], x.prio))}</div>
      <div class="fgrid">${field('Sana', inp('due', x.due, 'date'))}${field('Vaqt', inp('time', x.time, 'time'))}${field('Taxminiy vaqt (daq)', inp('est', x.est, 'number', 'min="0" step="5"'))}</div>
      <div class="fgrid">${field('Takrorlanish', sel('recur', RECUR, x.recur || 'none'))}${field('Qachongacha (ixtiyoriy)', inp('until', x.until, 'date'))}</div>
      ${field('Izohlar', area('notes', x.notes))}`,
    danger: id ? { label: 'Oʻchirish', fn: () => { const l = D('tasks').list; l.splice(l.indexOf(x), 1); save('tasks'); } } : null,
    onSubmit: o => {
      const title = (o.title || '').trim(); if (!title) return 'Vazifa nomini yozing.';
      if (o.recur !== 'none' && !o.due) return 'Takrorlanadigan vazifa uchun boshlanish sanasini tanlang.';
      if (o.until && o.due && o.until < o.due) return '“Qachongacha” sanasi boshlanish sanasidan keyin boʻlishi kerak.';
      if (o.est && num(o.est) < 0) return 'Taxminiy vaqt manfiy boʻlolmaydi.';
      Object.assign(x, { title, desc: o.desc || '', cat: o.cat, prio: +o.prio, due: o.due || '', time: o.time || '', est: o.est ? num(o.est) : '', recur: o.recur, until: o.until || '', notes: o.notes || '' });
      if (!id) { x.id = uid(); x.created = nowISO(); x.done = false; x.doneDates = []; D('tasks').list.push(x); }
      save('tasks'); toast('Vazifa saqlandi');
    }
  });
};

/* sudrab koʻchirish (haftalik reja) */
document.addEventListener('dragstart', e => { const el = e.target.closest && e.target.closest('[data-drag]'); if (!el) return; e.dataTransfer.setData('text/plain', el.dataset.drag); e.dataTransfer.effectAllowed = 'move'; el.classList.add('dragging'); });
document.addEventListener('dragend', e => { const el = e.target.closest && e.target.closest('[data-drag]'); if (el) el.classList.remove('dragging'); document.querySelectorAll('.drop-on').forEach(x => x.classList.remove('drop-on')); });
document.addEventListener('dragover', e => { const col = e.target.closest && e.target.closest('[data-drop]'); if (!col) return; e.preventDefault(); document.querySelectorAll('.drop-on').forEach(x => x !== col && x.classList.remove('drop-on')); col.classList.add('drop-on'); });
document.addEventListener('drop', e => {
  const col = e.target.closest && e.target.closest('[data-drop]'); if (!col) return; e.preventDefault();
  const id = e.dataTransfer.getData('text/plain'); const x = D('tasks').list.find(t => t.id === id);
  if (x && (!x.recur || x.recur === 'none') && x.due !== col.dataset.drop) { x.due = col.dataset.drop; save('tasks'); toast(`${fmtD(x.due)} kuniga koʻchirildi`); }
  render();
});
