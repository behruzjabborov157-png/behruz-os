'use strict';
/* Ish va karyera: smenalar, soatlar va taxminiy maosh, toʻlovlar, ish arizalari, koʻnikmalar, loyihalar, IT yoʻl xaritasi */

const SHIFT_ST = { planned: ['Rejada', ''], ontime: ['Vaqtida keldim', 'ok'], late: ['Kechikdim', 'warn'], absent: ['Bormadim', 'bad'] };
const APP_ST = { plan: ['Reja', ''], sent: ['Yuborildi', 'mid'], test: ['Test / kodlash', 'mid'], interview: ['Intervyu', 'warn'], offer: ['Taklif', 'ok'], rejected: ['Rad etildi', 'bad'] };
const PROJ_ST = { idea: 'Gʻoya', doing: 'Jarayonda', done: 'Tugadi' };
const DEFAULT_ROADMAP = [
  ['1. Asoslar', ['Bitta dasturlash tilini chuqur oʻrganish (Python yoki Java)', 'Git va GitHub bilan ishlash', 'Maʼlumotlar tuzilmalari va algoritmlar (universitet kursi + mashq)', 'SQL asoslari']],
  ['2. Portfolio', ['GitHub profilini tartibga keltirish', '1-loyiha: kichik veb yoki ilova', '2-loyiha: maʼlumotlar bazasi bilan ishlaydigan loyiha', 'Har bir loyihaga README yozish']],
  ['3. Til va hujjatlar', ['TOPIK 3 yoki yuqori', 'Koreyscha va inglizcha rezyume (이력서)', 'Oʻzini tanishtirish xati (자기소개서)', 'LinkedIn profili']],
  ['4. Tajriba', ['Universitet laboratoriyasi yoki loyiha jamoasi', 'Amaliyot (인턴) arizalari', 'Hakaton yoki tanlovda qatnashish']],
  ['5. Birinchi IT ish', ['Ish qidirish saytlarida profil (masalan Saramin, JobKorea, Wanted)', 'Kodlash testlariga tayyorgarlik', 'Viza va ish ruxsati shartlarini rasmiy manbadan tekshirish']]
];
function makeDefaultRoadmap() { const r = D('work').roadmap; DEFAULT_ROADMAP.forEach(([stage, items]) => items.forEach(t => r.push({ id: uid(), stage, t, done: false }))); save('work'); }

VIEWS.work = () => {
  const tab = curTab('work', 'shifts');
  return tabs('work', [['shifts', 'Smenalar'], ['pay', 'Maosh'], ['apps', 'Ish arizalari'], ['skills', 'Koʻnikma va loyihalar'], ['road', 'IT yoʻl xaritasi']]) +
    ({ shifts: workShifts, pay: workPay, apps: workApps, skills: workSkills, road: workRoad }[tab] || workShifts)();
};

function workShifts() {
  const w = D('work'), job = w.job, ref = APP.sel.wweek || today(), days = weekDays(ref);
  const shifts = days.flatMap(d => inMonth('shifts', monthKey(d)).filter(s => s.date === d));
  const done = shifts.filter(s => s.st === 'ontime' || s.st === 'late');
  const wkMin = sum(done, shiftMin), planMin = sum(shifts.filter(s => s.st === 'planned'), shiftMin);
  const mk = monthKey(today()), mp = monthPay(mk);
  const allMonth = inMonth('shifts', mk).filter(s => s.st !== 'planned');
  const punct = allMonth.length ? pct(allMonth.filter(s => s.st === 'ontime').length, allMonth.length) : null;
  if (!job.wage && !w.template.length && !shifts.length) {
    return empty('Ish maʼlumotlari kiritilmagan', 'Ish joyi, soatlik maosh va haftalik smena jadvalini kiriting. Maosh shu raqamlardan taxminan hisoblanadi.', btn('Ish maʼlumotlarini kiritish', 'job-edit', '', 'primary'));
  }
  return `<div class="tiles">
    <div class="tile static"><span class="tile-k">Shu hafta</span><b>${hrs(wkMin)}</b><span>ishlandi · rejada yana ${hrs(planMin)}</span></div>
    <div class="tile static"><span class="tile-k">Shu oy (taxminiy)</span><b>${won(mp.net)}</b><span>${hrs(mp.min)} · ${mp.count} smena</span></div>
    <div class="tile static"><span class="tile-k">Oʻz vaqtida kelish</span><b>${punct === null ? '—' : punct + '%'}</b><span>shu oy</span></div>
  </div>
  <section class="card">
    <div class="row between wrap gap8"><div class="datenav"><button class="ibtn" data-act="wwnav" data-n="-7" aria-label="Oldingi hafta">${ic('left')}</button><span class="dn-l">${fmtD(days[0])} – ${fmtD(days[6])}</span><button class="ibtn" data-act="wwnav" data-n="7" aria-label="Keyingi hafta">${ic('right')}</button></div>
    <div class="row gap8 wrap">${w.template.length ? btn('Jadvaldan haftani toʻldirish', 'shift-fill', `data-w="${days[0]}"`, 'sm ghost') : ''}${btn('Ish sozlamalari', 'job-edit', '', 'sm ghost')}${btn(`${ic('plus')} Smena`, 'shift-edit', '', 'sm primary')}</div></div>
    ${shifts.length ? `<ul class="list">${sortBy(shifts, s => s.date + s.s).map(s => `<li class="li"><span class="li-t"><b>${UZ_DAYS[dow(s.date)]}</b> <span class="muted sm">${fmtD(s.date)}</span> · <span class="mono">${s.s}–${s.e}</span>${num(s.brk) ? ` <span class="muted sm">(tanaffus ${s.brk} daq)</span>` : ''} · <span class="mono">${hrs(shiftMin(s))}</span></span>
      <div class="seg sm">${Object.entries(SHIFT_ST).map(([k, [l, c]]) => `<button class="seg-b ${s.st === k ? 'on ' + c : ''}" data-act="shift-st" data-id="${s.id}" data-st="${k}">${l}</button>`).join('')}</div>${iconBtn('edit', 'shift-edit', `data-id="${s.id}"`, 'Tahrirlash')}</li>`).join('')}</ul>` : `<p class="muted">Bu haftada smena yoʻq.</p>`}
    ${w.template.length ? `<p class="muted sm">Haftalik jadval: ${w.template.map(t => `${UZ_DS[t.d]} ${t.s}–${t.e}`).join(', ')}</p>` : '<p class="muted sm">Doimiy haftalik jadvalni “Ish sozlamalari”da kiritsangiz, bir tugma bilan haftani toʻldirasiz.</p>'}
  </section>`;
}
ACT.wwnav = el => { APP.sel.wweek = addDays(APP.sel.wweek || today(), +el.dataset.n); render(); };
ACT['shift-st'] = el => { const s = findM('shifts', el.dataset.id); s.st = el.dataset.st; upsertM('shifts', s); render(); };
ACT['shift-fill'] = el => {
  const w = D('work'), days = weekDays(el.dataset.w); let n = 0;
  days.forEach(d => w.template.filter(t => +t.d === dow(d)).forEach(t => { if (!inMonth('shifts', monthKey(d)).some(s => s.date === d && s.s === t.s)) { upsertM('shifts', { id: uid(), date: d, s: t.s, e: t.e, brk: t.brk || 0, st: 'planned' }); n++; } }));
  toast(n ? `${n} ta smena qoʻshildi` : 'Bu hafta allaqachon toʻldirilgan'); render();
};
ACT['shift-edit'] = el => {
  const id = el.dataset.id, s = id ? findM('shifts', id) : { date: today(), s: '', e: '', brk: 0, st: 'planned' };
  openModal({
    title: id ? 'Smenani tahrirlash' : 'Smena qoʻshish',
    body: `<div class="fgrid">${field('Sana', inp('date', s.date, 'date', 'required'))}${field('Boshlanish', inp('s', s.s, 'time', 'required'))}${field('Tugash', inp('e', s.e, 'time', 'required'))}</div>
    <div class="fgrid">${field('Tanaffus (daq)', inp('brk', s.brk, 'number', 'min="0" step="5"'))}${field('Holat', sel('st', Object.entries(SHIFT_ST).map(([k, v]) => [k, v[0]]), s.st))}${field('Boshqa soatlik maosh (ixtiyoriy)', inp('wage', s.wage, 'text', 'inputmode="numeric" placeholder="masalan tungi smena"'))}</div>
    ${field('Izoh', inp('note', s.note))}`,
    danger: id ? { label: 'Oʻchirish', fn: () => removeM('shifts', id) } : null,
    onSubmit: o => {
      if (!o.date || !o.s || !o.e) return 'Sana, boshlanish va tugash vaqtini kiriting.';
      const t = { s: o.s, e: o.e, brk: num(o.brk) }; if (shiftMin(t) <= 0) return 'Tanaffus smenadan uzun boʻlib qoldi.';
      upsertM('shifts', Object.assign(s, { id: s.id || uid(), date: o.date, s: o.s, e: o.e, brk: num(o.brk), st: o.st, wage: o.wage ? num(o.wage) : '', note: o.note || '' }));
    }
  });
};
ACT['job-edit'] = () => {
  const w = D('work'), j = w.job, t = w.template;
  openModal({
    title: 'Ish sozlamalari', wide: true,
    body: `<div class="fgrid">${field('Ish joyi', inp('name', j.name, 'text', 'placeholder="Restoran nomi"'))}${field('Soatlik maosh (₩)', inp('wage', j.wage || '', 'text', 'inputmode="numeric"'), 'Shartnomangizdagi summa')}${field('Maosh kuni (oyning)', inp('payday', j.payday, 'number', 'min="1" max="31"'))}</div>
    <div class="fgrid">${field('Ushlab qolinadigan soliq (%)', inp('tax', j.tax || 0, 'number', 'min="0" max="50" step="0.1"'), 'Masalan 3.3. Bilmasangiz 0 qoldiring.')}<label class="cbx"><input type="checkbox" name="juhyu" ${j.juhyu ? 'checked' : ''}> Haftalik dam olish puli (주휴수당) ni hisoblash</label></div>
    <p class="muted sm">주휴수당: haftasiga 15 soat va undan koʻp ishlaganda qoʻshiladi (hisob: ishlangan soat ÷ 40 × 8 × soatlik maosh, koʻpi bilan 8 soat). Sizga toʻlanishini ish beruvchidan aniqlang.</p>
    <h4 class="sub">Doimiy haftalik jadval</h4>
    ${[0, 1, 2, 3, 4, 5].map(k => { const x = t[k] || {}; return `<div class="fgrid">${sel('td' + k, [['', 'Kun'], ...WEEK_ORDER.map(d => [d, UZ_DAYS[d]])], x.d ?? '', 'aria-label="Kun"')}${inp('ts' + k, x.s, 'time', 'aria-label="Boshlanish"')}${inp('te' + k, x.e, 'time', 'aria-label="Tugash"')}${inp('tb' + k, x.brk, 'number', 'placeholder="Tanaffus, daq" min="0" aria-label="Tanaffus"')}</div>`; }).join('')}`,
    onSubmit: o => {
      const tpl = [];
      for (const k of [0, 1, 2, 3, 4, 5]) {
        if ((o['td' + k] ?? '') === '' && !o['ts' + k]) continue;
        if ((o['td' + k] ?? '') === '' || !o['ts' + k] || !o['te' + k]) return `${k + 1}-qator toʻliq emas.`;
        tpl.push({ d: +o['td' + k], s: o['ts' + k], e: o['te' + k], brk: num(o['tb' + k]) });
      }
      if (o.wage && num(o.wage) <= 0) return 'Soatlik maoshni toʻgʻri kiriting.';
      Object.assign(w.job, { name: o.name || '', wage: num(o.wage), payday: num(o.payday) || 10, tax: num(o.tax), juhyu: !!o.juhyu }); w.template = tpl; save('work');
    }
  });
};

function workPay() {
  const w = D('work'), cur = monthKey(today());
  const months = [-5, -4, -3, -2, -1, 0].map(n => addMonths(cur, n));
  return `<section class="card">
    ${sectionHead('Oylik maosh', `<span class="muted sm">maosh kuni: har oyning ${w.job.payday}-sanasi</span>`)}
    <div class="tbl-w"><table class="tbl"><thead><tr><th>Oy</th><th>Soat</th><th>Asosiy</th><th>주휴</th><th>Soliq</th><th>Taxminiy</th><th>Olindi</th><th>Holat</th><th></th></tr></thead><tbody>
    ${[...months].reverse().map(mk => { const p = monthPay(mk), r = w.payments.find(x => x.month === mk); const st = r ? (num(r.received) >= p.net * 0.98 || r.st === 'full' ? ['Olindi', 'ok'] : num(r.received) > 0 ? ['Qisman', 'warn'] : ['Kutilmoqda', '']) : ['Kutilmoqda', ''];
      return `<tr><td>${fmtM(mk)}</td><td class="mono">${(p.min / 60).toFixed(1)}</td><td class="mono">${won(p.base)}</td><td class="mono">${won(p.juhyu)}</td><td class="mono">${won(p.tax)}</td><td class="mono"><b>${won(p.net)}</b></td><td class="mono">${r ? won(r.received) : '—'}</td><td>${p.min || r ? chip(st[0], st[1]) : ''}</td><td>${btn('Yozish', 'pay-edit', `data-mk="${mk}"`, 'sm ghost')}</td></tr>`; }).join('')}
    </tbody></table></div>
    <p class="muted sm">“Taxminiy” — siz kiritgan smenalar va soatlik maoshdan hisoblanadi. Haqiqiy summani maosh kelganda “Yozish” orqali kiriting; farq boʻlsa, ish beruvchidan payslip (급여명세서) soʻrang.</p>
  </section>`;
}
ACT['pay-edit'] = el => {
  const mk = el.dataset.mk, w = D('work'), r = w.payments.find(x => x.month === mk) || { month: mk }, p = monthPay(mk);
  openModal({
    title: `${fmtM(mk)} maoshi`,
    body: `<p class="muted">Taxminiy: <b>${won(p.net)}</b></p><div class="fgrid">${field('Olingan summa (₩)', inp('received', r.received ?? '', 'text', 'inputmode="numeric"'))}${field('Olingan sana', inp('date', r.date || today(), 'date'))}</div>
    ${r.id ? '' : '<label class="cbx"><input type="checkbox" name="tx" checked> Daromad sifatida Pul boʻlimiga ham yozish</label>'}${field('Izoh', inp('note', r.note))}`,
    onSubmit: o => {
      if (o.received === '' || num(o.received) < 0) return 'Olingan summani kiriting.';
      Object.assign(r, { received: num(o.received), date: o.date, note: o.note || '' });
      if (!r.id) { r.id = uid(); w.payments.push(r); if (o.tx && num(o.received) > 0) upsertM('tx', { id: uid(), type: 'in', amt: num(o.received), date: o.date || today(), cat: 'Ish haqi', note: `${w.job.name || 'Ish'} · ${fmtM(mk)}`, impulse: false, created: nowISO() }); }
      save('work');
    }
  });
};

function workApps() {
  const apps = D('work').apps;
  return `<section class="card">
    ${sectionHead('Ish va amaliyot arizalari', btn(`${ic('plus')} Ariza`, 'app-edit', '', 'primary sm'))}
    ${apps.length ? `<div class="pipe">${Object.entries(APP_ST).map(([k, [l, c]]) => { const l2 = apps.filter(a => a.st === k); return `<div class="pipe-c"><div class="pipe-h">${chip(l, c)} <span class="mono">${l2.length}</span></div>${l2.map(a => `<button class="pcard" data-act="app-edit" data-id="${a.id}"><b>${esc(a.company)}</b><span>${esc(a.role || '')}</span>${a.next ? `<span class="muted sm">Keyingi qadam: ${esc(a.next)}${a.nextDate ? ' · ' + fmtD(a.nextDate) : ''}</span>` : ''}</button>`).join('')}</div>`; }).join('')}</div>` : empty('Hali ariza yoʻq', 'Amaliyot (인턴), yarim kunlik IT ish yoki keyingi ish arizalarini shu yerda kuzating: kompaniya, lavozim, holat, keyingi qadam.')}
  </section>`;
}
ACT['app-edit'] = el => {
  const id = el.dataset.id, l = D('work').apps, a = l.find(x => x.id === id) || { st: 'plan', date: today() };
  openModal({
    title: id ? 'Arizani tahrirlash' : 'Yangi ariza',
    body: `<div class="fgrid">${field('Kompaniya', inp('company', a.company, 'text', 'required'))}${field('Lavozim', inp('role', a.role, 'text', 'placeholder="Backend intern"'))}</div>
    <div class="fgrid">${field('Holat', sel('st', Object.entries(APP_ST).map(([k, v]) => [k, v[0]]), a.st))}${field('Ariza sanasi', inp('date', a.date, 'date'))}${field('Havola', inp('link', a.link, 'url', 'placeholder="https://"'))}</div>
    <div class="fgrid">${field('Keyingi qadam', inp('next', a.next, 'text', 'placeholder="Kodlash testi"'))}${field('Keyingi qadam sanasi', inp('nextDate', a.nextDate, 'date'))}</div>${field('Izoh', area('notes', a.notes))}`,
    danger: id ? { label: 'Oʻchirish', fn: () => { l.splice(l.indexOf(a), 1); save('work'); } } : null,
    onSubmit: o => { if (!(o.company || '').trim()) return 'Kompaniya nomini yozing.'; if (o.link && !/^https?:\/\//.test(o.link)) return 'Havola https:// bilan boshlansin.'; Object.assign(a, { company: o.company.trim(), role: o.role || '', st: o.st, date: o.date || '', link: o.link || '', next: o.next || '', nextDate: o.nextDate || '', notes: o.notes || '' }); if (!id) { a.id = uid(); l.push(a); } save('work'); }
  });
};

function workSkills() {
  const w = D('work');
  return `<div class="grid g2">
    <section class="card">
      ${sectionHead('Koʻnikmalar', btn(`${ic('plus')} Koʻnikma`, 'skill-edit', '', 'primary sm'))}
      ${w.skills.length ? `<ul class="list">${w.skills.map(s => `<li class="li"><span class="li-t"><b>${esc(s.name)}</b><span class="lvl-dots" aria-label="${s.level} / 5">${[1, 2, 3, 4, 5].map(i => `<button class="ld ${i <= s.level ? 'on' : ''} ${i <= (s.target || 0) && i > s.level ? 'tg' : ''}" data-act="skill-lvl" data-id="${s.id}" data-l="${i}" aria-label="${i}-daraja"></button>`).join('')}</span></span><span class="muted sm">${s.level}/5${s.target ? ' · maqsad ' + s.target : ''}</span>${iconBtn('edit', 'skill-edit', `data-id="${s.id}"`, 'Tahrirlash')}</li>`).join('')}</ul>` : empty('Koʻnikma yoʻq', 'Masalan: Python, Java, SQL, Git, React, Linux. Darajani 1–5 nuqta bilan belgilaysiz.')}
    </section>
    <section class="card">
      ${sectionHead('Loyihalar (portfolio)', btn(`${ic('plus')} Loyiha`, 'proj-edit', '', 'primary sm'))}
      ${w.projects.length ? `<ul class="list">${w.projects.map(p => `<li class="li"><span class="li-t"><b>${esc(p.name)}</b> ${chip(PROJ_ST[p.st] || '', p.st === 'done' ? 'ok' : p.st === 'doing' ? 'warn' : '')}<br><span class="muted sm">${esc(p.desc || '')}</span>${bar(p.progress || 0)}${p.link ? `<a class="sm" href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.link)}</a>` : ''}</span>${iconBtn('edit', 'proj-edit', `data-id="${p.id}"`, 'Tahrirlash')}</li>`).join('')}</ul>
      <p class="muted sm">${w.projects.filter(p => p.st === 'done').length} ta tugagan loyiha.</p>` : empty('Loyiha yoʻq', 'Portfolio uchun 2–3 ta tugallangan loyiha yetarli. Birinchisini kichik qilib boshlang.')}
    </section>
  </div>`;
}
ACT['skill-lvl'] = el => { const s = D('work').skills.find(x => x.id === el.dataset.id); const l = +el.dataset.l; s.level = s.level === l ? l - 1 : l; save('work'); render(); };
ACT['skill-edit'] = el => {
  const id = el.dataset.id, l = D('work').skills, s = l.find(x => x.id === id) || { level: 1, target: 3 };
  openModal({
    title: id ? 'Koʻnikma' : 'Yangi koʻnikma',
    body: `${field('Nomi', inp('name', s.name, 'text', 'required'))}<div class="fgrid">${field('Hozirgi daraja (0–5)', inp('level', s.level, 'number', 'min="0" max="5"'))}${field('Maqsad daraja', inp('target', s.target, 'number', 'min="0" max="5"'))}</div>${field('Qanday oʻrganaman', inp('how', s.how, 'text', 'placeholder="Kurs, kitob, loyiha"'))}`,
    danger: id ? { label: 'Oʻchirish', fn: () => { l.splice(l.indexOf(s), 1); save('work'); } } : null,
    onSubmit: o => { if (!(o.name || '').trim()) return 'Nomini yozing.'; Object.assign(s, { name: o.name.trim(), level: clamp(num(o.level), 0, 5), target: clamp(num(o.target), 0, 5), how: o.how || '' }); if (!id) { s.id = uid(); l.push(s); } save('work'); }
  });
};
ACT['proj-edit'] = el => {
  const id = el.dataset.id, l = D('work').projects, p = l.find(x => x.id === id) || { st: 'idea', progress: 0 };
  openModal({
    title: id ? 'Loyiha' : 'Yangi loyiha',
    body: `${field('Nomi', inp('name', p.name, 'text', 'required'))}${field('Qisqa tavsif', area('desc', p.desc))}<div class="fgrid">${field('Holat', sel('st', Object.entries(PROJ_ST), p.st))}${field('Tayyorlik (%)', inp('progress', p.progress, 'number', 'min="0" max="100" step="5"'))}${field('GitHub / havola', inp('link', p.link, 'url'))}</div>`,
    danger: id ? { label: 'Oʻchirish', fn: () => { l.splice(l.indexOf(p), 1); save('work'); } } : null,
    onSubmit: o => { if (!(o.name || '').trim()) return 'Nomini yozing.'; if (o.link && !/^https?:\/\//.test(o.link)) return 'Havola https:// bilan boshlansin.'; Object.assign(p, { name: o.name.trim(), desc: o.desc || '', st: o.st, progress: clamp(num(o.progress), 0, 100), link: o.link || '' }); if (!id) { p.id = uid(); l.push(p); } save('work'); }
  });
};

function workRoad() {
  const r = D('work').roadmap;
  if (!r.length) return empty('Yoʻl xaritasi boʻsh', 'Restoran ishidan IT sohasiga bosqichma-bosqich oʻtish uchun tayyor reja bilan boshlang, keyin oʻzingizga moslang.', btn('Tayyor rejani qoʻshish', 'road-default', '', 'primary'));
  const stages = [...new Set(r.map(x => x.stage))];
  const done = r.filter(x => x.done).length;
  return `<section class="card">
    ${sectionHead('IT karyera yoʻl xaritasi', `<span class="mono">${done}/${r.length}</span>`)}
    ${bar(pct(done, r.length))}
    <p class="muted sm">Muvozanat: universitet va moliya birinchi oʻrinda. Haftasiga 2–3 soat ham yetarli. Asosiysi, toʻxtamaslik.</p>
    <div class="road">${stages.map(st => { const it = r.filter(x => x.stage === st), d = it.filter(x => x.done).length; return `<div class="stage ${d === it.length ? 'done' : ''}"><div class="row between"><h4>${esc(st)}</h4><span class="mono sm">${d}/${it.length}</span></div>
      <ul class="list compact">${it.map(x => `<li class="li">${check(x.done ? 1 : undefined, 'road-tick', `data-id="${x.id}"`, x.t)}<span class="li-t ${x.done ? 'done' : ''}">${esc(x.t)}</span>${iconBtn('trash', 'road-del', `data-id="${x.id}"`, 'Oʻchirish')}</li>`).join('')}</ul>
      <form data-form="road-add" class="inline-form" data-st="${esc(st)}"><input name="t" id="f-road-${stages.indexOf(st)}" placeholder="Qadam qoʻshish" aria-label="Yangi qadam"><button class="btn sm">${ic('plus')}</button><p class="ferr"></p></form></div>`; }).join('')}</div>
    <form data-form="road-stage" class="inline-form"><input name="t" id="f-road-stage" placeholder="Yangi bosqich nomi" aria-label="Yangi bosqich"><input name="first" id="f-road-first" placeholder="Birinchi qadam" aria-label="Birinchi qadam"><button class="btn sm">Bosqich qoʻshish</button><p class="ferr"></p></form>
  </section>`;
}
ACT['road-default'] = () => { makeDefaultRoadmap(); render(); };
ACT['road-tick'] = el => { const x = D('work').roadmap.find(r => r.id === el.dataset.id); x.done = !x.done; x.doneAt = x.done ? today() : null; save('work'); render(); };
ACT['road-del'] = el => { const l = D('work').roadmap; l.splice(l.findIndex(r => r.id === el.dataset.id), 1); save('work'); render(); };
FORM['road-add'] = (o, f) => { const t = (o.t || '').trim(); if (!t) return 'Qadam matnini yozing.'; D('work').roadmap.push({ id: uid(), stage: f.dataset.st, t, done: false }); save('work'); render(); };
FORM['road-stage'] = o => { const st = (o.t || '').trim(), t = (o.first || '').trim(); if (!st || !t) return 'Bosqich nomi va birinchi qadamni yozing.'; D('work').roadmap.push({ id: uid(), stage: st, t, done: false }); save('work'); render(); };
