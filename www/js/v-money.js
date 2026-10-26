'use strict';
/* Pul (KRW): umumiy holat, tranzaksiyalar, byudjet, toʻlovlar kalendari, maqsadlar, impuls nazorati.
   Hech qanday bank yoki toʻlov tizimiga ulanmaydi: barcha summalar qoʻlda kiritiladi. */

function billsDue(mk) {
  const n = monthDays(mk).length;
  return (D('money').bills || []).flatMap(b => {
    if (b.kind === 'once') return b.date && monthKey(b.date) === mk ? [{ ...b, date: b.date, paid: !!b.paidOnce }] : [];
    if (b.start && mk < monthKey(b.start)) return [];
    const dd = Math.min(Math.max(1, +b.day || 1), n);
    return [{ ...b, date: mk + '-' + pad(dd), paid: !!(b.paid || {})[mk] }];
  }).sort((a, b) => a.date < b.date ? -1 : 1);
}

VIEWS.money = () => {
  const tab = curTab('money', 'overview');
  return tabs('money', [['overview', 'Umumiy'], ['tx', 'Tranzaksiyalar'], ['budget', 'Byudjet'], ['bills', 'Toʻlovlar'], ['goals', 'Jamgʻarma'], ['impulse', 'Impuls nazorati']]) +
    ({ overview: moneyOverview, tx: moneyTx, budget: moneyBudget, bills: moneyBills, goals: moneyGoals, impulse: moneyImpulse }[tab] || moneyOverview)();
};

function moneyOverview() {
  const mk = selMonth('money'), mm = monthMoney(mk), money = D('money');
  const budgetTotal = sum(Object.values(money.budget || {}), num);
  const months = [-11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0].map(n => addMonths(mk, n));
  const yr = months.map(m => { const x = monthMoney(m); return { label: UZ_MONTHS[+m.slice(5) - 1].slice(0, 3), inc: x.inc, out: x.out }; });
  const cats = Object.entries(mm.byCat).sort((a, b) => b[1] - a[1]);
  const am = avgMonthly(3);
  const efMonths = am && am.out ? num(money.emergencySaved) / am.out : null;
  const selfRatio = am && am.out ? am.earned / am.out : null;
  const bills = billsDue(monthKey(today())).filter(b => !b.paid);
  return `<div class="row between wrap gap8">${monthNav('money', mk)}${btn(`${ic('plus')} Tranzaksiya`, 'tx-edit', '', 'primary sm')}</div>
  <div class="tiles">
    <div class="tile static"><span class="tile-k">Daromad</span><b>${won(mm.inc)}</b><span>shundan ish haqi ${won(mm.earned)}</span></div>
    <div class="tile static"><span class="tile-k">Xarajat</span><b>${won(mm.out)}</b><span>${budgetTotal ? `byudjet ${won(budgetTotal)} · ${pct(mm.out, budgetTotal)}%` : 'byudjet belgilanmagan'}</span></div>
    <div class="tile static"><span class="tile-k">Jamgʻarildi</span><b class="${mm.saved < 0 ? 'neg' : ''}">${won(mm.saved)}</b><span>${mm.inc ? Math.round(mm.saved / mm.inc * 100) + '% daromaddan' : '—'}</span></div>
    <div class="tile static"><span class="tile-k">Hisobdagi pul</span><b>${money.balance === null || money.balance === '' ? '—' : won(money.balance)}</b><span>${money.balanceDate ? 'qoʻlda · ' + fmtD(money.balanceDate) : `<button class="linkish" data-act="balance-edit">kiritish</button>`}</span></div>
  </div>
  <div class="grid g2">
    <section class="card">
      ${sectionHead('Moliyaviy mustaqillik', btn('Sozlash', 'fi-edit', '', 'sm ghost'))}
      ${am ? `<div class="fi">
        <div><div class="row between"><span>Favqulodda jamgʻarma</span><b class="mono">${efMonths === null ? '—' : efMonths.toFixed(1)} / ${money.fiMonths} oy</b></div>${bar(efMonths === null ? 0 : efMonths / money.fiMonths * 100)}<p class="muted sm">${won(money.emergencySaved)} jamgʻarilgan · oʻrtacha oylik xarajat ${won(am.out)} (${am.months} oy)</p></div>
        <div><div class="row between"><span>Oʻz daromadim bilan yashash</span><b class="mono">${selfRatio === null ? '—' : Math.round(selfRatio * 100)}%</b></div>${bar(selfRatio === null ? 0 : selfRatio * 100)}<p class="muted sm">Ish haqi xarajatlarning qancha qismini qoplaydi (100% = toʻliq mustaqil)</p></div>
      </div>` : '<p class="muted">Kamida bir oylik xarajat yozilsa, bu koʻrsatkich hisoblanadi.</p>'}
      <button class="btn sm ghost" data-act="balance-edit">Hisobdagi pulni yangilash</button>
    </section>
    <section class="card">
      ${sectionHead('Byudjet va haqiqiy xarajat')}
      ${budgetTotal || cats.length ? `<ul class="bva">${[...new Set([...Object.keys(money.budget || {}).filter(k => num(money.budget[k])), ...cats.map(c => c[0])])].map(c => { const b = num((money.budget || {})[c]), s = mm.byCat[c] || 0, over = b && s > b; return `<li><div class="row between"><span>${esc(c)}</span><span class="mono ${over ? 'bad-t' : ''}">${won(s)}${b ? ' / ' + won(b) : ''}</span></div>${bar(b ? s / b * 100 : 100, over ? 'bad' : b ? '' : 'na')}</li>`; }).join('')}</ul>` : '<p class="muted">Xarajat yoki byudjet kiritilmagan.</p>'}
    </section>
  </div>
  <div class="grid g2">
    <section class="card">${sectionHead('12 oy: daromad va xarajat')}${yr.some(x => x.inc || x.out) ? grouped(yr) : '<p class="muted">Tranzaksiyalar yozilganda grafik chiqadi.</p>'}</section>
    <section class="card">${sectionHead('Yaqin toʻlovlar', btn('Hammasi', 'tab', 'data-view="money" data-t="bills"', 'sm ghost'))}
      ${bills.length ? `<ul class="list compact">${bills.slice(0, 6).map(b => `<li class="li"><span class="mono sm ${dueLevel(b.date)}">${fmtD(b.date)}</span><span class="li-t">${esc(b.name)}</span><b class="mono">${won(b.amt)}</b></li>`).join('')}</ul>` : '<p class="muted">Bu oy toʻlanmagan toʻlov yoʻq.</p>'}</section>
  </div>`;
}
/* daromad va xarajatni yonma-yon koʻrsatadigan guruhli grafik */
function grouped(rows) {
  const W = 600, H = 170, pl = 44, pr = 8, pt = 12, pb = 24;
  const mx = niceMax(Math.max(...rows.map(r => Math.max(r.inc, r.out)), 1));
  const iw = W - pl - pr, ih = H - pt - pb, gw = iw / rows.length, y = v => pt + ih - v / mx * ih;
  const f = v => v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? Math.round(v / 1e3) + 'k' : Math.round(v);
  let s = '';
  for (let i = 0; i <= 4; i++) { const v = mx * i / 4; s += `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${pl - 6}" y="${y(v) + 4}" text-anchor="end">${f(v)}</text>`; }
  rows.forEach((r, i) => {
    const x = pl + i * gw + gw * 0.15, bw = gw * 0.33;
    s += `<rect x="${x}" y="${y(r.inc)}" width="${bw}" height="${y(0) - y(r.inc)}" rx="2" style="fill:var(--ok)"><title>${r.label} daromad: ${won(r.inc)}</title></rect>`;
    s += `<rect x="${x + bw + 1}" y="${y(r.out)}" width="${bw}" height="${y(0) - y(r.out)}" rx="2" style="fill:var(--accent)"><title>${r.label} xarajat: ${won(r.out)}</title></rect>`;
    s += `<text class="ax" x="${x + bw}" y="${H - 6}" text-anchor="middle">${r.label}</text>`;
  });
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="height:${H}px" role="img">${s}</svg><div class="legend"><span><i style="background:var(--ok)"></i>Daromad</span><span><i style="background:var(--accent)"></i>Xarajat</span></div></div>`;
}

ACT['balance-edit'] = () => {
  const m = D('money');
  openModal({
    title: 'Hisobdagi pul', body: `${field('Hozirgi qoldiq (₩)', inp('balance', m.balance ?? '', 'text', 'inputmode="numeric" placeholder="Masalan: 450000"'), 'Bank ilovangizdan qarab, qoʻlda kiriting. Sayt bankka ulanmaydi.')}`,
    onSubmit: o => { if (o.balance === '') { m.balance = null; m.balanceDate = ''; } else { if (isNaN(num(o.balance))) return 'Raqam kiriting.'; m.balance = num(o.balance); m.balanceDate = today(); } save('money'); }
  });
};
ACT['fi-edit'] = () => {
  const m = D('money');
  openModal({
    title: 'Moliyaviy mustaqillik maqsadi',
    body: `${field('Favqulodda jamgʻarma: necha oylik xarajat?', inp('fiMonths', m.fiMonths, 'number', 'min="1" max="24"'))}
    ${field('Favqulodda jamgʻarma maqsadi (₩)', inp('emergencyTarget', m.emergencyTarget, 'text', 'inputmode="numeric"'))}
    ${field('Hozir jamgʻarilgan (₩)', inp('emergencySaved', m.emergencySaved, 'text', 'inputmode="numeric"'))}`,
    onSubmit: o => { const fm = num(o.fiMonths); if (fm < 1) return 'Kamida 1 oy.'; Object.assign(m, { fiMonths: fm, emergencyTarget: num(o.emergencyTarget), emergencySaved: num(o.emergencySaved) }); save('money'); }
  });
};

function moneyTx() {
  const f = APP.filter.tx || (APP.filter.tx = { type: '', cat: '', q: '', sort: 'date', imp: '' });
  const mk = selMonth('money');
  let list = inMonth('tx', mk).slice();
  if (f.type) list = list.filter(t => t.type === f.type);
  if (f.cat) list = list.filter(t => t.cat === f.cat);
  if (f.imp) list = list.filter(t => t.impulse);
  if (f.q) { const q = f.q.toLowerCase(); list = list.filter(t => (t.note + ' ' + t.cat).toLowerCase().includes(q)); }
  list = f.sort === 'amt' ? sortBy(list, t => num(t.amt), -1) : sortBy(list, t => t.date + (t.created || ''), -1);
  return `<section class="card">
    <div class="row between wrap gap8">${monthNav('money', mk)}<div class="row gap8">${btn('CSV', 'tx-csv', '', 'sm ghost')}${btn(`${ic('plus')} Tranzaksiya`, 'tx-edit', '', 'primary sm')}</div></div>
    <div class="filters">
      <label class="search">${ic('search')}<input id="f-txq" data-chg="txf" data-k="q" value="${esc(f.q)}" placeholder="Izoh yoki turkum" aria-label="Qidirish"></label>
      ${sel('txt', [['', 'Hammasi'], ['in', 'Daromad'], ['out', 'Xarajat']], f.type, 'data-chg="txf" data-k="type" aria-label="Turi"')}
      ${sel('txc', [['', 'Barcha turkumlar'], ...OUT_CATS, ...IN_CATS], f.cat, 'data-chg="txf" data-k="cat" aria-label="Turkum"')}
      ${sel('txs', [['date', 'Sana'], ['amt', 'Summa']], f.sort, 'data-chg="txf" data-k="sort" aria-label="Tartib"')}
      <label class="cbx"><input type="checkbox" data-chg="txf-imp" ${f.imp ? 'checked' : ''}> Faqat impuls</label>
    </div>
    ${list.length ? `<div class="tbl-w"><table class="tbl tx"><thead><tr><th>Sana</th><th>Turkum</th><th>Izoh</th><th class="r">Summa</th><th></th></tr></thead><tbody>${list.map(t => `<tr><td class="mono">${fmtD(t.date)}</td><td>${esc(t.cat)}${t.impulse ? ' ' + chip('impuls', 'bad') : ''}</td><td>${esc(t.note || '')}</td><td class="r mono ${t.type === 'in' ? 'ok-t' : ''}">${t.type === 'in' ? '+' : '−'}${won(t.amt).replace('₩', '₩')}</td><td>${iconBtn('edit', 'tx-edit', `data-id="${t.id}"`, 'Tahrirlash')}</td></tr>`).join('')}</tbody>
    <tfoot><tr><td colspan="3">Jami (filtr boʻyicha)</td><td class="r mono">${won(sum(list.filter(t => t.type === 'in'), t => t.amt) - sum(list.filter(t => t.type === 'out'), t => t.amt))}</td><td></td></tr></tfoot></table></div>` : empty('Tranzaksiya yoʻq', 'Har bir daromad va xarajatni yozing. Bir necha soniya oladi, lekin oy oxirida aniq rasm beradi.', btn('Qoʻshish', 'tx-edit', '', 'sm'))}
  </section>`;
}
CHG.txf = el => { APP.filter.tx[el.dataset.k] = el.value; render(); };
CHG['txf-imp'] = el => { APP.filter.tx.imp = el.checked ? '1' : ''; render(); };
ACT['tx-edit'] = el => {
  const id = el.dataset.id, t = id ? findM('tx', id) : { type: el.dataset.type || 'out', date: today(), cat: el.dataset.cat || 'Ovqat', amt: el.dataset.amt || '', note: el.dataset.note || '', impulse: el.dataset.imp === '1' };
  if (!t) return;
  openModal({
    title: id ? 'Tranzaksiyani tahrirlash' : 'Yangi tranzaksiya',
    body: `<div class="seg wide" role="radiogroup">${[['out', 'Xarajat'], ['in', 'Daromad']].map(([k, l]) => `<label class="seg-b"><input type="radio" name="type" value="${k}" ${t.type === k ? 'checked' : ''}> ${l}</label>`).join('')}</div>
    <div class="fgrid">${field('Summa (₩)', inp('amt', t.amt, 'text', 'required inputmode="numeric" placeholder="12000"'))}${field('Sana', inp('date', t.date, 'date', 'required'))}</div>
    ${field('Turkum', sel('cat', [...OUT_CATS.map(c => [c, 'Xarajat · ' + c]), ...IN_CATS.map(c => [c, 'Daromad · ' + c])], t.cat))}
    ${field('Izoh', inp('note', t.note, 'text', 'maxlength="140" placeholder="Masalan: GS25, T-money toʻldirish"'))}
    <label class="cbx"><input type="checkbox" name="impulse" ${t.impulse ? 'checked' : ''}> Impulsiv / rejalashtirilmagan xarid</label>`,
    danger: id ? { label: 'Oʻchirish', fn: () => removeM('tx', id) } : null,
    onSubmit: o => {
      const amt = num(o.amt); if (!amt || amt <= 0) return 'Summani musbat raqamda kiriting.';
      if (!o.date) return 'Sanani tanlang.';
      const isIn = IN_CATS.includes(o.cat);
      if (o.type === 'in' && !isIn) return 'Daromad uchun daromad turkumini tanlang.';
      if (o.type === 'out' && isIn) return 'Xarajat uchun xarajat turkumini tanlang.';
      upsertM('tx', Object.assign(t, { id: t.id || uid(), type: o.type, amt, date: o.date, cat: o.cat, note: (o.note || '').trim(), impulse: !!o.impulse, created: t.created || nowISO() }));
      toast('Saqlandi');
    }
  });
};
ACT['tx-csv'] = () => {
  const rows = [['sana', 'turi', 'turkum', 'summa_krw', 'izoh', 'impuls']].concat(sortBy(allM('tx'), t => t.date).map(t => [t.date, t.type === 'in' ? 'daromad' : 'xarajat', t.cat, t.amt, t.note || '', t.impulse ? 'ha' : '']));
  const csv = '﻿' + rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  offerFile('behruz-os-tranzaksiyalar.csv', csv);
};

function moneyBudget() {
  const m = D('money'), mk = monthKey(today()), mm = monthMoney(mk);
  return `<section class="card">
    ${sectionHead('Oylik byudjet', '<span class="muted sm">har bir turkum uchun oylik chegara</span>')}
    <form data-form="budget" class="budget">
      ${OUT_CATS.map(c => `<div class="br"><span>${esc(c)}</span><input name="b-${esc(c)}" id="f-b-${OUT_CATS.indexOf(c)}" inputmode="numeric" value="${esc((m.budget || {})[c] || '')}" placeholder="0" aria-label="${esc(c)} byudjeti"><span class="muted sm mono">shu oy: ${won(mm.byCat[c] || 0)}</span></div>`).join('')}
      <div class="row between wrap gap8"><b>Jami: ${won(sum(Object.values(m.budget || {}), num))}</b><button class="btn primary">Byudjetni saqlash</button></div><p class="ferr"></p>
    </form>
  </section>`;
}
FORM.budget = o => { const b = {}; OUT_CATS.forEach(c => { const v = num(o['b-' + c]); if (v < 0) return; if (v) b[c] = v; }); D('money').budget = b; save('money'); toast('Byudjet saqlandi'); render(); };

function moneyBills() {
  const mk = selMonth('bills'), list = billsDue(mk);
  return `<section class="card">
    <div class="row between wrap gap8">${monthNav('bills', mk)}${btn(`${ic('plus')} Toʻlov`, 'bill-edit', '', 'primary sm')}</div>
    ${list.length ? `<ul class="list">${list.map(b => `<li class="li ${b.paid ? 'dim' : ''}">${check(b.paid ? 1 : undefined, 'bill-paid', `data-id="${b.id}" data-mk="${mk}"`, b.name)}<span class="mono sm ${b.paid ? '' : dueLevel(b.date)}">${fmtD(b.date)}</span><span class="li-t"><b>${esc(b.name)}</b> <span class="muted sm">${esc(b.cat)} · ${b.kind === 'once' ? 'bir martalik' : 'har oy'}</span></span><b class="mono">${won(b.amt)}</b>${iconBtn('edit', 'bill-edit', `data-id="${b.id}"`, 'Tahrirlash')}</li>`).join('')}</ul>
    <div class="kv"><span>Jami</span><b>${won(sum(list, b => b.amt))}</b><span>Toʻlangan</span><b>${won(sum(list.filter(b => b.paid), b => b.amt))}</b><span>Qolgan</span><b>${won(sum(list.filter(b => !b.paid), b => b.amt))}</b></div>` : empty('Toʻlovlar yoʻq', 'Ijara, telefon, kontrakt (tuition) va boshqa muntazam toʻlovlarni qoʻshing. Muddati yaqinlashganda bosh sahifada chiqadi.')}
    <p class="muted sm">Toʻlandi deb belgilasangiz, xohlasangiz xarajat ham avtomatik yoziladi.</p>
  </section>`;
}
ACT['bill-paid'] = el => {
  const b = D('money').bills.find(x => x.id === el.dataset.id), mk = el.dataset.mk;
  const occ = billsDue(mk).find(x => x.id === b.id);
  if (b.kind === 'once') b.paidOnce = !b.paidOnce; else { b.paid = b.paid || {}; b.paid[mk] = !b.paid[mk]; }
  const nowPaid = b.kind === 'once' ? b.paidOnce : b.paid[mk];
  save('money');
  if (nowPaid) openModal({ title: 'Xarajat sifatida yozilsinmi?', submit: 'Ha, yozish', body: `<p>${esc(b.name)} — ${won(b.amt)}, ${fmtD(occ.date <= today() ? occ.date : today())}</p>`, onSubmit: () => { upsertM('tx', { id: uid(), type: 'out', amt: num(b.amt), date: occ.date <= today() ? occ.date : today(), cat: b.cat, note: b.name, impulse: false, created: nowISO() }); } });
  else render();
};
ACT['bill-edit'] = el => {
  const id = el.dataset.id, l = D('money').bills, b = l.find(x => x.id === id) || { kind: 'monthly', cat: 'Ijara', day: 25 };
  openModal({
    title: id ? 'Toʻlovni tahrirlash' : 'Yangi toʻlov',
    body: `${field('Nomi', inp('name', b.name, 'text', 'required placeholder="Ijara, telefon, kontrakt…"'))}
    <div class="fgrid">${field('Summa (₩)', inp('amt', b.amt, 'text', 'required inputmode="numeric"'))}${field('Turkum', sel('cat', OUT_CATS, b.cat))}</div>
    <div class="fgrid">${field('Turi', sel('kind', [['monthly', 'Har oy'], ['once', 'Bir martalik (masalan kontrakt muddati)']], b.kind))}${field('Har oyning nechanchi kuni', inp('day', b.day, 'number', 'min="1" max="31"'))}${field('Yoki aniq sana (bir martalik)', inp('date', b.date, 'date'))}</div>`,
    danger: id ? { label: 'Oʻchirish', fn: () => { l.splice(l.indexOf(b), 1); save('money'); } } : null,
    onSubmit: o => {
      if (!(o.name || '').trim()) return 'Nomini yozing.';
      if (num(o.amt) <= 0) return 'Summani kiriting.';
      if (o.kind === 'monthly' && !(num(o.day) >= 1 && num(o.day) <= 31)) return 'Kunni 1 dan 31 gacha kiriting.';
      if (o.kind === 'once' && !o.date) return 'Bir martalik toʻlov uchun sanani tanlang.';
      Object.assign(b, { name: o.name.trim(), amt: num(o.amt), cat: o.cat, kind: o.kind, day: num(o.day) || 1, date: o.date || '', start: b.start || today() });
      if (!id) { b.id = uid(); l.push(b); } save('money');
    }
  });
};

function moneyGoals() {
  const goals = D('money').goals;
  return `<section class="card">
    ${sectionHead('Jamgʻarma maqsadlari', btn(`${ic('plus')} Maqsad`, 'goal-edit', '', 'primary sm'))}
    ${goals.length ? `<ul class="goals">${goals.map(g => { const p = pct(g.saved, g.target); const left = g.deadline ? daysBetween(today(), g.deadline) : null; const perMonth = left && left > 0 ? (num(g.target) - num(g.saved)) / Math.max(1, left / 30) : null; return `<li class="goal"><div class="row between gap8"><b>${esc(g.name)}</b>${iconBtn('edit', 'goal-edit', `data-id="${g.id}"`, 'Tahrirlash')}</div>${bar(p)}
      <div class="row between wrap gap8"><span class="mono">${won(g.saved)} / ${won(g.target)} · ${p}%</span><span class="muted sm">${g.deadline ? `${fmtD(g.deadline)} gacha${perMonth > 0 ? ` · oyiga ~${won(perMonth)}` : ''}` : ''}</span></div>
      <form data-form="goal-add" class="inline-form" data-id="${g.id}"><input name="amt" id="f-ga-${g.id}" inputmode="numeric" placeholder="Qoʻshish (₩)" aria-label="Qoʻshiladigan summa"><button class="btn sm">Qoʻshish</button><p class="ferr"></p></form></li>`; }).join('')}</ul>` : empty('Maqsad yoʻq', 'Masalan: “Favqulodda jamgʻarma”, “Noutbuk”, “Uyga chipta”. Har oy kichik summa qoʻshing.')}
  </section>`;
}
FORM['goal-add'] = (o, f) => { const g = D('money').goals.find(x => x.id === f.dataset.id); const a = num(o.amt); if (!a) return 'Summani kiriting.'; g.saved = num(g.saved) + a; save('money'); toast(`${won(a)} qoʻshildi`); render(); };
ACT['goal-edit'] = el => {
  const id = el.dataset.id, l = D('money').goals, g = l.find(x => x.id === id) || { saved: 0 };
  openModal({
    title: id ? 'Maqsadni tahrirlash' : 'Jamgʻarma maqsadi',
    body: `${field('Nomi', inp('name', g.name, 'text', 'required'))}<div class="fgrid">${field('Kerakli summa (₩)', inp('target', g.target, 'text', 'required inputmode="numeric"'))}${field('Hozir bor (₩)', inp('saved', g.saved, 'text', 'inputmode="numeric"'))}${field('Muddat', inp('deadline', g.deadline, 'date'))}</div>`,
    danger: id ? { label: 'Oʻchirish', fn: () => { l.splice(l.indexOf(g), 1); save('money'); } } : null,
    onSubmit: o => { if (!(o.name || '').trim()) return 'Nomini yozing.'; if (num(o.target) <= 0) return 'Summani kiriting.'; Object.assign(g, { name: o.name.trim(), target: num(o.target), saved: num(o.saved), deadline: o.deadline || '' }); if (!id) { g.id = uid(); l.push(g); } save('money'); }
  });
};

/* Impuls nazorati: oylik chegara, istaklar roʻyxati, kutish vaqti, oqibatlarni koʻrib chiqish */
function moneyImpulse() {
  const m = D('money'), mk = monthKey(today()), mm = monthMoney(mk), lim = num(m.impulseLimit);
  const wage = num(D('work').job.wage);
  const wl = m.wishlist || [];
  const waiting = wl.filter(w => w.status === 'wait'), skipped = wl.filter(w => w.status === 'skipped');
  const purchases = sortBy(inMonth('tx', mk).filter(t => t.type === 'out' && (t.impulse || t.cat === 'Oʻyin / skinlar')), t => t.date, -1);
  const months6 = [-5, -4, -3, -2, -1, 0].map(n => addMonths(mk, n)).map(x => ({ label: UZ_MONTHS[+x.slice(5) - 1].slice(0, 3), value: monthMoney(x).impulse }));
  return `<div class="tiles">
    <div class="tile static ${lim && mm.impulse > lim ? 'bad' : ''}"><span class="tile-k">Shu oy impuls / oʻyin</span><b>${won(mm.impulse)}</b><span>${lim ? `chegara ${won(lim)} · qoldi ${won(Math.max(0, lim - mm.impulse))}` : '<button class="linkish" data-act="imp-limit">chegara belgilash</button>'}</span></div>
    <div class="tile static"><span class="tile-k">Voz kechilgan</span><b>${won(sum(skipped, w => w.amt))}</b><span>${skipped.length} ta narsadan voz kechdingiz</span></div>
    <div class="tile static"><span class="tile-k">Ish soatida</span><b>${wage ? (mm.impulse / wage).toFixed(1) + ' soat' : '—'}</b><span>${wage ? 'shu oy impulsga ketgan mehnat' : 'soatlik maosh Ish boʻlimida kiritiladi'}</span></div>
  </div>
  <div class="grid g2">
    <section class="card">
      ${sectionHead('Sotib olishdan oldin', btn(`${ic('plus')} Istak qoʻshish`, 'wish-edit', '', 'primary sm'))}
      <p class="muted sm">Skin, keys yoki boshqa rejalashtirilmagan narsani darhol olmang: avval roʻyxatga yozing. ${m.coolHours} soat kutgandan keyingina “Sotib olish” tugmasi ochiladi.</p>
      ${waiting.length ? `<ul class="list">${waiting.map(w => { const left = m.coolHours * 60 - (Date.now() - new Date(w.created).getTime()) / 60000; return `<li class="li"><span class="li-t"><b>${esc(w.name)}</b> <span class="mono">${won(w.amt)}</span><br><span class="muted sm">${esc(w.reason || '')}</span></span>
        ${left > 0 ? `<span class="chip">${ic('clock')} ${hrs(left)} qoldi</span>` : btn('Koʻrib chiqish', 'wish-review', `data-id="${w.id}"`, 'sm')}
        ${btn('Voz kechdim', 'wish-skip', `data-id="${w.id}"`, 'sm primary')}</li>`; }).join('')}</ul>` : '<p class="muted">Kutayotgan istak yoʻq.</p>'}
      <div class="row gap8 wrap">${btn('Chegara va kutish vaqti', 'imp-limit', '', 'sm ghost')}</div>
    </section>
    <section class="card">
      ${sectionHead('6 oy')}${months6.some(x => x.value) ? barChart(months6, { h: 150, target: lim || null, fmt: v => v >= 1e3 ? Math.round(v / 1e3) + 'k' : Math.round(v), color: 'var(--bad)' }) : '<p class="muted">Impuls xarajat yozilmagan.</p>'}
      <h4 class="sub">Shu oydagi xaridlar</h4>
      ${purchases.length ? `<ul class="list compact">${purchases.map(t => `<li class="li"><span class="mono sm">${fmtD(t.date)}</span><span class="li-t">${esc(t.note || t.cat)}</span><b class="mono">${won(t.amt)}</b></li>`).join('')}</ul>` : '<p class="muted">Bu oy impuls xarid yoʻq.</p>'}
      ${btn('Xaridni yozish', 'tx-edit', 'data-type="out" data-cat="Oʻyin / skinlar" data-imp="1"', 'sm ghost')}
    </section>
  </div>`;
}
ACT['imp-limit'] = () => {
  const m = D('money');
  openModal({
    title: 'Impuls nazorati sozlamalari',
    body: `${field('Oylik chegara: oʻyin, skin, keys va impuls xaridlar (₩)', inp('lim', m.impulseLimit || '', 'text', 'inputmode="numeric" placeholder="0 = umuman yoʻq"'))}${field('Sotib olishdan oldin kutish (soat)', inp('cool', m.coolHours, 'number', 'min="1" max="168"'))}`,
    onSubmit: o => { const c = num(o.cool); if (c < 1) return 'Kamida 1 soat.'; m.impulseLimit = num(o.lim); m.coolHours = c; save('money'); }
  });
};
ACT['wish-edit'] = () => {
  openModal({
    title: 'Istak qoʻshish', submit: 'Roʻyxatga yozish',
    body: `${field('Nima?', inp('name', '', 'text', 'required placeholder="Masalan: AK-47 skin, keys x5"'))}${field('Narxi (₩)', inp('amt', '', 'text', 'required inputmode="numeric"'))}${field('Nega xohlayapman? Hozir qanday his qilyapman?', area('reason', '', 'placeholder="Zerikdim, doʻstim oldi, chegirma bor…"'))}`,
    onSubmit: o => { if (!(o.name || '').trim()) return 'Nimani xohlayotganingizni yozing.'; if (num(o.amt) <= 0) return 'Narxini kiriting.'; const m = D('money'); (m.wishlist = m.wishlist || []).push({ id: uid(), name: o.name.trim(), amt: num(o.amt), reason: o.reason || '', created: new Date().toISOString(), status: 'wait' }); save('money'); toast(`${m.coolHours} soatdan keyin qayta koʻrib chiqasiz`); }
  });
};
ACT['wish-skip'] = el => { const w = D('money').wishlist.find(x => x.id === el.dataset.id); w.status = 'skipped'; w.closed = today(); save('money'); toast(`Barakalla! ${won(w.amt)} sizda qoldi`); render(); };
ACT['wish-review'] = el => {
  const m = D('money'), w = m.wishlist.find(x => x.id === el.dataset.id), mm = monthMoney(monthKey(today())), lim = num(m.impulseLimit), wage = num(D('work').job.wage);
  const g = (m.goals || [])[0];
  const after = mm.impulse + num(w.amt);
  openModal({
    title: `Oqibatlarni koʻrib chiqing: ${esc(w.name)}`, submit: 'Baribir sotib olaman',
    body: `<ul class="cons">
      ${wage ? `<li>Bu <b>${(num(w.amt) / wage).toFixed(1)} soatlik</b> restoranda ishlash degani.</li>` : ''}
      ${lim ? `<li>Oylik chegara: ${won(mm.impulse)} → <b class="${after > lim ? 'bad-t' : ''}">${won(after)}</b> / ${won(lim)}${after > lim ? ' — chegaradan oshadi' : ''}.</li>` : '<li>Oylik chegara belgilanmagan.</li>'}
      ${g ? `<li>“${esc(g.name)}” maqsadiga bu pul bilan <b>${pct(num(w.amt), num(g.target))}%</b> yaqinlashardingiz.</li>` : ''}
      ${w.reason ? `<li>Oʻshanda yozgan sababingiz: “${esc(w.reason)}”</li>` : ''}
      <li>Keys ochish — tasodifga pul tikish. Natijasi oldindan nomaʼlum.</li></ul>
      <label class="cbx"><input type="checkbox" name="q1"> Bu xarid kontrakt, ijara yoki ovqat pulimga zarar qilmaydi</label>
      <label class="cbx"><input type="checkbox" name="q2"> Kayfiyatim yomonligi uchun emas, oʻylab qaror qildim</label>
      <label class="cbx"><input type="checkbox" name="q3"> Bir haftadan keyin ham bu xariddan afsuslanmayman</label>`,
    onSubmit: o => {
      if (!o.q1 || !o.q2 || !o.q3) return 'Uchala savolga ham rostdan “ha” deya olsangizgina sotib oling. Aks holda “Voz kechdim”ni tanlang.';
      w.status = 'bought'; w.closed = today(); save('money');
      upsertM('tx', { id: uid(), type: 'out', amt: num(w.amt), date: today(), cat: 'Oʻyin / skinlar', note: w.name, impulse: true, created: nowISO() });
    }
  });
};
