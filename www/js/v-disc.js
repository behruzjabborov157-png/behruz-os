'use strict';
/* Intizom markazi: ekran vaqti va yomon odatlarni qoʻlda kuzatish, trigger jurnali, haftalik naqshlar.
   Sayt telefonni avtomatik kuzatmaydi va ilovalarni bloklamaydi: raqamlar telefonning “Ekran vaqti”dan koʻchiriladi. */

const TRIGGER_HABITS = { social: 'Ijtimoiy tarmoq', scroll: 'Maqsadsiz scroll', gaming: 'Oʻyin', purchase: 'Keraksiz xarid / keys', late: 'Kechki telefon', skip: 'Darsni qoldirish', procrast: 'Ishni orqaga surish', other: 'Boshqa' };
const FEELINGS = ['zerikish', 'stress', 'charchoq', 'yolgʻizlik', 'xavotir', 'gʻazab', 'xursandchilik', 'hech narsa'];
function timeBucket(t) { const m = tmin(t || '12:00'); return m < 360 ? 'Tun (00–06)' : m < 720 ? 'Ertalab' : m < 1080 ? 'Kunduzi' : m < 1320 ? 'Kechqurun' : 'Tun (22–24)'; }

VIEWS.discipline = () => {
  const tab = curTab('discipline', 'log');
  return `<p class="note">${ic('alert')} Bu sayt telefoningizni avtomatik kuzata olmaydi va ilovalarni bloklay olmaydi. Raqamlarni telefoningizdagi “Ekran vaqti” (iPhone) yoki “Digital Wellbeing” (Android) boʻlimidan koʻchiring. Bloklash uchun oʻsha ilovalardagi limitlardan foydalaning.</p>` +
    tabs('discipline', [['log', 'Kunlik yozuv'], ['trig', 'Trigger jurnali'], ['report', 'Haftalik hisobot']]) +
    ({ log: discLog, trig: discTrig, report: discReport }[tab] || discLog)();
};

function discLog() {
  const date = selDate('disc'), d = day(date), s = S();
  const missedClasses = attendanceOn(date).filter(r => r.st === 'a').length;
  const imp = allM('tx').filter(t => t.date === date && t.type === 'out' && (t.impulse || t.cat === 'Oʻyin / skinlar'));
  const sm = (d.social || 0) + (d.scroll || 0);
  const days = lastN(7, date);
  const chart = days.map(x => ({ label: UZ_DS[dow(x)], social: day(x).social || 0, scroll: day(x).scroll || 0, gaming: day(x).gaming || 0 }));
  return `<div class="row between wrap gap8">${dateNav('disc', date)}</div>
  <div class="grid g2">
    <section class="card">
      ${sectionHead('Bugungi raqamlar')}
      <form data-form="disc" class="stack" data-d="${date}">
        <div class="fgrid">${field('Ijtimoiy tarmoq (daq)', inp('social', d.social ?? '', 'number', 'min="0" max="1440"'))}${field('Maqsadsiz scroll (daq)', inp('scroll', d.scroll ?? '', 'number', 'min="0" max="1440"'))}</div>
        <div class="fgrid">${field('Oʻyin (daq)', inp('gaming', d.gaming ?? '', 'number', 'min="0" max="1440"'))}${field('Uxlash vaqtidan keyin telefon (daq)', inp('latePhone', d.latePhone ?? '', 'number', 'min="0" max="600"'))}</div>
        <div class="fgrid">${field('Bajarilmagan vaʼdalar soni', inp('commit', d.commit ?? '', 'number', 'min="0" max="20"'))}${field('Qaysi vaʼda?', inp('commitNote', d.commitNote, 'text', 'placeholder="Masalan: doʻstimga yordam bermadim"'))}</div>
        <div class="row between wrap gap8"><span class="muted sm">Chegaralar: ijtimoiy tarmoq ${s.socialLimit} daq · oʻyin ${s.gamingLimit} daq</span><button class="btn primary sm">Saqlash</button></div><p class="ferr"></p>
      </form>
    </section>
    <section class="card">
      ${sectionHead('Holat')}
      <ul class="alerts">
        <li class="al ${d.social === undefined && d.scroll === undefined ? '' : sm > s.socialLimit ? 'bad' : 'ok'}"><span>Ijtimoiy tarmoq + scroll</span><em>${d.social === undefined && d.scroll === undefined ? 'yozilmagan' : `${sm} / ${s.socialLimit} daq`}</em></li>
        <li class="al ${d.gaming === undefined ? '' : d.gaming > s.gamingLimit ? 'bad' : 'ok'}"><span>Oʻyin</span><em>${d.gaming === undefined ? 'yozilmagan' : `${d.gaming} / ${s.gamingLimit} daq`}</em></li>
        <li class="al ${imp.length ? 'bad' : 'ok'}"><span>Impuls xaridlar (Pul boʻlimidan)</span><em>${imp.length ? won(sum(imp, t => t.amt)) : 'yoʻq'}</em></li>
        <li class="al ${missedClasses ? 'bad' : 'ok'}"><span>Qoldirilgan darslar (davomatdan)</span><em>${missedClasses}</em></li>
        <li class="al ${sleptOnTime(date) === 0 ? 'warn' : sleptOnTime(date) === 1 ? 'ok' : ''}"><span>Uxlash vaqti (Sport boʻlimidan)</span><em>${sleepOf(date)?.bed || 'yozilmagan'}</em></li>
      </ul>
      ${btn(`${ic('plus')} Trigger yozish`, 'trig-edit', '', 'sm ghost')}
    </section>
  </div>
  <section class="card">${sectionHead('7 kun: ekran vaqti')}${chart.some(c => c.social || c.scroll || c.gaming) ? barChart(chart, { h: 160, stacked: [{ key: 'social', label: 'Ijtimoiy tarmoq', color: 'var(--c1)' }, { key: 'scroll', label: 'Scroll', color: 'var(--c3)' }, { key: 'gaming', label: 'Oʻyin', color: 'var(--c5)' }], target: s.socialLimit + s.gamingLimit, fmt: v => Math.round(v) }) : '<p class="muted">Raqamlar yozilganda grafik chiqadi.</p>'}</section>`;
}
FORM.disc = (o, f) => {
  const keys = ['social', 'scroll', 'gaming', 'latePhone', 'commit'];
  if (keys.some(k => o[k] !== '' && (num(o[k]) < 0 || num(o[k]) > 1440))) return 'Daqiqalar 0 dan 1440 gacha boʻlsin.';
  setDay(f.dataset.d, d => { keys.forEach(k => { if (o[k] === '') delete d[k]; else d[k] = num(o[k]); }); d.commitNote = o.commitNote || ''; });
  toast('Saqlandi'); render();
};

function discTrig() {
  const l = sortBy(allM('triggers'), t => t.date + (t.time || ''), -1);
  return `<section class="card">
    ${sectionHead('Trigger jurnali', btn(`${ic('plus')} Yozish`, 'trig-edit', '', 'primary sm'))}
    <p class="muted sm">Yomon odat boʻlganda (yoki boʻlishiga sal qolganda) yozing: undan oldin nima boʻldi, nimani his qildingiz, keyingi safar nima qilasiz. Oʻzingizni ayblash uchun emas, naqshni koʻrish uchun.</p>
    ${l.length ? `<ul class="entries">${l.slice(0, 50).map(t => `<li class="entry"><div class="row between wrap gap8"><span>${chip(TRIGGER_HABITS[t.habit] || t.habit, t.resisted ? 'ok' : 'bad')} <span class="muted sm">${fmtD(t.date)} ${t.time || ''}${t.resisted ? ' · qarshilik qildim' : ''}</span></span>${iconBtn('edit', 'trig-edit', `data-id="${t.id}"`, 'Tahrirlash')}</div>
      ${t.before ? `<p><b>Oldin:</b> ${esc(t.before)}</p>` : ''}${(t.feel || []).length ? `<div class="chips">${t.feel.map(f => chip(esc(f), 'ghostchip')).join('')}${t.intensity ? chip('kuch ' + t.intensity + '/5', 'ghostchip') : ''}</div>` : ''}${t.instead ? `<p><b>Keyingi safar:</b> ${esc(t.instead)}</p>` : ''}</li>`).join('')}</ul>` : empty('Hali yozuv yoʻq', 'Birinchi yozuvni qiling: masalan “Darsdan keyin charchab, 2 soat CS2 oʻynadim”.')}
  </section>`;
}
ACT['trig-edit'] = el => {
  const id = el.dataset.id, t = id ? findM('triggers', id) : { date: today(), time: mtime(new Date().getHours() * 60 + new Date().getMinutes()), habit: 'gaming', feel: [] };
  openModal({
    title: id ? 'Yozuvni tahrirlash' : 'Trigger yozish',
    body: `<div class="fgrid">${field('Odat', sel('habit', Object.entries(TRIGGER_HABITS), t.habit))}${field('Sana', inp('date', t.date, 'date', 'required'))}${field('Vaqt', inp('time', t.time, 'time'))}</div>
    ${field('Undan oldin nima boʻldi?', area('before', t.before, 'placeholder="Qayerda edim, kim bilan, nima qilayotgan edim"'))}
    ${field('Nimani his qildim?', `<div class="chips pick">${FEELINGS.map(f => `<label><input type="checkbox" name="feel" value="${f}" ${(t.feel || []).includes(f) ? 'checked' : ''}><span>${f}</span></label>`).join('')}</div>`)}
    <div class="fgrid">${field('Xohish kuchi (1–5)', sel('intensity', ['', '1', '2', '3', '4', '5'], t.intensity || ''))}<label class="cbx"><input type="checkbox" name="resisted" ${t.resisted ? 'checked' : ''}> Qarshilik qildim (odatni qilmadim)</label></div>
    ${field('Keyingi safar nima qila olaman?', area('instead', t.instead, 'placeholder="Telefonni boshqa xonaga qoʻyaman, 10 daqiqa yuraman…"'))}`,
    danger: id ? { label: 'Oʻchirish', fn: () => removeM('triggers', id) } : null,
    onSubmit: o => { if (!o.date) return 'Sanani tanlang.'; if (!(o.before || '').trim() && !arr(o.feel).length) return 'Kamida nima boʻlganini yoki his-tuygʻuni yozing.'; upsertM('triggers', Object.assign(t, { id: t.id || uid(), habit: o.habit, date: o.date, time: o.time || '', before: (o.before || '').trim(), feel: arr(o.feel), intensity: o.intensity || '', resisted: !!o.resisted, instead: (o.instead || '').trim() })); }
  });
};

function countBy(list, f) { const m = {}; list.forEach(x => [].concat(f(x)).forEach(k => { if (k) m[k] = (m[k] || 0) + 1; })); return Object.entries(m).sort((a, b) => b[1] - a[1]); }
function discReport() {
  const ref = APP.sel.dweek || today(), start = weekStart(ref), prev = addDays(start, -7);
  const w = weekStats(start), p = weekStats(prev), s = S();
  const days = w.days;
  const trig = allM('triggers').filter(t => t.date >= start && t.date <= addDays(start, 6));
  const allTrig = allM('triggers').filter(t => t.date >= addDays(start, -27) && t.date <= addDays(start, 6));
  const overSocial = days.filter(d => socialStatus(d) === 0).length, overGame = days.filter(d => gamingStatus(d) === 0).length;
  const lateNights = days.filter(d => sleptOnTime(d) === 0).length;
  const missedCls = D('attendance').recs.filter(r => r.date >= start && r.date <= addDays(start, 6) && r.st === 'a').length;
  const commits = sum(days, d => day(d).commit || 0);
  const beds = days.map(sleepOf).filter(x => x && x.bed).map(x => { const b = tmin(x.bed); return b < 720 ? b + 1440 : b; });
  const sd = beds.length > 1 ? Math.round(Math.sqrt(avg(beds.map(b => (b - avg(beds)) ** 2)))) : null;
  const tips = [];
  const topTime = countBy(allTrig, t => timeBucket(t.time))[0], topFeel = countBy(allTrig, t => t.feel)[0], topHabit = countBy(allTrig, t => t.habit)[0];
  if (overGame >= 3) tips.push(`Bu hafta ${overGame} kun oʻyin chegarasidan oshdi. Oʻyinni faqat bugungi missiya bajarilgandan keyin boshlash qoidasini sinab koʻring.`);
  if (overSocial >= 3) tips.push(`${overSocial} kun ijtimoiy tarmoq chegarasi oshdi. Telefoningizda shu ilovalarga kunlik limit qoʻying.`);
  if (lateNights >= 3) tips.push(`${lateNights} kecha belgilangan vaqtdan kech yotdingiz. Uxlashdan 30 daqiqa oldin telefonni zaryadga boshqa joyga qoʻying.`);
  if (w.latePhone > 120) tips.push(`Uxlash vaqtidan keyin telefonda ${w.latePhone} daqiqa oʻtdi. Bu ertalab vaqtida turishga ham taʼsir qiladi.`);
  if (missedCls) tips.push(`${missedCls} ta dars qoldirildi. Ertalabki darslar oldidan kechqurun soat 23:00 da signal qoʻying.`);
  if (w.impulse > 0) tips.push(`Bu hafta impuls xarajat: ${won(w.impulse)}. Keyingisini avval Pul → Impuls nazorati roʻyxatiga yozing.`);
  if (topTime && topTime[1] >= 3) tips.push(`Triggerlarning koʻpi “${topTime[0]}” vaqtida boʻlyapti. Shu vaqtga oldindan boshqa ish rejalashtiring.`);
  if (topFeel && topFeel[1] >= 3) tips.push(`Eng koʻp his-tuygʻu: “${topFeel[0]}”. Unga oʻyin yoki telefon oʻrniga boshqa javob tanlang: yurish, duo, doʻstga qoʻngʻiroq.`);
  if (sd !== null && sd > 60) tips.push(`Yotish vaqtingiz ±${sd} daqiqa oʻzgaryapti. Har kuni bir xil vaqtda yotish uyqu sifatini oshiradi.`);
  const cmp = (a, b, lower = true) => a === b ? '' : (lower ? a < b : a > b) ? `<span class="ok-t">↓ ${Math.abs(a - b)}</span>` : `<span class="bad-t">↑ ${Math.abs(a - b)}</span>`;
  return `<div class="row between wrap gap8"><div class="datenav"><button class="ibtn" data-act="dwnav" data-n="-7" aria-label="Oldingi hafta">${ic('left')}</button><span class="dn-l">${fmtD(start)} – ${fmtD(addDays(start, 6))}</span><button class="ibtn" data-act="dwnav" data-n="7" ${start >= weekStart(today()) ? 'disabled' : ''} aria-label="Keyingi hafta">${ic('right')}</button></div></div>
  <section class="card">
    ${sectionHead('Hafta raqamlari', '<span class="muted sm">oʻtgan hafta bilan solishtirish</span>')}
    <div class="tbl-w"><table class="tbl"><thead><tr><th>Koʻrsatkich</th><th>Shu hafta</th><th>Oʻtgan hafta</th><th>Farq</th></tr></thead><tbody>
      <tr><td>Ijtimoiy tarmoq</td><td class="mono">${hrs(w.social)}</td><td class="mono">${hrs(p.social)}</td><td>${cmp(w.social, p.social)}</td></tr>
      <tr><td>Maqsadsiz scroll</td><td class="mono">${hrs(w.scroll)}</td><td class="mono">${hrs(p.scroll)}</td><td>${cmp(w.scroll, p.scroll)}</td></tr>
      <tr><td>Oʻyin</td><td class="mono">${hrs(w.gaming)}</td><td class="mono">${hrs(p.gaming)}</td><td>${cmp(w.gaming, p.gaming)}</td></tr>
      <tr><td>Kechki telefon</td><td class="mono">${hrs(w.latePhone)}</td><td class="mono">${hrs(p.latePhone)}</td><td>${cmp(w.latePhone, p.latePhone)}</td></tr>
      <tr><td>Impuls xarajat</td><td class="mono">${won(w.impulse)}</td><td class="mono">${won(p.impulse)}</td><td>${cmp(w.impulse, p.impulse)}</td></tr>
      <tr><td>Qoldirilgan darslar</td><td class="mono">${w.attAbs}</td><td class="mono">${p.attAbs}</td><td>${cmp(w.attAbs, p.attAbs)}</td></tr>
      <tr><td>Vaqtida yotgan kechalar</td><td class="mono">${w.onTime}/${w.sleepLogged}</td><td class="mono">${p.onTime}/${p.sleepLogged}</td><td>${cmp(w.onTime, p.onTime, false)}</td></tr>
      <tr><td>Bajarilmagan vaʼdalar</td><td class="mono">${commits}</td><td class="mono">—</td><td></td></tr>
      <tr><td>Triggerlar (qarshilik qilindi)</td><td class="mono">${trig.length} (${trig.filter(t => t.resisted).length})</td><td class="mono">—</td><td></td></tr>
    </tbody></table></div>
  </section>
  <div class="grid g2">
    <section class="card">${sectionHead('Naqshlar (4 hafta triggerlari)')}
      ${allTrig.length ? `<div class="kv"><span>Eng koʻp odat</span><b>${topHabit ? esc(TRIGGER_HABITS[topHabit[0]]) + ' · ' + topHabit[1] : '—'}</b><span>Eng koʻp vaqt</span><b>${topTime ? topTime[0] + ' · ' + topTime[1] : '—'}</b><span>Eng koʻp his</span><b>${topFeel ? esc(topFeel[0]) + ' · ' + topFeel[1] : '—'}</b><span>Hafta kuni</span><b>${(c => c ? UZ_DAYS[c[0]] + ' · ' + c[1] : '—')(countBy(allTrig, t => String(dow(t.date)))[0])}</b></div>` : '<p class="muted">Trigger yozuvlari koʻpaygach, naqshlar shu yerda chiqadi.</p>'}
    </section>
    <section class="card">${sectionHead('Amaliy oʻzgarishlar')}
      ${tips.length ? `<ul class="tips">${tips.map(t => `<li>${t}</li>`).join('')}</ul><p class="muted sm">Bu tavsiyalar sizning yozuvlaringizdagi raqamlardan oddiy qoidalar asosida chiqarilgan.</p>` : '<p class="muted">Bu hafta jiddiy muammo koʻrinmadi yoki maʼlumot yetarli emas.</p>'}
    </section>
  </div>`;
}
ACT.dwnav = el => { APP.sel.dweek = addDays(APP.sel.dweek || today(), +el.dataset.n); if (APP.sel.dweek > today()) APP.sel.dweek = today(); render(); };
