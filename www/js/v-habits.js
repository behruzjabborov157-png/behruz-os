'use strict';
/* Odatlar: kunlik belgilash, seriyalar, statistika, issiqlik xaritasi, boshqarish */

const HABIT_CATS = ['Imon', 'Oʻqish', 'Tillar', 'Sogʻliq', 'Moliya', 'Intizom', 'Boshqa'];
const DEFAULT_HABITS = [
  ['Vaqtida uygʻonish', 'Sogʻliq', 'wake', 'Belgilangan vaqtda', true],
  ['Vaqtida uxlash', 'Sogʻliq', 'sleep', 'Belgilangan vaqtda', true],
  ['5 vaqt namoz', 'Imon', 'prayers', '5/5', true],
  ['Qurʼon oʻqish yoki oʻrganish', 'Imon', 'quran', 'Kamida 1 sahifa', false],
  ['Barcha darslarga borish', 'Oʻqish', 'classes', 'Dars bor kunlari', true],
  ['Koreys: soʻz va grammatika', 'Tillar', 'ko', 'Kunlik maqsad', false],
  ['Ingliz tili mashqi', 'Tillar', 'en', 'Kunlik maqsad', false],
  ['Sport yoki yurish', 'Sogʻliq', 'exercise', 'Mashq yoki 20 daq yurish', false],
  ['Toʻgʻri ovqat va yetarli suv', 'Sogʻliq', 'water', 'Suv maqsadi', false],
  ['Ijtimoiy tarmoqni cheklash', 'Intizom', 'social', 'Chegaradan oshmaslik', false],
  ['Keraksiz oʻyin oʻynamaslik', 'Intizom', 'gaming', 'Chegaradan oshmaslik', false],
  ['Impulsiv xarid va keys ochmaslik', 'Moliya', 'impulse', '0 ta impuls xarid', false],
  ['Kundalik vazifalarni bajarish', 'Intizom', 'tasks', 'Bugungi vazifalar', false],
  ['Kunni sharhlash', 'Intizom', 'review', 'Uxlashdan oldin', false]
];
function makeDefaultHabits(names) {
  const list = D('habits').list;
  DEFAULT_HABITS.forEach(([name, cat, link, target, core], i) => {
    if (names && !names.includes(name)) return;
    list.push({ id: uid(), name, cat, link, target, core, days: [0, 1, 2, 3, 4, 5, 6], order: list.length, created: today() });
  });
  save('habits');
}

/* belgilash: belgilanmagan -> bajarildi -> bajarilmadi -> belgilanmagan */
ACT['habit-tick'] = el => {
  const id = el.dataset.id, date = el.dataset.d;
  const h = D('habits').list.find(x => x.id === id); if (!h) return;
  const cur = habitManual(h, date);
  const shown = habitStatus(h, date);
  let next;
  if (cur === undefined) next = shown === 1 ? 0 : 1;
  else if (cur === 1) next = 0;
  else next = undefined;
  setDay(date, d => { d.h = d.h || {}; if (next === undefined) delete d.h[id]; else d.h[id] = next; });
  render();
};

VIEWS.habits = () => {
  const tab = curTab('habits', 'today');
  return tabs('habits', [['today', 'Belgilash'], ['stats', 'Statistika'], ['manage', 'Boshqarish']]) + (tab === 'stats' ? habitsStats() : tab === 'manage' ? habitsManage() : habitsToday());
};

function habitsToday() {
  const date = selDate('habits');
  const list = activeHabits();
  if (!list.length) return empty('Hali odat yoʻq', 'Tayyor roʻyxatdan boshlang yoki oʻzingiz qoʻshing.', `<div class="row gap8">${btn('Tayyor 14 ta odatni qoʻshish', 'habits-defaults', '', 'primary')}${btn('Odat qoʻshish', 'habit-edit')}</div>`);
  const sched = list.filter(h => habitCounted(h, date));
  const other = list.filter(h => !habitCounted(h, date));
  const done = sched.filter(h => habitStatus(h, date) === 1).length;
  const last14 = lastN(14, date);
  const row = h => {
    const st = habitStatus(h, date), sk = habitStreak(h), r = habitRate(h, 30);
    return `<li class="hrow">
      ${check(st, 'habit-tick', `data-id="${h.id}" data-d="${date}"`, h.name)}
      <div class="hrow-m"><button class="linkish" data-act="habit-detail" data-id="${h.id}">${esc(h.name)}</button>
        <span class="muted sm">${esc(h.target || '')}${h.link ? ` · avto: ${LINKS[h.link][0].toLowerCase()}` : ''}${habitManual(h, date) !== undefined && h.link ? ' · qoʻlda oʻzgartirilgan' : ''}</span></div>
      ${strip(last14, d => habitCounted(h, d) ? (habitStatus(h, d) === undefined ? (d === today() ? undefined : 0) : habitStatus(h, d)) : null)}
      <span class="hrow-s" title="Joriy seriya">${ic('flame', sk.cur ? 'fl' : 'muted')}<b class="mono">${sk.cur}</b></span>
      <span class="hrow-p mono" title="30 kunlik bajarilish">${r.p === null ? '—' : Math.round(r.p * 100) + '%'}</span>
    </li>`;
  };
  return `
  <section class="card">
    <div class="row between wrap gap8">${dateNav('habits', date)}<span class="mono">${done}/${sched.length} · ${pct(done, sched.length)}%</span></div>
    ${bar(pct(done, sched.length))}
    ${day(date).minimal ? `<p class="note">${ic('bolt')} Minimal kun: faqat “minimal kunda ham” belgilangan odatlar hisoblanadi.</p>` : ''}
    <ul class="hlist">${sched.map(row).join('')}</ul>
    ${other.length ? `<details class="more-d"><summary>Bu kunga rejalashtirilmagan (${other.length})</summary><ul class="hlist dim">${other.map(row).join('')}</ul></details>` : ''}
    <p class="muted sm">Bir marta bosish — bajarildi, ikki marta — bajarilmadi, uch marta — belgini olib tashlash. “Avto” odatlar boshqa boʻlimlardagi yozuvlardan oʻzi hisoblanadi, lekin qoʻlda oʻzgartirsa boʻladi. Oʻtgan kunlarni ham belgilashingiz mumkin; oʻtkazib yuborilgan kunlar tarixda qoladi.</p>
  </section>`;
}

function habitsStats() {
  const mk = selMonth('habits-m');
  const list = activeHabits();
  if (!list.length) return empty('Statistika uchun odat kerak', 'Avval odat qoʻshing.', btn('Odat qoʻshish', 'habit-edit', '', 'primary'));
  const week = weekDays(today()).map(d => ({ label: UZ_DS[dow(d)], value: d > today() ? 0 : Math.round((habitsDayRatio(d) ?? 0) * 100) }));
  const prevW = weekDays(addDays(today(), -7)).map(d => habitsDayRatio(d)).filter(v => v !== null);
  const curW = weekDays(today()).filter(d => d <= today()).map(d => habitsDayRatio(d)).filter(v => v !== null);
  const rows = list.map(h => ({ h, r7: habitRate(h, 7), r30: habitRate(h, 30), s: habitStreak(h) }));
  return `
  <div class="grid g2">
    <section class="card">${sectionHead('Shu hafta', `<span class="muted sm">${curW.length ? Math.round(avg(curW) * 100) + '%' : '—'} · oʻtgan hafta ${prevW.length ? Math.round(avg(prevW) * 100) + '%' : '—'}</span>`)}
      ${barChart(week, { h: 150, max: 100, fmt: v => Math.round(v) + '%' })}</section>
    <section class="card">${sectionHead('Oylik xarita', monthNav('habits-m', mk))}
      ${heatmap(mk, d => habitsDayRatio(d))}</section>
  </div>
  <section class="card">${sectionHead('Har bir odat')}
    <div class="tbl-w"><table class="tbl"><thead><tr><th>Odat</th><th>7 kun</th><th>30 kun</th><th>Seriya</th><th>Eng yaxshi</th><th>Oʻtkazilgan (30 kun)</th></tr></thead>
    <tbody>${rows.map(x => `<tr><td><button class="linkish" data-act="habit-detail" data-id="${x.h.id}">${esc(x.h.name)}</button></td><td class="mono">${x.r7.p === null ? '—' : Math.round(x.r7.p * 100) + '%'}</td><td class="mono">${x.r30.p === null ? '—' : Math.round(x.r30.p * 100) + '%'}</td><td class="mono">${x.s.cur}</td><td class="mono">${x.s.best}</td><td class="mono">${x.r30.total - x.r30.done}</td></tr>`).join('')}</tbody></table></div>
  </section>`;
}

function habitsManage() {
  const all = sortBy(D('habits').list, h => (h.archivedAt ? 1000 : 0) + (h.order ?? 0));
  return `<section class="card">
    ${sectionHead('Odatlar roʻyxati', btn(`${ic('plus')} Yangi odat`, 'habit-edit', '', 'primary sm'))}
    ${all.length ? `<ul class="list">${all.map(h => `<li class="li ${h.archivedAt ? 'dim' : ''}">
      <div class="li-t"><b>${esc(h.name)}</b><span class="muted sm"> · ${esc(h.cat || '')} · ${(h.days || []).length === 7 ? 'har kuni' : WEEK_ORDER.filter(d => (h.days || []).includes(d)).map(d => UZ_DS[d]).join(', ')}${h.core ? ' · minimal kunda ham' : ''}${h.archivedAt ? ' · arxivda' : ''}</span></div>
      ${h.archivedAt ? '' : iconBtn('up', 'habit-move', `data-id="${h.id}" data-n="-1"`, 'Yuqoriga') + iconBtn('down', 'habit-move', `data-id="${h.id}" data-n="1"`, 'Pastga')}
      ${iconBtn('edit', 'habit-edit', `data-id="${h.id}"`, 'Tahrirlash')}
      ${h.archivedAt ? btn('Qaytarish', 'habit-restore', `data-id="${h.id}"`, 'sm ghost') : ''}
    </li>`).join('')}</ul>` : empty('Roʻyxat boʻsh', 'Yangi odat qoʻshing.', btn('Tayyor 14 ta odatni qoʻshish', 'habits-defaults', '', 'sm'))}
    <p class="muted sm">Odatni “arxivlash” uni bugundan boshlab yashiradi, tarixi saqlanadi. Butunlay oʻchirish tarixni ham oʻchiradi.</p>
  </section>`;
}

ACT['habits-defaults'] = () => { makeDefaultHabits(); toast('14 ta odat qoʻshildi'); render(); };
ACT['habit-move'] = el => {
  const list = activeHabits(); const i = list.findIndex(h => h.id === el.dataset.id), j = i + +el.dataset.n;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]]; list.forEach((h, k) => h.order = k); save('habits'); render();
};
ACT['habit-restore'] = el => { const h = D('habits').list.find(x => x.id === el.dataset.id); delete h.archivedAt; save('habits'); render(); };
ACT['habit-edit'] = el => {
  const id = el.dataset.id, h = D('habits').list.find(x => x.id === id) || { days: [0, 1, 2, 3, 4, 5, 6], cat: 'Boshqa', link: '' };
  openModal({
    title: id ? 'Odatni tahrirlash' : 'Yangi odat',
    body: `${field('Nomi', inp('name', h.name, 'text', 'required maxlength="80"'))}
      <div class="fgrid">${field('Turkum', sel('cat', HABIT_CATS, h.cat))}${field('Maqsad', inp('target', h.target, 'text', 'placeholder="Masalan: 30 daqiqa"'))}</div>
      ${field('Qaysi kunlari', daysPicker('days', h.days || []))}
      ${field('Avtomatik hisoblash', sel('link', [['', 'Yoʻq, qoʻlda belgilayman'], ...Object.entries(LINKS).map(([k, v]) => [k, v[0]])], h.link || ''), 'Tanlansa, odat boshqa boʻlimdagi yozuvlardan oʻzi belgilanadi.')}
      <label class="cbx"><input type="checkbox" name="core" ${h.core ? 'checked' : ''}> Minimal kunda ham hisoblansin</label>`,
    danger: id ? { label: h.archivedAt ? 'Butunlay oʻchirish' : 'Arxivlash', fn: () => { if (h.archivedAt) { D('habits').list.splice(D('habits').list.indexOf(h), 1); } else h.archivedAt = today(); save('habits'); } } : null,
    onSubmit: o => {
      const name = (o.name || '').trim(); if (!name) return 'Odat nomini yozing.';
      const days = arr(o.days).map(Number); if (!days.length) return 'Kamida bitta kunni tanlang.';
      Object.assign(h, { name, cat: o.cat, target: (o.target || '').trim(), days, link: o.link || '', core: !!o.core });
      if (!id) { h.id = uid(); h.created = today(); h.order = activeHabits().length; D('habits').list.push(h); }
      save('habits'); toast('Saqlandi');
    }
  });
};
ACT['habit-detail'] = el => {
  const h = D('habits').list.find(x => x.id === el.dataset.id); if (!h) return;
  const mk = monthKey(today()), sk = habitStreak(h), r = habitRate(h, 30);
  const missed = lastN(60).filter(d => d < today() && habitCounted(h, d) && habitStatus(h, d) !== 1).reverse();
  openModal({
    title: esc(h.name), noSubmit: true, wide: true,
    body: `<div class="kv"><span>Joriy seriya</span><b>${sk.cur} kun</b><span>Eng yaxshi</span><b>${sk.best} kun</b><span>30 kun</span><b>${r.p === null ? '—' : Math.round(r.p * 100) + '%'}</b><span>Maqsad</span><b>${esc(h.target || '—')}</b></div>
    <div class="grid g3">${[-2, -1, 0].map(n => heatmap(addMonths(mk, n), d => habitCounted(h, d) ? (habitStatus(h, d) === 1 ? 1 : habitStatus(h, d) === undefined && d === today() ? null : 0) : null, { title: fmtM(addMonths(mk, n)) })).join('')}</div>
    <h4 class="sub">Oʻtkazib yuborilgan kunlar (60 kun)</h4>
    ${missed.length ? `<div class="chips">${missed.map(d => chip(fmtD(d), 'bad')).join('')}</div>` : '<p class="muted">Oʻtkazib yuborilgan kun yoʻq.</p>'}
    <div class="mf"><span class="sp"></span>${btn('Tahrirlash', 'habit-edit-from', `data-id="${h.id}"`, 'ghost')}</div>`
  });
};
ACT['habit-edit-from'] = el => { closeModal(); ACT['habit-edit'](el); };
