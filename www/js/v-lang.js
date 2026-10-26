'use strict';
/* Tillar: kunlik maqsad, mashq jurnali, shaxsiy lugʻat, takrorlash (Leitner), grammatika, TOPIK */

const SKILLS = { vocab: 'Soʻz', grammar: 'Grammatika', reading: 'Oʻqish', listening: 'Tinglash', writing: 'Yozish', speaking: 'Gapirish' };
const LANG_N = { ko: 'Koreys', en: 'Ingliz' };
/* TOPIK II rasmiy darajalari (300 ball): 3-daraja 120+, 4: 150+, 5: 190+, 6: 230+. TOPIK I (200): 1: 80+, 2: 140+ */
function topikLevel(m) {
  const t = num(m.total);
  if (m.kind === 'I') return t >= 140 ? 2 : t >= 80 ? 1 : 0;
  return t >= 230 ? 6 : t >= 190 ? 5 : t >= 150 ? 4 : t >= 120 ? 3 : 0;
}

VIEWS.lang = () => {
  const tab = curTab('lang', 'today');
  return tabs('lang', [['today', 'Bugun'], ['vocab', 'Lugʻat'], ['review', 'Takrorlash'], ['grammar', 'Grammatika'], ['topik', 'TOPIK'], ['report', 'Hisobot']]) +
    ({ today: langToday, vocab: langVocab, review: langReview, grammar: langGrammar, topik: langTopik, report: langReport }[tab] || langToday)();
};

function langCard(lang, date) {
  const t = langTarget(lang, date), added = wordsAdded(lang, date), rev = wordsReviewed(lang, date), min = langMinutes(lang, date);
  const met = langMet(lang, date) === 1;
  const logs = inMonth('lang', monthKey(date)).filter(l => l.date === date && l.lang === lang);
  return `<section class="card">
    ${sectionHead(`${LANG_N[lang]} tili`, met ? chip('Maqsad bajarildi', 'ok') : chip(isLight(date) ? 'yengil kun maqsadi' : 'oddiy kun maqsadi', 'ghostchip'))}
    <div class="kv"><span>Soʻzlar (yangi + takror)</span><b>${added + rev} / ${t.words}</b><span>Mashq vaqti</span><b>${min} / ${t.min} daq</b><span>Takrorlash kutmoqda</span><b>${dueWords(lang).length}</b><span>Lugʻatda</span><b>${D('vocab-' + lang).list.length}</b></div>
    ${bar(Math.max(pct(added + rev, t.words), pct(min, t.min)))}
    ${logs.length ? `<ul class="list compact">${logs.map(l => `<li class="li"><span class="li-t">${SKILLS[l.skill] || l.skill}${l.note ? ' · ' + esc(l.note) : ''}</span><span class="mono">${l.min} daq</span>${iconBtn('trash', 'lang-del', `data-id="${l.id}"`, 'Oʻchirish')}</li>`).join('')}</ul>` : ''}
    <form data-form="lang-log" class="fgrid" data-lang="${lang}" data-d="${date}">
      ${sel('skill-' + lang, Object.entries(SKILLS), 'vocab', 'name="skill" aria-label="Koʻnikma"').replace(`name="skill-${lang}"`, '')}
      <input type="number" name="min" id="f-min-${lang}" min="1" max="600" placeholder="Daqiqa" aria-label="Daqiqa">
      <input name="note" id="f-note-${lang}" placeholder="Nima qildim (ixtiyoriy)" aria-label="Izoh">
      <button class="btn sm">Yozish</button><p class="ferr"></p>
    </form>
    <div class="row gap8 wrap">${btn(`${ic('plus')} Soʻz qoʻshish`, 'word-edit', `data-lang="${lang}"`, 'sm ghost')}${dueWords(lang).length ? btn(`Takrorlash (${dueWords(lang).length})`, 'review-start', `data-lang="${lang}"`, 'sm primary') : ''}</div>
  </section>`;
}
function langToday() {
  const date = selDate('lang');
  return `<div class="row between wrap gap8">${dateNav('lang', date)}<button class="btn sm ${day(date).light ? 'primary' : 'ghost'}" data-act="lang-light" data-d="${date}">${ic('work')} Uzun smena kuni${day(date).light ? ': yoqilgan' : ''}</button></div>
  <p class="muted sm">Uzun smena kuni yoki minimal kunda maqsadlar avtomatik kamayadi (Sozlamalarda oʻzgartiriladi). Maqsad bajarildi = soʻzlar soni YOKI daqiqalar maqsadga yetdi.</p>
  <div class="grid g2">${langCard('ko', date)}${langCard('en', date)}</div>`;
}
ACT['lang-light'] = el => { setDay(el.dataset.d, d => { d.light = !d.light; }); render(); };
FORM['lang-log'] = (o, f) => {
  const min = num(o.min); if (!min || min <= 0) return 'Necha daqiqa mashq qilganingizni yozing.';
  if (min > 600) return '600 daqiqadan koʻp boʻlolmaydi.';
  upsertM('lang', { id: uid(), date: f.dataset.d, lang: f.dataset.lang, skill: o.skill || 'vocab', min, note: (o.note || '').trim() });
  render();
};
ACT['lang-del'] = el => { removeM('lang', el.dataset.id); render(); };

function langVocab() {
  const f = APP.filter.vocab || (APP.filter.vocab = { lang: 'ko', q: '', box: '', sort: 'new' });
  let list = D('vocab-' + f.lang).list.slice();
  if (f.q) { const q = f.q.toLowerCase(); list = list.filter(w => [w.word, w.meaning, w.example, w.pron, w.tag].join(' ').toLowerCase().includes(q)); }
  if (f.box !== '') list = list.filter(w => String(w.box || 0) === f.box);
  list = f.sort === 'az' ? sortBy(list, w => w.word) : f.sort === 'due' ? sortBy(list, w => w.due || '') : sortBy(list, w => (w.added || '') + w.id, -1);
  const total = D('vocab-' + f.lang).list.length;
  return `<section class="card">
    <div class="filters">
      <div class="seg">${['ko', 'en'].map(l => `<button class="seg-b ${f.lang === l ? 'on' : ''}" data-act="vf-lang" data-l="${l}">${LANG_N[l]}</button>`).join('')}</div>
      <label class="search">${ic('search')}<input id="f-vq" data-chg="vf" data-k="q" value="${esc(f.q)}" placeholder="Soʻz, maʼno yoki misol" aria-label="Qidirish"></label>
      ${sel('vbox', [['', 'Barcha qutilar'], ...SRS_DAYS.map((_, i) => [String(i), `${i}-quti`])], f.box, 'data-chg="vf" data-k="box" aria-label="Quti"')}
      ${sel('vsort', [['new', 'Yangilari'], ['az', 'Alifbo'], ['due', 'Takrorlash sanasi']], f.sort, 'data-chg="vf" data-k="sort" aria-label="Tartib"')}
      ${btn(`${ic('plus')} Soʻz`, 'word-edit', `data-lang="${f.lang}"`, 'primary sm')}
    </div>
    <p class="muted sm">${total} ta soʻz${total > 900 ? ' · bitta tilda taxminan 1200 tagacha soʻz sigʻadi; undan koʻp boʻlsa, zaxira nusxa olib, eskilarini arxivlang' : ''}</p>
    ${list.length ? `<ul class="vocab">${list.slice(0, 300).map(w => `<li class="vw"><button class="vw-b" data-act="word-edit" data-lang="${f.lang}" data-id="${w.id}">
      <span class="vw-w ${f.lang === 'ko' ? 'kr' : ''}">${esc(w.word)}</span><span class="vw-m">${esc(w.meaning)}</span>
      ${w.pron ? `<span class="vw-p">[${esc(w.pron)}]</span>` : ''}${w.example ? `<span class="vw-e ${f.lang === 'ko' ? 'kr' : ''}">${esc(w.example)}</span>` : ''}
      <span class="vw-s">${chip((w.box || 0) + '-quti', 'ghostchip')}${w.tag ? chip(esc(w.tag), 'ghostchip') : ''}<span class="muted sm">takror: ${w.due ? fmtD(w.due) : 'bugun'}</span></span></button></li>`).join('')}</ul>${list.length > 300 ? `<p class="muted sm">Birinchi 300 tasi koʻrsatildi. Qidiruvdan foydalaning.</p>` : ''}` : empty(total ? 'Hech narsa topilmadi' : 'Lugʻat boʻsh', total ? 'Qidiruvni oʻzgartiring.' : 'Har kuni yangi soʻzlarni qoʻshing: soʻz, oʻzbekcha maʼnosi, misol va talaffuz.', btn('Soʻz qoʻshish', 'word-edit', `data-lang="${f.lang}"`, 'sm'))}
  </section>`;
}
ACT['vf-lang'] = el => { APP.filter.vocab.lang = el.dataset.l; render(); };
CHG.vf = el => { APP.filter.vocab[el.dataset.k] = el.value; render(); };
ACT['word-edit'] = el => {
  const lang = el.dataset.lang || 'ko', id = el.dataset.id, list = D('vocab-' + lang).list;
  const w = list.find(x => x.id === id) || {};
  openModal({
    title: id ? 'Soʻzni tahrirlash' : `${LANG_N[lang]} soʻz qoʻshish`,
    body: `<div class="fgrid">${field(lang === 'ko' ? 'Koreyscha soʻz' : 'Inglizcha soʻz', inp('word', w.word, 'text', `required maxlength="80" ${lang === 'ko' ? 'lang="ko" class="kr"' : 'lang="en"'}`))}${field('Oʻzbekcha maʼnosi', inp('meaning', w.meaning, 'text', 'required maxlength="160"'))}</div>
    ${field('Misol gap', inp('example', w.example, 'text', `maxlength="240" ${lang === 'ko' ? 'lang="ko" class="kr"' : ''}`))}
    <div class="fgrid">${field('Talaffuz eslatmasi', inp('pron', w.pron, 'text', `placeholder="${lang === 'ko' ? 'masalan: [공부] gong-bu' : 'masalan: /ˈθɔːt/'}"`))}${field('Teg (ixtiyoriy)', inp('tag', w.tag, 'text', `placeholder="${lang === 'ko' ? 'TOPIK 3, ish, restoran…' : 'IT, IELTS…'}"`))}</div>
    ${id ? '' : '<label class="cbx"><input type="checkbox" name="again" checked> Saqlagandan keyin yana soʻz qoʻshish</label>'}`,
    danger: id ? { label: 'Oʻchirish', fn: () => { list.splice(list.indexOf(w), 1); save('vocab-' + lang); } } : null,
    onSubmit: o => {
      const word = (o.word || '').trim(), meaning = (o.meaning || '').trim();
      if (!word || !meaning) return 'Soʻz va uning maʼnosini yozing.';
      if (!id && list.some(x => x.word === word)) return `“${word}” lugʻatda allaqachon bor.`;
      Object.assign(w, { word, meaning, example: (o.example || '').trim(), pron: (o.pron || '').trim(), tag: (o.tag || '').trim() });
      if (!id) { Object.assign(w, { id: uid(), added: today(), box: 0, due: today(), reviews: 0 }); list.push(w); }
      save('vocab-' + lang);
      if (o.again) { setTimeout(() => ACT['word-edit']({ dataset: { lang } }), 0); toast('Qoʻshildi'); }
    }
  });
};

/* takrorlash sessiyasi */
let REVIEW = null;
ACT['review-start'] = el => { const lang = el.dataset.lang; const q = dueWords(lang).sort(() => Math.random() - 0.5).slice(0, 30); if (!q.length) return toast('Takrorlash uchun soʻz yoʻq'); REVIEW = { lang, q, i: 0, show: false, ok: 0, bad: 0, dir: el.dataset.dir || 'fw' }; APP.tab.lang = 'review'; render(); };
function langReview() {
  if (REVIEW && REVIEW.i < REVIEW.q.length) {
    const w = REVIEW.q[REVIEW.i], fw = REVIEW.dir === 'fw', ko = REVIEW.lang === 'ko';
    return `<section class="card flash">
      <div class="row between"><span class="muted sm">${LANG_N[REVIEW.lang]} · ${REVIEW.i + 1}/${REVIEW.q.length}</span>${btn('Tugatish', 'review-stop', '', 'sm ghost')}</div>
      ${bar(pct(REVIEW.i, REVIEW.q.length))}
      <div class="fc"><div class="fc-q ${fw && ko ? 'kr' : ''}">${esc(fw ? w.word : w.meaning)}</div>
      ${REVIEW.show ? `<div class="fc-a ${!fw && ko ? 'kr' : ''}">${esc(fw ? w.meaning : w.word)}</div>${w.pron ? `<div class="vw-p">[${esc(w.pron)}]</div>` : ''}${w.example ? `<div class="vw-e ${ko ? 'kr' : ''}">${esc(w.example)}</div>` : ''}` : ''}</div>
      ${REVIEW.show ? `<div class="row gap8 center"><button class="btn danger" data-act="review-ans" data-ok="0">Bilmadim</button><button class="btn primary" data-act="review-ans" data-ok="1">Bildim</button></div>` : `<div class="row center"><button class="btn primary" data-act="review-show">Javobni koʻrsatish</button></div>`}
    </section>`;
  }
  const done = REVIEW ? `<section class="card"><h3>Takrorlash tugadi</h3><p>Bildim: <b>${REVIEW.ok}</b> · Bilmadim: <b>${REVIEW.bad}</b></p></section>` : '';
  if (REVIEW) REVIEW = null;
  return `${done}<div class="grid g2">${['ko', 'en'].map(l => { const n = dueWords(l).length; return `<section class="card">${sectionHead(LANG_N[l])}<p><b class="big">${n}</b> ta soʻz takrorlashni kutmoqda.</p>
    <div class="row gap8 wrap">${n ? btn('Boshlash: soʻz → maʼno', 'review-start', `data-lang="${l}" data-dir="fw"`, 'primary sm') + btn('Teskari: maʼno → soʻz', 'review-start', `data-lang="${l}" data-dir="bw"`, 'sm ghost') : '<span class="muted">Hozircha hammasi takrorlangan.</span>'}</div>
    <div class="boxes">${SRS_DAYS.map((d, i) => `<div class="bx"><b>${D('vocab-' + l).list.filter(w => (w.box || 0) === i).length}</b><span>${i}-quti · ${d ? d + ' kun' : 'bugun'}</span></div>`).join('')}</div></section>`; }).join('')}</div>
    <p class="muted sm">Leitner usuli: bilgan soʻzingiz keyingi qutiga oʻtadi va kamroq takrorlanadi (1, 3, 7, 14, 30, 60 kun). Bilmagan soʻz 0-qutiga qaytadi va ertaga yana chiqadi.</p>`;
}
ACT['review-show'] = () => { REVIEW.show = true; render(); };
ACT['review-stop'] = () => { REVIEW.q = REVIEW.q.slice(0, REVIEW.i); render(); };
ACT['review-ans'] = el => {
  const w = REVIEW.q[REVIEW.i], ok = el.dataset.ok === '1';
  const list = D('vocab-' + REVIEW.lang).list, real = list.find(x => x.id === w.id);
  if (real) {
    real.box = ok ? Math.min((real.box || 0) + 1, SRS_DAYS.length - 1) : 0;
    real.due = addDays(today(), ok ? SRS_DAYS[real.box] : 1);
    real.reviews = (real.reviews || 0) + 1; real.last = today();
    save('vocab-' + REVIEW.lang);
  }
  setDay(today(), d => { d.vr = d.vr || {}; d.vr[REVIEW.lang] = (d.vr[REVIEW.lang] || 0) + 1; });
  ok ? REVIEW.ok++ : REVIEW.bad++;
  REVIEW.i++; REVIEW.show = false; render();
};

function langGrammar() {
  const g = D('language').grammar;
  const st = { new: ['Yangi', ''], learning: ['Oʻrganyapman', 'warn'], known: ['Bilaman', 'ok'] };
  return `<section class="card">
    ${sectionHead('Grammatika roʻyxati', btn(`${ic('plus')} Qoʻshish`, 'gram-edit', '', 'primary sm'))}
    <div class="kv"><span>Jami</span><b>${g.length}</b><span>Bilaman</span><b>${g.filter(x => x.st === 'known').length}</b><span>Oʻrganyapman</span><b>${g.filter(x => x.st === 'learning').length}</b></div>
    ${g.length ? `<ul class="list">${sortBy(g, x => (x.lang || 'ko') + (x.st === 'known' ? 1 : 0)).map(x => `<li class="li"><span class="li-t"><b class="${(x.lang || 'ko') === 'ko' ? 'kr' : ''}">${esc(x.pattern)}</b> <span class="muted sm">· ${esc(x.meaning || '')}${x.level ? ' · ' + esc(x.level) : ''}</span>${x.example ? `<br><span class="sm ${(x.lang || 'ko') === 'ko' ? 'kr' : ''}">${esc(x.example)}</span>` : ''}</span><button class="chip btnchip ${st[x.st || 'new'][1]}" data-act="gram-cycle" data-id="${x.id}">${st[x.st || 'new'][0]}</button>${iconBtn('edit', 'gram-edit', `data-id="${x.id}"`, 'Tahrirlash')}</li>`).join('')}</ul>` : empty('Grammatika qoʻshilmagan', 'Masalan: -(으)ㄴ/는데, -기 때문에, -(으)ㄹ 수 있다. Holatini bosib oʻzgartirasiz.')}
  </section>`;
}
ACT['gram-cycle'] = el => { const x = D('language').grammar.find(g => g.id === el.dataset.id); x.st = x.st === 'known' ? 'new' : x.st === 'learning' ? 'known' : 'learning'; save('language'); render(); };
ACT['gram-edit'] = el => {
  const id = el.dataset.id, l = D('language').grammar, x = l.find(g => g.id === id) || { lang: 'ko', st: 'new' };
  openModal({
    title: id ? 'Grammatikani tahrirlash' : 'Grammatika qoʻshish',
    body: `<div class="fgrid">${field('Til', sel('lang', [['ko', 'Koreys'], ['en', 'Ingliz']], x.lang))}${field('Holat', sel('st', [['new', 'Yangi'], ['learning', 'Oʻrganyapman'], ['known', 'Bilaman']], x.st))}${field('Daraja', inp('level', x.level, 'text', 'placeholder="TOPIK 3"'))}</div>
    ${field('Qolip', inp('pattern', x.pattern, 'text', 'required class="kr"'))}${field('Maʼnosi', inp('meaning', x.meaning))}${field('Misol', inp('example', x.example, 'text', 'class="kr"'))}`,
    danger: id ? { label: 'Oʻchirish', fn: () => { l.splice(l.indexOf(x), 1); save('language'); } } : null,
    onSubmit: o => { if (!(o.pattern || '').trim()) return 'Qolipni yozing.'; Object.assign(x, { lang: o.lang, st: o.st, level: o.level || '', pattern: o.pattern.trim(), meaning: o.meaning || '', example: o.example || '' }); if (!id) { x.id = uid(); l.push(x); } save('language'); }
  });
};

function langTopik() {
  const mocks = sortBy(D('language').mocks, m => m.date), target = S().topikTarget;
  const last = mocks[mocks.length - 1];
  const need = target >= 3 ? [0, 0, 0, 120, 150, 190, 230][target] : [0, 80, 140][target];
  return `<div class="tiles">
    <div class="tile static"><span class="tile-k">Maqsad</span><b>TOPIK ${target}</b><span>${target >= 3 ? `TOPIK II, kamida ${need}/300` : `TOPIK I, kamida ${need}/200`}</span></div>
    <div class="tile static"><span class="tile-k">Oxirgi sinov</span><b>${last ? last.total : '—'}</b><span>${last ? `${fmtD(last.date)} · ${topikLevel(last) ? topikLevel(last) + '-daraja' : 'darajasiz'}` : 'hali yoʻq'}</span></div>
    <div class="tile static"><span class="tile-k">Maqsadgacha</span><b>${last ? Math.max(0, need - num(last.total)) : '—'}</b><span>ball qoldi</span></div>
  </div>
  <section class="card">
    ${sectionHead('Sinov imtihonlari', btn(`${ic('plus')} Natija`, 'mock-edit', '', 'primary sm'))}
    ${mocks.length > 1 ? lineChart(mocks.map(m => ({ x: fmtD(m.date), y: num(m.total) })), { h: 170, goal: need, minZero: true }) : ''}
    ${mocks.length ? `<div class="tbl-w"><table class="tbl"><thead><tr><th>Sana</th><th>Tur</th><th>Tinglash</th><th>Oʻqish</th><th>Yozish</th><th>Jami</th><th>Daraja</th><th></th></tr></thead><tbody>${[...mocks].reverse().map(m => `<tr><td>${fmtD(m.date)}</td><td>TOPIK ${m.kind}</td><td class="mono">${m.listening ?? ''}</td><td class="mono">${m.reading ?? ''}</td><td class="mono">${m.kind === 'II' ? (m.writing ?? '') : '—'}</td><td class="mono"><b>${m.total}</b></td><td>${topikLevel(m) || '—'}</td><td>${iconBtn('edit', 'mock-edit', `data-id="${m.id}"`, 'Tahrirlash')}</td></tr>`).join('')}</tbody></table></div>` : empty('Natija yoʻq', 'Sinov imtihoni (모의고사) natijalarini kiriting: tinglash, oʻqish, yozish ballari.')}
    <p class="muted sm">Darajalar rasmiy chegaralar boʻyicha: TOPIK II — 3: 120, 4: 150, 5: 190, 6: 230 ball (300 dan); TOPIK I — 1: 80, 2: 140 (200 dan).</p>
  </section>`;
}
ACT['mock-edit'] = el => {
  const id = el.dataset.id, l = D('language').mocks, m = l.find(x => x.id === id) || { kind: 'II', date: today() };
  openModal({
    title: id ? 'Natijani tahrirlash' : 'Sinov natijasi',
    body: `<div class="fgrid">${field('Sana', inp('date', m.date, 'date', 'required'))}${field('Tur', sel('kind', [['II', 'TOPIK II (3–6)'], ['I', 'TOPIK I (1–2)']], m.kind))}</div>
    <div class="fgrid">${field('Tinglash (듣기)', inp('listening', m.listening, 'number', 'min="0" max="100"'))}${field('Oʻqish (읽기)', inp('reading', m.reading, 'number', 'min="0" max="100"'))}${field('Yozish (쓰기, faqat II)', inp('writing', m.writing, 'number', 'min="0" max="100"'))}</div>
    ${field('Izoh', inp('note', m.note))}`,
    danger: id ? { label: 'Oʻchirish', fn: () => { l.splice(l.indexOf(m), 1); save('language'); } } : null,
    onSubmit: o => {
      if (!o.date) return 'Sanani tanlang.';
      const parts = [o.listening, o.reading, o.kind === 'II' ? o.writing : ''].filter(v => v !== '');
      if (!parts.length) return 'Kamida bitta qism ballini kiriting.';
      if (parts.some(v => num(v) < 0 || num(v) > 100)) return 'Har bir qism 0 dan 100 gacha.';
      Object.assign(m, { date: o.date, kind: o.kind, listening: numOrNull(o.listening), reading: numOrNull(o.reading), writing: o.kind === 'II' ? numOrNull(o.writing) : null, total: sum(parts, num), note: o.note || '' });
      if (!id) { m.id = uid(); l.push(m); } save('language');
    }
  });
};

function langReport() {
  const weeks = [-3, -2, -1, 0].map(n => weekStart(addDays(today(), n * 7)));
  const data = weeks.map(w => { const r = { label: fmtD(w) }; const logs = allM('lang').filter(l => l.date >= w && l.date <= addDays(w, 6)); Object.keys(SKILLS).forEach(k => r[k] = sum(logs.filter(l => l.skill === k), l => l.min)); return r; });
  const colors = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)', 'var(--c6)'];
  const days30 = lastN(30);
  const words = days30.map(d => ({ label: +d.slice(8) + '', value: wordsAdded('ko', d) + wordsAdded('en', d) }));
  const koDays = days30.filter(d => langMet('ko', d) === 1).length, enDays = days30.filter(d => langMet('en', d) === 1).length;
  return `<div class="tiles">
    <div class="tile static"><span class="tile-k">Koreys · 30 kun</span><b>${koDays}</b><span>kun maqsad bajarildi</span></div>
    <div class="tile static"><span class="tile-k">Ingliz · 30 kun</span><b>${enDays}</b><span>kun maqsad bajarildi</span></div>
    <div class="tile static"><span class="tile-k">Seriya</span><b>${streakOf(d => langMet('ko', d))}</b><span>kun ketma-ket koreys</span></div>
  </div>
  <div class="grid g2">
    <section class="card">${sectionHead('Haftalik daqiqalar (koʻnikma boʻyicha)')}${data.some(r => Object.keys(SKILLS).some(k => r[k])) ? barChart(data, { h: 170, stacked: Object.keys(SKILLS).map((k, i) => ({ key: k, label: SKILLS[k], color: colors[i] })), fmt: v => Math.round(v) }) : '<p class="muted">Mashq yozilganda grafik chiqadi.</p>'}</section>
    <section class="card">${sectionHead('Yangi soʻzlar · 30 kun')}${words.some(w => w.value) ? barChart(words, { h: 170, fmt: v => Math.round(v) }) : '<p class="muted">Soʻz qoʻshilganda grafik chiqadi.</p>'}</section>
  </div>`;
}
