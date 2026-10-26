'use strict';
/* Universitet: kurslar, haftalik jadval, davomat, topshiriqlar, baholar va GPA, semestr kalendari */

const ACAD_TYPES = { assignment: 'Uy vazifasi', exam: 'Imtihon', midterm: 'Oraliq imtihon', final: 'Yakuniy imtihon', project: 'Loyiha', quiz: 'Test', presentation: 'Taqdimot' };
const ATT_ST = { p: ['Keldim', 'ok'], l: ['Kechikdim', 'warn'], a: ['Kelmadim', 'bad'], e: ['Sababli', ''] };
const COURSE_COLORS = ['#4f63d8', '#0e9f8e', '#c2410c', '#9333ea', '#0369a1', '#b45309', '#be123c', '#15803d'];

VIEWS.uni = () => {
  const tab = curTab('uni', 'courses');
  return tabs('uni', [['courses', 'Kurslar'], ['time', 'Jadval'], ['att', 'Davomat'], ['work', 'Topshiriqlar'], ['gpa', 'Baholar va GPA'], ['cal', 'Kalendar']]) +
    ({ courses: uniCourses, time: uniTime, att: uniAtt, work: uniWork, gpa: uniGPA, cal: uniCal }[tab] || uniCourses)();
};
function courseById(id) { return D('courses').list.find(c => c.id === id); }
function courseDot(c) { return `<i class="cdot" style="background:${esc(c?.color || 'var(--muted)')}"></i>`; }

function uniCourses() {
  const list = D('courses').list;
  if (!list.length) return empty('Kurslar kiritilmagan', 'Shu semestrdagi fanlarni qoʻshing: nomi, kreditlar, xona, professor va dars vaqtlari.', btn(`${ic('plus')} Kurs qoʻshish`, 'course-edit', '', 'primary'));
  const s = S();
  return `${sectionHead(`${esc(s.semester || 'Joriy semestr')} · ${list.length} ta kurs · ${sum(list, c => num(c.credits))} kredit`, btn(`${ic('plus')} Kurs`, 'course-edit', '', 'primary sm'))}
  <div class="grid g2">${list.map(c => {
    const a = attendanceStats(c);
    const next = D('academic').items.filter(i => i.courseId === c.id && !i.done && i.due && i.due >= today()).sort((x, y) => x.due < y.due ? -1 : 1)[0];
    return `<article class="card course ${a.level}">
      <div class="row between gap8"><h3>${courseDot(c)} ${esc(c.name)}</h3>${iconBtn('edit', 'course-edit', `data-id="${c.id}"`, 'Tahrirlash')}</div>
      <p class="muted sm">${[c.code, c.credits ? c.credits + ' kredit' : '', c.prof, c.room].filter(Boolean).map(esc).join(' · ')}</p>
      <p class="sm">${(c.sessions || []).map(x => `${UZ_DS[x.d]} ${x.s}–${x.e}${x.room ? ' (' + esc(x.room) + ')' : ''}`).join(', ') || '<span class="muted">Dars vaqti kiritilmagan</span>'}</p>
      <div class="kv"><span>Davomat</span><b>${a.pct === null ? '—' : Math.round(a.pct) + '%'}</b><span>Kelmadim / kechikdim</span><b>${a.a} / ${a.l}</b><span>Joriy ball</span><b>${a.score === null ? '—' : Math.round(a.score) + '%'}</b><span>Keyingi ish</span><b>${next ? esc(next.title) + ' · ' + dueText(next.due) : '—'}</b></div>
      ${a.why.length ? `<ul class="alerts">${a.why.map(w => `<li class="al ${a.level}"><span>${esc(w)}</span></li>`).join('')}</ul>` : ''}
      ${!c.rules || (!c.rules.minPct && !c.rules.maxAbs) ? `<p class="muted sm">Davomat qoidasi kiritilmagan. Professor yoki syllabus talabini “Tahrirlash” orqali kiriting, shunda ogohlantirish ishlaydi.</p>` : ''}
      ${c.email || c.office ? `<p class="muted sm">${[c.email, c.office].filter(Boolean).map(esc).join(' · ')}</p>` : ''}
    </article>`;
  }).join('')}</div>`;
}

function uniTime() {
  const list = D('courses').list;
  const sessions = list.flatMap(c => (c.sessions || []).map(s => ({ c, s })));
  if (!sessions.length) return empty('Jadval boʻsh', 'Kurs qoʻshganda dars vaqtlarini kiriting.', btn('Kurs qoʻshish', 'course-edit', '', 'primary'));
  const days = [1, 2, 3, 4, 5, 6, 0].filter(d => d <= 5 && d >= 1 || sessions.some(x => +x.s.d === d));
  const minT = Math.floor(Math.min(...sessions.map(x => tmin(x.s.s))) / 60) * 60, maxT = Math.ceil(Math.max(...sessions.map(x => tmin(x.s.e))) / 60) * 60;
  const H = (maxT - minT) / 60 * 56;
  const td = dow(today());
  return `<section class="card">
    ${sectionHead('Haftalik dars jadvali')}
    <div class="tt-w"><div class="tt" style="--cols:${days.length}">
      <div class="tt-hours" style="height:${H}px">${Array.from({ length: (maxT - minT) / 60 + 1 }, (_, i) => `<span style="top:${i * 56}px">${mtime(minT + i * 60)}</span>`).join('')}</div>
      ${days.map(d => `<div class="tt-col ${d === td ? 'today' : ''}"><div class="tt-h">${UZ_DAYS[d]}</div><div class="tt-b" style="height:${H}px">${sessions.filter(x => +x.s.d === d).map(({ c, s }) => `<button class="tt-c" data-act="course-edit" data-id="${c.id}" style="top:${(tmin(s.s) - minT) / 60 * 56}px;height:${Math.max(28, (tmin(s.e) - tmin(s.s)) / 60 * 56 - 3)}px;--cc:${esc(c.color || 'var(--accent)')}"><b>${esc(c.name)}</b><span>${s.s}–${s.e}</span><span>${esc(s.room || c.room || '')}</span></button>`).join('')}</div></div>`).join('')}
    </div></div>
  </section>`;
}

function uniAtt() {
  const date = selDate('att');
  const todays = classesToday(date);
  const recs = D('attendance').recs;
  const list = D('courses').list;
  return `<div class="grid g2">
    <section class="card">
      <div class="row between wrap gap8">${dateNav('att', date)}</div>
      ${todays.length ? `<ul class="list">${todays.map(({ c, s }) => { const r = recs.find(x => x.c === c.id && x.date === date && x.sess === s.s); return `<li class="li att-li"><span class="li-t">${courseDot(c)} <b>${esc(c.name)}</b> <span class="muted sm mono">${s.s}–${s.e}</span></span><div class="seg">${Object.entries(ATT_ST).map(([k, [l, cls]]) => `<button class="seg-b ${r && r.st === k ? 'on ' + cls : ''}" data-act="att-set" data-c="${c.id}" data-d="${date}" data-s="${s.s}" data-st="${k}" aria-pressed="${!!(r && r.st === k)}">${l}</button>`).join('')}</div></li>`; }).join('')}</ul>` : `<p class="muted">Bu kuni jadvalda dars yoʻq.</p>`}
      <details class="more-d"><summary>Jadvaldan tashqari dars qoʻshish</summary>
        <form data-form="att-extra" class="fgrid" data-d="${date}">${field('Kurs', sel('c', list.map(c => [c.id, c.name]), ''))}${field('Holat', sel('st', Object.entries(ATT_ST).map(([k, v]) => [k, v[0]]), 'p'))}<button class="btn sm">Yozish</button><p class="ferr"></p></form>
      </details>
    </section>
    <section class="card">
      ${sectionHead('Kurslar boʻyicha')}
      ${list.length ? `<div class="tbl-w"><table class="tbl"><thead><tr><th>Kurs</th><th>%</th><th>Keldim</th><th>Kech.</th><th>Kelm.</th><th>Sab.</th></tr></thead><tbody>${list.map(c => { const a = attendanceStats(c); return `<tr><td>${courseDot(c)} ${esc(c.name)}</td><td class="mono ${a.level === 'ok' ? '' : a.level + '-t'}">${a.pct === null ? '—' : Math.round(a.pct)}</td><td class="mono">${a.p}</td><td class="mono">${a.l}</td><td class="mono">${a.a}</td><td class="mono">${a.e}</td></tr>`; }).join('')}</tbody></table></div>` : '<p class="muted">Kurslar yoʻq.</p>'}
      <p class="muted sm">Foiz: (keldim + kechikdim − kechikishdan hosil boʻlgan qoldirishlar) ÷ (sababsiz darslar). Kechikish qoidasi har bir kurs sozlamasida.</p>
    </section>
  </div>
  <section class="card">${sectionHead('Oxirgi yozuvlar')}
    ${recs.length ? `<ul class="list compact">${sortBy(recs, r => r.date, -1).slice(0, 20).map(r => { const c = courseById(r.c); return `<li class="li"><span class="mono sm">${fmtD(r.date)}</span><span class="li-t">${courseDot(c)} ${esc(c ? c.name : 'Oʻchirilgan kurs')}</span>${chip(ATT_ST[r.st][0], ATT_ST[r.st][1])}${iconBtn('trash', 'att-del', `data-id="${r.id}"`, 'Oʻchirish')}</li>`; }).join('')}</ul>` : '<p class="muted">Hali davomat belgilanmagan.</p>'}
  </section>`;
}
ACT['att-set'] = el => {
  const recs = D('attendance').recs, { c, d, s, st } = el.dataset;
  const r = recs.find(x => x.c === c && x.date === d && x.sess === s);
  if (r) { if (r.st === st) recs.splice(recs.indexOf(r), 1); else r.st = st; }
  else recs.push({ id: uid(), c, date: d, sess: s, st });
  save('attendance'); render();
};
FORM['att-extra'] = (o, f) => { if (!o.c) return 'Avval kurs qoʻshing.'; D('attendance').recs.push({ id: uid(), c: o.c, date: f.dataset.d, sess: 'extra-' + uid(), st: o.st }); save('attendance'); render(); };
ACT['att-del'] = el => { const recs = D('attendance').recs; const i = recs.findIndex(r => r.id === el.dataset.id); if (i >= 0) recs.splice(i, 1); save('attendance'); render(); };

function uniWork() {
  const f = APP.filter.acad || (APP.filter.acad = { st: 'open', c: '', type: '' });
  let items = D('academic').items.slice();
  if (f.st === 'open') items = items.filter(i => !i.done); if (f.st === 'done') items = items.filter(i => i.done);
  if (f.c) items = items.filter(i => i.courseId === f.c); if (f.type) items = items.filter(i => i.type === f.type);
  items = sortBy(items, i => i.due || '9999');
  return `<section class="card">
    <div class="filters">
      ${sel('ast', [['open', 'Bajarilmagan'], ['done', 'Bajarilgan'], ['all', 'Hammasi']], f.st, 'data-chg="af" data-k="st" aria-label="Holat"')}
      ${sel('ac', [['', 'Barcha kurslar'], ...D('courses').list.map(c => [c.id, c.name])], f.c, 'data-chg="af" data-k="c" aria-label="Kurs"')}
      ${sel('atype', [['', 'Barcha turlar'], ...Object.entries(ACAD_TYPES)], f.type, 'data-chg="af" data-k="type" aria-label="Turi"')}
      ${btn(`${ic('plus')} Qoʻshish`, 'acad-edit', '', 'primary sm')}
    </div>
    ${items.length ? `<ul class="tasks">${items.map(i => { const c = courseById(i.courseId), lv = i.done ? '' : dueLevel(i.due); const prep = i.prep || []; return `<li class="task ${i.done ? 'done' : ''} ${lv ? 'edge-' + lv : ''}">
      ${check(i.done ? 1 : undefined, 'acad-done', `data-id="${i.id}"`, i.title)}
      <button class="task-m" data-act="acad-edit" data-id="${i.id}"><span class="task-t">${esc(i.title)}</span>
      <span class="task-s">${courseDot(c)}${esc(c ? c.name : '—')}${chip(ACAD_TYPES[i.type] || i.type, 'ghostchip')}<span class="${lv}">${i.due ? fmtD(i.due) + (i.time ? ' ' + i.time : '') + ' · ' + dueText(i.due) : 'muddat yoʻq'}</span>${i.score !== '' && i.score !== undefined && i.score !== null ? `<span class="mono">${i.score}/${i.max}</span>` : ''}${prep.length ? `<span>tayyorgarlik ${prep.filter(p => p.done).length}/${prep.length}</span>` : ''}</span></button>
      ${['exam', 'midterm', 'final', 'quiz', 'presentation'].includes(i.type) && !i.done ? btn('Tayyorgarlik', 'prep-open', `data-id="${i.id}"`, 'sm ghost') : ''}
    </li>`; }).join('')}</ul>` : empty('Hech narsa yoʻq', 'Uy vazifalari, imtihonlar va loyihalarni muddati bilan qoʻshing. Muddati yaqinlari bosh sahifada chiqadi.', btn('Qoʻshish', 'acad-edit', '', 'sm'))}
  </section>`;
}
CHG.af = el => { APP.filter.acad[el.dataset.k] = el.value; render(); };
ACT['acad-done'] = el => { const i = D('academic').items.find(x => x.id === el.dataset.id); i.done = !i.done; i.doneAt = i.done ? nowISO() : null; save('academic'); render(); };
ACT['acad-edit'] = el => {
  const id = el.dataset.id, i = D('academic').items.find(x => x.id === id) || { type: 'assignment', due: el.dataset.due || '' };
  const courses = D('courses').list;
  if (!courses.length) { toast('Avval kurs qoʻshing'); return; }
  openModal({
    title: id ? 'Tahrirlash' : 'Topshiriq / imtihon qoʻshish',
    body: `${field('Nomi', inp('title', i.title, 'text', 'required maxlength="140"'))}
    <div class="fgrid">${field('Kurs', sel('courseId', courses.map(c => [c.id, c.name]), i.courseId))}${field('Turi', sel('type', Object.entries(ACAD_TYPES), i.type))}</div>
    <div class="fgrid">${field('Muddat', inp('due', i.due, 'date'))}${field('Vaqt', inp('time', i.time, 'time'))}${field('Joy / xona', inp('where', i.where))}</div>
    <div class="fgrid">${field('Olingan ball', inp('score', i.score, 'number', 'step="0.1" min="0"'))}${field('Maksimal ball', inp('max', i.max, 'number', 'step="0.1" min="0"'))}${field('Ogʻirligi (%)', inp('weight', i.weight, 'number', 'step="1" min="0" max="100"'), 'Masalan oraliq 30%')}</div>
    ${field('Izoh', area('notes', i.notes))}`,
    danger: id ? { label: 'Oʻchirish', fn: () => { const l = D('academic').items; l.splice(l.indexOf(i), 1); save('academic'); } } : null,
    onSubmit: o => {
      const title = (o.title || '').trim(); if (!title) return 'Nomini yozing.';
      if (o.score !== '' && (o.max === '' || num(o.max) <= 0)) return 'Ball kiritilsa, maksimal ballni ham kiriting.';
      if (o.score !== '' && num(o.score) > num(o.max)) return 'Olingan ball maksimal balldan katta boʻlolmaydi.';
      Object.assign(i, { title, courseId: o.courseId, type: o.type, due: o.due || '', time: o.time || '', where: o.where || '', score: o.score === '' ? '' : num(o.score), max: o.max === '' ? '' : num(o.max), weight: o.weight === '' ? '' : num(o.weight), notes: o.notes || '' });
      if (!id) { i.id = uid(); i.done = false; i.prep = []; D('academic').items.push(i); }
      save('academic'); toast('Saqlandi');
    }
  });
};
ACT['prep-open'] = el => {
  const i = D('academic').items.find(x => x.id === el.dataset.id); i.prep = i.prep || [];
  const left = i.due ? daysBetween(today(), i.due) : null;
  openModal({
    title: `Tayyorgarlik: ${esc(i.title)}`, submit: 'Reja tuzish',
    body: `<p class="muted">${left === null ? 'Imtihon sanasi kiritilmagan.' : left < 0 ? 'Imtihon sanasi oʻtgan.' : `Imtihongacha ${left} kun.`}</p>
      ${i.prep.length ? `<ul class="list">${i.prep.map((p, k) => `<li class="li">${check(p.done ? 1 : undefined, 'prep-tick', `data-id="${i.id}" data-k="${k}"`, p.t)}<span class="li-t ${p.done ? 'done' : ''}">${esc(p.t)}</span><span class="mono sm">${p.date ? fmtD(p.date) : ''}</span></li>`).join('')}</ul>` : ''}
      <h4 class="sub">Yangi reja</h4>
      ${field('Mavzular (har birini yangi qatorga)', area('topics', '', 'rows="4" placeholder="1-bob: Massivlar\n2-bob: Rekursiya\nOʻtgan yilgi savollar"'))}
      <label class="cbx"><input type="checkbox" name="tasks" checked> Har bir mavzuni Reja boʻlimiga vazifa sifatida ham qoʻshish</label>
      <p class="muted sm">Mavzular bugundan imtihondan bir kun oldingacha teng taqsimlanadi.</p>`,
    onSubmit: o => {
      const topics = (o.topics || '').split('\n').map(x => x.trim()).filter(Boolean);
      if (!topics.length) return i.prep.length ? undefined : 'Kamida bitta mavzu yozing.';
      if (!i.due || daysBetween(today(), i.due) < 1) return 'Rejalashtirish uchun imtihon sanasi kamida ertaga boʻlishi kerak.';
      const span = daysBetween(today(), i.due);
      topics.forEach((t, k) => {
        const date = addDays(today(), Math.min(span - 1, Math.floor(k * span / topics.length)));
        i.prep.push({ id: uid(), t, date, done: false });
        if (o.tasks) D('tasks').list.push({ id: uid(), title: `${t} (${i.title})`, cat: 'Universitet', prio: 1, due: date, time: '', est: 60, recur: 'none', done: false, doneDates: [], created: nowISO() });
      });
      save('academic'); if (o.tasks) save('tasks'); toast('Tayyorgarlik rejasi tuzildi');
    }
  });
};
ACT['prep-tick'] = el => { const i = D('academic').items.find(x => x.id === el.dataset.id); const p = i.prep[+el.dataset.k]; p.done = !p.done; save('academic'); el.classList.toggle('on'); el.setAttribute('aria-checked', p.done); el.innerHTML = p.done ? ic('habits') : ''; el.nextElementSibling.classList.toggle('done', p.done); };

function uniGPA() {
  const list = D('courses').list, ac = D('academic');
  const cur = gpaOf(list.map(c => ({ credits: c.credits, grade: c.grade })));
  const past = ac.semesters.map(s => ({ s, g: gpaOf(s.courses) }));
  const all = gpaOf([...ac.semesters.flatMap(s => s.courses), ...list.filter(c => c.grade).map(c => ({ credits: c.credits, grade: c.grade }))]);
  const grades = S().gradeMap.map(g => g[0]);
  return `<div class="tiles">
    <div class="tile static"><span class="tile-k">Joriy semestr (taxminiy)</span><b>${cur.gpa === null ? '—' : cur.gpa.toFixed(2)}</b><span>${cur.credits} kredit baholangan</span></div>
    <div class="tile static"><span class="tile-k">Umumiy GPA</span><b>${all.gpa === null ? '—' : all.gpa.toFixed(2)}</b><span>${all.credits} kredit · shkala ${S().gpaScale}</span></div>
    <div class="tile static"><span class="tile-k">Jami kreditlar</span><b>${sum(ac.semesters.flatMap(s => s.courses), c => num(c.credits)) + sum(list, c => num(c.credits))}</b><span>oʻtgan semestrlar + joriy</span></div>
  </div>
  <section class="card">
    ${sectionHead('Joriy semestr baholari', '<span class="muted sm">kutilayotgan yoki yakuniy baho</span>')}
    ${list.length ? `<div class="tbl-w"><table class="tbl"><thead><tr><th>Kurs</th><th>Kredit</th><th>Joriy ball</th><th>Baho</th></tr></thead><tbody>${list.map(c => `<tr><td>${courseDot(c)} ${esc(c.name)}</td><td class="mono">${esc(c.credits || '')}</td><td class="mono">${courseScore(c) === null ? '—' : Math.round(courseScore(c)) + '%'}</td><td>${sel('g-' + c.id, [['', '—'], ...grades, 'P'], c.grade || '', `data-chg="course-grade" data-id="${c.id}" aria-label="Baho"`)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Kurs yoʻq.</p>'}
    ${list.length ? `<div class="row gap8 wrap">${btn('Semestrni yakunlash va arxivga oʻtkazish', 'sem-archive', '', 'sm ghost')}</div>` : ''}
  </section>
  <div class="grid g2">
    <section class="card">
      ${sectionHead('GPA kalkulyatori', '<span class="muted sm">“agar shunday olsam…”</span>')}
      <form data-form="gpa-calc" id="gpa-form">
        <div id="gpa-rows">${[0, 1, 2, 3, 4].map(k => `<div class="fgrid gpa-r">${inp('gn' + k, list[k]?.name || '', 'text', 'placeholder="Fan" aria-label="Fan"')}${inp('gc' + k, list[k]?.credits || '', 'number', 'placeholder="Kredit" min="0" step="0.5" aria-label="Kredit"')}${sel('gg' + k, [['', 'Baho'], ...grades], list[k]?.grade || '', 'aria-label="Baho"')}</div>`).join('')}</div>
        <div class="row between wrap gap8"><button class="btn primary sm">Hisoblash</button><output id="gpa-out" class="big mono">—</output></div>
        <p class="ferr"></p>
      </form>
    </section>
    <section class="card">
      ${sectionHead('Oʻtgan semestrlar', btn(`${ic('plus')} Semestr`, 'sem-edit', '', 'sm'))}
      ${past.length ? `<ul class="list">${past.map(({ s, g }) => `<li class="li"><span class="li-t"><b>${esc(s.name)}</b> <span class="muted sm">${s.courses.length} fan · ${g.credits} kredit</span></span><b class="mono">${g.gpa === null ? '—' : g.gpa.toFixed(2)}</b>${iconBtn('edit', 'sem-edit', `data-id="${s.id}"`, 'Tahrirlash')}</li>`).join('')}</ul>${past.length > 1 ? lineChart(past.map(({ s, g }) => ({ x: s.name, y: g.gpa })), { h: 130, fmt: v => v.toFixed(2) }) : ''}` : '<p class="muted">Oʻtgan semestr natijalarini kiritsangiz, umumiy GPA hisoblanadi.</p>'}
    </section>
  </div>
  <p class="muted sm">Baho → ball jadvali Sozlamalarda oʻzgartiriladi. Hozirgi jadval: ${S().gradeMap.map(g => `${esc(g[0])}=${g[1]}`).join(', ')}. “P” (pass) GPA ga kirmaydi. Universitetingiz qoidasini tekshirib, kerak boʻlsa moslang.</p>`;
}
CHG['course-grade'] = el => { const c = courseById(el.dataset.id); c.grade = el.value; save('courses'); render(); };
FORM['gpa-calc'] = (o, f) => {
  const rows = [0, 1, 2, 3, 4].map(k => ({ credits: o['gc' + k], grade: o['gg' + k] })).filter(r => r.grade && num(r.credits) > 0);
  if (!rows.length) return 'Kamida bitta fan uchun kredit va baho kiriting.';
  const g = gpaOf(rows); document.getElementById('gpa-out').textContent = g.gpa === null ? '—' : `${g.gpa.toFixed(2)} / ${S().gpaScale}`;
  f.querySelector('.ferr').textContent = '';
};
ACT['sem-edit'] = el => {
  const id = el.dataset.id, s = D('academic').semesters.find(x => x.id === id) || { name: '', courses: [] };
  const grades = S().gradeMap.map(g => g[0]);
  openModal({
    title: id ? 'Semestrni tahrirlash' : 'Oʻtgan semestr', wide: true,
    body: `${field('Nomi', inp('name', s.name, 'text', 'required placeholder="2025-2-semestr"'))}
    <p class="muted sm">Har qatorga: fan nomi, kredit, baho. Boʻsh qatorlar eʼtiborga olinmaydi.</p>
    ${Array.from({ length: Math.max(8, s.courses.length + 2) }, (_, k) => { const c = s.courses[k] || {}; return `<div class="fgrid gpa-r">${inp('n' + k, c.name, 'text', 'placeholder="Fan" aria-label="Fan"')}${inp('c' + k, c.credits, 'number', 'placeholder="Kredit" min="0" step="0.5" aria-label="Kredit"')}${sel('g' + k, [['', 'Baho'], ...grades, 'P'], c.grade || '', 'aria-label="Baho"')}</div>`; }).join('')}`,
    danger: id ? { label: 'Oʻchirish', fn: () => { const l = D('academic').semesters; l.splice(l.indexOf(s), 1); save('academic'); } } : null,
    onSubmit: o => {
      if (!(o.name || '').trim()) return 'Semestr nomini yozing.';
      const courses = Object.keys(o).filter(k => /^n\d+$/.test(k)).map(k => k.slice(1)).map(k => ({ name: (o['n' + k] || '').trim(), credits: num(o['c' + k]), grade: o['g' + k] || '' })).filter(c => c.name || c.grade);
      if (courses.some(c => c.grade && !c.credits)) return 'Baho qoʻyilgan har bir fan uchun kreditni kiriting.';
      Object.assign(s, { name: o.name.trim(), courses });
      if (!id) { s.id = uid(); D('academic').semesters.push(s); }
      save('academic');
    }
  });
};
ACT['sem-archive'] = () => {
  openModal({
    title: 'Semestrni yakunlash', submit: 'Yakunlash',
    body: `<p>Joriy kurslar va ularning baholari “Oʻtgan semestrlar”ga koʻchiriladi. Davomat va topshiriqlar tarixi saqlanadi. Kurslar roʻyxati keyingi semestr uchun tozalanadi.</p>${field('Semestr nomi', inp('name', S().semester || '', 'text', 'required'))}`,
    onSubmit: o => {
      if (!(o.name || '').trim()) return 'Nomini yozing.';
      const list = D('courses').list;
      if (list.some(c => !c.grade)) return 'Avval barcha kurslarga baho qoʻying (yoki “P”).';
      D('academic').semesters.push({ id: uid(), name: o.name.trim(), courses: list.map(c => ({ name: c.name, credits: num(c.credits), grade: c.grade })) });
      D('courses').archived = (D('courses').archived || []).concat(list.map(c => Object.assign({}, c, { archivedSem: o.name.trim() })));
      D('courses').list = [];
      save('academic'); save('courses'); toast('Semestr arxivlandi');
    }
  });
};

function uniCal() {
  const mk = selMonth('uni-m'), days = monthDays(mk), lead = (dow(days[0]) + 6) % 7;
  const items = D('academic').items, s = S();
  const inSem = d => s.semStart && s.semEnd && d >= s.semStart && d <= s.semEnd;
  const up = sortBy(items.filter(i => !i.done && i.due && i.due >= today() && ['exam', 'midterm', 'final', 'quiz', 'presentation'].includes(i.type)), i => i.due);
  return `<div class="grid g2">
  <section class="card">
    ${sectionHead('Semestr kalendari', monthNav('uni-m', mk))}
    <div class="cal"><div class="cal-h">${WEEK_ORDER.map(d => `<span>${UZ_DS[d]}</span>`).join('')}</div>
    <div class="cal-g">${Array(lead).fill('<span class="cc pad"></span>').join('')}${days.map(d => { const it = items.filter(i => i.due === d); const ex = it.some(i => ['exam', 'midterm', 'final'].includes(i.type)); return `<button class="cc ${d === today() ? 'today' : ''} ${inSem(d) ? 'sem' : ''} ${ex ? 'exam' : ''}" data-act="acad-edit" data-due="${d}" title="${it.map(i => esc(i.title)).join(', ')}"><span class="cc-n">${+d.slice(8)}</span>${it.length ? `<span class="dot uni">${it.length}</span>` : ''}${classesToday(d).length && inSem(d) ? `<span class="cc-c">${classesToday(d).length}</span>` : ''}</button>`; }).join('')}</div></div>
    <p class="muted sm">${s.semStart && s.semEnd ? `Semestr: ${fmtD(s.semStart)} – ${fmtD(s.semEnd)}. ` : 'Semestr boshlanish va tugash sanasini Sozlamalarda kiriting. '}Kunni bossangiz, oʻsha sanaga topshiriq qoʻshiladi.</p>
  </section>
  <section class="card">
    ${sectionHead('Yaqin imtihonlar')}
    ${up.length ? `<ul class="list">${up.map(i => { const c = courseById(i.courseId), p = i.prep || []; return `<li class="li"><span class="li-t">${courseDot(c)} <b>${esc(i.title)}</b><span class="muted sm"> · ${esc(c ? c.name : '')} · ${fmtD(i.due)} · ${dueText(i.due)}</span>${p.length ? bar(pct(p.filter(x => x.done).length, p.length)) : ''}</span>${btn(p.length ? 'Reja' : 'Reja tuzish', 'prep-open', `data-id="${i.id}"`, 'sm ghost')}</li>`; }).join('')}</ul>` : '<p class="muted">Yaqin imtihon kiritilmagan.</p>'}
  </section></div>`;
}

ACT['course-edit'] = el => {
  const id = el.dataset.id, c = courseById(id) || { sessions: [], rules: {}, color: COURSE_COLORS[D('courses').list.length % COURSE_COLORS.length] };
  const ss = c.sessions || [];
  openModal({
    title: id ? 'Kursni tahrirlash' : 'Yangi kurs', wide: true,
    body: `${field('Fan nomi', inp('name', c.name, 'text', 'required maxlength="100"'))}
    <div class="fgrid">${field('Kodi', inp('code', c.code))}${field('Kredit', inp('credits', c.credits, 'number', 'min="0" step="0.5"'))}${field('Rang', inp('color', c.color, 'color'))}</div>
    <div class="fgrid">${field('Professor', inp('prof', c.prof))}${field('Email', inp('email', c.email, 'email'))}${field('Ofis / qabul vaqti', inp('office', c.office))}</div>
    ${field('Asosiy xona', inp('room', c.room, 'text', 'placeholder="Masalan: 대양AI센터 …"'))}
    <h4 class="sub">Dars vaqtlari</h4>
    ${[0, 1, 2].map(k => { const x = ss[k] || {}; return `<div class="fgrid">${sel('sd' + k, [['', 'Kun'], ...WEEK_ORDER.map(d => [d, UZ_DAYS[d]])], x.d ?? '', 'aria-label="Kun"')}${inp('ss' + k, x.s, 'time', 'aria-label="Boshlanish"')}${inp('se' + k, x.e, 'time', 'aria-label="Tugash"')}${inp('sr' + k, x.room, 'text', 'placeholder="Xona (ixtiyoriy)" aria-label="Xona"')}</div>`; }).join('')}
    <h4 class="sub">Shu kursning qoidalari (syllabus boʻyicha, ixtiyoriy)</h4>
    <div class="fgrid">${field('Minimal davomat (%)', inp('minPct', c.rules?.minPct, 'number', 'min="0" max="100"'))}${field('Maks. qoldirish soni', inp('maxAbs', c.rules?.maxAbs, 'number', 'min="0"'))}${field('Nechta kechikish = 1 qoldirish', inp('lateAs', c.rules?.lateAs, 'number', 'min="0"'))}</div>
    ${field('Maqsad ball (%)', inp('target', c.target, 'number', 'min="0" max="100"'), 'Joriy ball shundan past boʻlsa ogohlantiradi.')}`,
    danger: id ? { label: 'Kursni oʻchirish', fn: () => { const l = D('courses').list; l.splice(l.indexOf(c), 1); save('courses'); } } : null,
    onSubmit: o => {
      const name = (o.name || '').trim(); if (!name) return 'Fan nomini yozing.';
      const sessions = [];
      for (const k of [0, 1, 2]) {
        if ((o['sd' + k] ?? '') === '' && !o['ss' + k]) continue;
        if ((o['sd' + k] ?? '') === '' || !o['ss' + k] || !o['se' + k]) return `${k + 1}-dars vaqti toʻliq emas: kun, boshlanish va tugash kerak.`;
        if (tmin(o['se' + k]) <= tmin(o['ss' + k])) return `${k + 1}-dars: tugash vaqti boshlanishdan keyin boʻlsin.`;
        sessions.push({ d: +o['sd' + k], s: o['ss' + k], e: o['se' + k], room: o['sr' + k] || '' });
      }
      Object.assign(c, { name, code: o.code || '', credits: o.credits === '' ? '' : num(o.credits), color: o.color, prof: o.prof || '', email: o.email || '', office: o.office || '', room: o.room || '', sessions, rules: { minPct: numOrNull(o.minPct), maxAbs: numOrNull(o.maxAbs), lateAs: numOrNull(o.lateAs) }, target: numOrNull(o.target) });
      if (!id) { c.id = uid(); D('courses').list.push(c); }
      save('courses'); toast('Kurs saqlandi');
    }
  });
};
