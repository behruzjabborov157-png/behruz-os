'use strict';
/* Sozlamalar, maʼlumotlarni eksport/import qilish, tozalash va birinchi ochilishdagi sozlash ustasi */

/* ---------- Fayl berish (downloads imkoniyati, boʻlmasa nusxa olish oynasi) ---------- */
async function offerFile(filename, text) {
  let dl = null;
  try { dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null; } catch (e) { }
  if (dl) {
    try { await dl.save({ filename, data: text }); toast('Fayl saqlandi'); return; }
    catch (e) { if (e && e.code === 'declined') { toast('Bekor qilindi'); return; } }
  }
  // Android ilova (Capacitor): faylni Hujjatlar papkasiga yozib, ulashish oynasini ochamiz
  const cap = window.Capacitor, FS = cap && cap.Plugins && cap.Plugins.Filesystem;
  if (FS && cap.isNativePlatform && cap.isNativePlatform()) {
    try {
      const r = await FS.writeFile({ path: filename, data: text, directory: 'DOCUMENTS', encoding: 'utf8', recursive: true });
      toast('Saqlandi: Hujjatlar/' + filename);
      const SH = cap.Plugins.Share;
      if (SH) { try { await SH.share({ title: filename, url: r.uri, dialogTitle: 'Faylni yuborish yoki saqlash' }); } catch (e) { } }
      return;
    } catch (e) {
      try {
        const r = await FS.writeFile({ path: filename, data: text, directory: 'CACHE', encoding: 'utf8' });
        if (cap.Plugins.Share) { await cap.Plugins.Share.share({ title: filename, url: r.uri, dialogTitle: 'Faylni saqlash' }); return; }
      } catch (e2) { }
    }
  }
  // Kompyuter ilovasi (Electron) va oddiy brauzer: odatiy yuklab olish
  if (!(window.claude && window.claude.use)) {
    try {
      const url = URL.createObjectURL(new Blob([text], { type: filename.endsWith('.csv') ? 'text/csv;charset=utf-8' : 'application/json' }));
      const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000); toast('Fayl yuklab olindi'); return;
    } catch (e) { }
  }
  openModal({
    title: 'Faylni nusxalash', noSubmit: true, wide: true,
    body: `<p class="muted">Bu oynada faylni yuklab olib boʻlmadi. Matnni nusxalab, kompyuteringizda <b>${esc(filename)}</b> nomli faylga saqlang.</p>
    <textarea id="f-export" rows="12" readonly class="mono sm">${esc(text)}</textarea>
    <div class="mf"><span class="sp"></span><button type="button" class="btn primary" data-act="copy-export">Nusxalash</button></div>`
  });
}
ACT['copy-export'] = async () => {
  const ta = document.getElementById('f-export');
  try { await navigator.clipboard.writeText(ta.value); toast('Nusxalandi'); }
  catch (e) { ta.focus(); ta.select(); toast('Matn belgilandi: Ctrl+C bosing'); }
};
function exportAll() { const out = { app: 'BEHRUZ OS', version: 1, exportedAt: new Date().toISOString(), docs: {} }; for (const k in Store.docs) out.docs[k] = Store.docs[k]; return JSON.stringify(out, null, 1); }

VIEWS.config = () => {
  const s = S();
  return `<div class="grid g2">
  <section class="card">${sectionHead('Profil va kun tartibi')}
    <form data-form="cfg-profile" class="stack">
      <div class="fgrid">${field('Ism', inp('name', s.name, 'text', 'required'))}${field('Semestr', inp('semester', s.semester, 'text', 'placeholder="2026-2-semestr"'))}</div>
      <div class="fgrid">${field('Semestr boshlanishi', inp('semStart', s.semStart, 'date'))}${field('Semestr tugashi', inp('semEnd', s.semEnd, 'date'))}</div>
      <div class="fgrid">${field('Uygʻonish', inp('wake', s.wake, 'time', 'required'))}${field('Uxlash', inp('sleep', s.sleep, 'time', 'required'))}${field('“Juda kech” chegarasi', inp('lateNight', s.lateNight, 'time'), 'Shundan keyin bajarilgan ish XP bermaydi')}</div>
      <div class="row end"><button class="btn primary sm">Saqlash</button></div><p class="ferr"></p>
    </form>
  </section>
  <section class="card">${sectionHead('Til maqsadlari')}
    <form data-form="cfg-lang" class="stack">
      <div class="tbl-w"><table class="tbl"><thead><tr><th></th><th>Oddiy kun</th><th>Yengil kun</th></tr></thead><tbody>
        <tr><td>Koreys soʻzlar</td><td>${inp('koWords', s.koWords, 'number', 'min="0" max="200" aria-label="Koreys soʻzlar, oddiy kun"')}</td><td>${inp('koWordsLight', s.koWordsLight, 'number', 'min="0" max="200" aria-label="Koreys soʻzlar, yengil kun"')}</td></tr>
        <tr><td>Koreys daqiqa</td><td>${inp('koMin', s.koMin, 'number', 'min="0" max="600" aria-label="Koreys daqiqa, oddiy kun"')}</td><td>${inp('koMinLight', s.koMinLight, 'number', 'min="0" max="600" aria-label="Koreys daqiqa, yengil kun"')}</td></tr>
        <tr><td>Ingliz soʻzlar</td><td>${inp('enWords', s.enWords, 'number', 'min="0" max="200" aria-label="Ingliz soʻzlar, oddiy kun"')}</td><td>${inp('enWordsLight', s.enWordsLight, 'number', 'min="0" max="200" aria-label="Ingliz soʻzlar, yengil kun"')}</td></tr>
        <tr><td>Ingliz daqiqa</td><td>${inp('enMin', s.enMin, 'number', 'min="0" max="600" aria-label="Ingliz daqiqa, oddiy kun"')}</td><td>${inp('enMinLight', s.enMinLight, 'number', 'min="0" max="600" aria-label="Ingliz daqiqa, yengil kun"')}</td></tr>
      </tbody></table></div>
      ${field('TOPIK maqsad darajasi', sel('topikTarget', [1, 2, 3, 4, 5, 6].map(n => [n, 'TOPIK ' + n]), s.topikTarget))}
      <div class="row end"><button class="btn primary sm">Saqlash</button></div><p class="ferr"></p>
    </form>
  </section>
  <section class="card">${sectionHead('Chegaralar va ibodat')}
    <form data-form="cfg-limits" class="stack">
      <div class="fgrid">${field('Ijtimoiy tarmoq + scroll (daq/kun)', inp('socialLimit', s.socialLimit, 'number', 'min="0" max="1440"'))}${field('Oʻyin (daq/kun)', inp('gamingLimit', s.gamingLimit, 'number', 'min="0" max="1440"'))}</div>
      <label class="cbx"><input type="checkbox" name="prayers" ${s.prayers ? 'checked' : ''}> Namozlarni kuzatish</label>
      ${field('Qurʼon: kunlik sahifa maqsadi', inp('quranPages', s.quranPages, 'number', 'min="0" max="604"'))}
      <div class="row end"><button class="btn primary sm">Saqlash</button></div><p class="ferr"></p>
    </form>
  </section>
  <section class="card">${sectionHead('GPA shkalasi')}
    <form data-form="cfg-gpa" class="stack">
      ${field('Maksimal ball', sel('gpaScale', [['4.5', '4.5'], ['4.3', '4.3'], ['4.0', '4.0']], String(s.gpaScale)))}
      ${field('Baho = ball (har biri yangi qatorda)', area('map', s.gradeMap.map(g => `${g[0]}=${g[1]}`).join('\n'), 'rows="9" class="mono"'), 'Universitetingiz qoidasiga moslang.')}
      <div class="row end"><button class="btn primary sm">Saqlash</button></div><p class="ferr"></p>
    </form>
  </section>
  </div>
  <section class="card">${sectionHead('Maʼlumotlar')}
    <p>${Store.mode === 'cloud' ? `${ic('shield')} Maʼlumotlaringiz shu sahifaning shaxsiy xotirasida saqlanadi. Uni faqat siz koʻrasiz: sahifani kimgadir ulashsangiz ham, ular sizning yozuvlaringizni koʻra olmaydi.` : Store.mode === 'local' ? 'Maʼlumotlar faqat shu brauzerda saqlanmoqda. Brauzer tozalansa, ular yoʻqoladi. Muntazam zaxira nusxa oling.' : 'Saqlash ishlamayapti. Zaxira nusxa oling.'}</p>
    <div class="row gap8 wrap">${btn(`${ic('download')} Zaxira nusxa (JSON)`, 'export-json', '', 'primary sm')}${btn('Tranzaksiyalar (CSV)', 'tx-csv', '', 'sm ghost')}
      <label class="btn sm ghost">${ic('upload')} Zaxiradan tiklash<input type="file" accept=".json,application/json" id="f-import" data-chg="import" hidden></label>
      ${btn('Sozlash ustasini qayta ochish', 'ob-restart', '', 'sm ghost')}</div>
    <h4 class="sub">Hammasini oʻchirish</h4>
    <form data-form="wipe" class="inline-form"><input name="c" id="f-wipe" placeholder="OʻCHIRISH deb yozing" aria-label="Tasdiqlash soʻzi" autocomplete="off"><button class="btn danger sm">Barcha maʼlumotni oʻchirish</button><p class="ferr"></p></form>
  </section>
  <section class="card">${sectionHead('Bu sayt nimalarni qila olmaydi')}
    <ul class="tips">
      <li>Telefoningizdagi ekran vaqtini oʻzi oʻqiy olmaydi va ilovalarni bloklay olmaydi. Raqamlarni qoʻlda kiritasiz.</li>
      <li>Bank yoki kartangizga ulanmaydi, toʻlov qilmaydi. Barcha summalarni oʻzingiz kiritasiz.</li>
      <li>Telefonga bildirishnoma (push) yubora olmaydi. Eslatmalar bosh sahifadagi “Diqqat talab qiladi” boʻlimida chiqadi.</li>
      <li>Joylashuvingizni avtomatik aniqlay olmaydi. Namoz vaqtlari siz kiritgan koordinatalardan hisoblanadi.</li>
      <li>Universitet tizimiga (eCampus va boshqalar) ulanmaydi. Jadval va baholarni oʻzingiz kiritasiz.</li>
    </ul>
  </section>`;
};
FORM['cfg-profile'] = o => { if (!(o.name || '').trim()) return 'Ismni yozing.'; if (o.semStart && o.semEnd && o.semEnd < o.semStart) return 'Semestr tugashi boshlanishidan keyin boʻlsin.'; Object.assign(S(), { name: o.name.trim(), semester: o.semester || '', semStart: o.semStart || '', semEnd: o.semEnd || '', wake: o.wake, sleep: o.sleep, lateNight: o.lateNight || '00:30' }); save('settings'); toast('Saqlandi'); render(); };
FORM['cfg-lang'] = o => { const k = ['koWords', 'koWordsLight', 'koMin', 'koMinLight', 'enWords', 'enWordsLight', 'enMin', 'enMinLight']; if (k.some(x => num(o[x]) < 0)) return 'Manfiy son boʻlmaydi.'; k.forEach(x => S()[x] = num(o[x])); S().topikTarget = +o.topikTarget; save('settings'); toast('Saqlandi'); render(); };
FORM['cfg-limits'] = o => { Object.assign(S(), { socialLimit: num(o.socialLimit), gamingLimit: num(o.gamingLimit), prayers: !!o.prayers, quranPages: num(o.quranPages) }); save('settings'); toast('Saqlandi'); render(); };
FORM['cfg-gpa'] = o => {
  const rows = (o.map || '').split('\n').map(l => l.trim()).filter(Boolean).map(l => l.split('='));
  if (!rows.length || rows.some(r => r.length !== 2 || !r[0].trim() || isNaN(parseFloat(r[1])))) return 'Har bir qator “A+=4.5” koʻrinishida boʻlsin.';
  const sc = +o.gpaScale; if (rows.some(r => parseFloat(r[1]) > sc)) return `Ball ${sc} dan oshmasin.`;
  S().gpaScale = sc; S().gradeMap = rows.map(r => [r[0].trim(), parseFloat(r[1])]); save('settings'); toast('Saqlandi'); render();
};
ACT['export-json'] = () => offerFile(`behruz-os-zaxira-${today()}.json`, exportAll());
CHG.import = el => {
  const file = el.files && el.files[0]; if (!file) return;
  const r = new FileReader();
  r.onload = () => {
    let data; try { data = JSON.parse(r.result); } catch (e) { toast('Bu JSON fayl emas'); return; }
    if (!data || data.app !== 'BEHRUZ OS' || !data.docs || typeof data.docs !== 'object') { toast('Bu BEHRUZ OS zaxira fayli emas'); return; }
    openModal({
      title: 'Zaxiradan tiklash', submit: 'Ha, almashtirish',
      body: `<p>${esc(file.name)} — ${data.exportedAt ? fmtDL(data.exportedAt.slice(0, 10)) : ''}. Hozirgi barcha maʼlumotlar shu fayldagi bilan <b>almashtiriladi</b>.</p>`,
      onSubmit: () => { Store.docs = {}; for (const k in data.docs) { Store.docs[k] = data.docs[k]; Store.save(k); } toast('Tiklandi'); }
    });
  };
  r.readAsText(file); el.value = '';
};
FORM.wipe = o => {
  if ((o.c || '').trim().toUpperCase() !== 'OʻCHIRISH') return 'Tasdiqlash uchun aynan “OʻCHIRISH” deb yozing.';
  Store.removeAll().then(() => { APP.tab = {}; APP.sel = {}; APP.filter = {}; render(); toast('Hammasi oʻchirildi'); });
};
ACT['ob-restart'] = () => { S().onboarded = false; S().obStep = 0; save('settings'); render(); };

/* ---------- Birinchi ochilish ustasi ---------- */
const OB_STEPS = ['Xush kelibsiz', 'Kurslar', 'Ish', 'Pul', 'Tillar', 'Sogʻliq', 'Ibodat', 'Odatlar', 'Maqsadlar'];
function renderOnboarding() {
  const s = S(), step = s.obStep || 0;
  const body = [obWelcome, obCourses, obWork, obMoney, obLang, obHealth, obFaith, obHabits, obGoals][step]();
  return `<div class="ob"><div class="ob-in">
    <div class="brand"><span class="brand-mark">B</span><span><b>BEHRUZ</b> OS</span></div>
    <ol class="ob-steps">${OB_STEPS.map((n, i) => `<li class="${i === step ? 'on' : i < step ? 'done' : ''}">${n}</li>`).join('')}</ol>
    <form data-form="ob" class="card ob-card">
      <p class="eyebrow">${step + 1}/${OB_STEPS.length}-qadam</p>
      ${body}
      <p class="ferr"></p>
      <div class="mf">${step ? '<button type="button" class="btn ghost" data-act="ob-back">Orqaga</button>' : ''}<span class="sp"></span>${step < OB_STEPS.length - 1 ? '<button type="button" class="btn ghost" data-act="ob-skip">Keyinroq</button>' : ''}<button class="btn primary">${step === OB_STEPS.length - 1 ? 'Boshlash' : 'Keyingi'}</button></div>
    </form>
    <p class="muted sm center">Hammasini keyin Sozlamalar va boʻlimlarda oʻzgartirishingiz mumkin. Hech narsa oldindan taxmin qilinmaydi: faqat siz kiritgan raqamlar ishlatiladi.</p>
  </div></div>`;
}
function obWelcome() {
  const s = S();
  return `<h2>Assalomu alaykum! Kelajakni bugundan quramiz.</h2>
  <p class="muted">BEHRUZ OS — oʻqish, ish, pul, sogʻliq, ibodat va odatlaringizni bir joyda kuzatadigan shaxsiy tizim. Avval bir necha savol.</p>
  <div class="fgrid">${field('Ismingiz', inp('name', s.name, 'text', 'required'))}${field('Joriy semestr', inp('semester', s.semester, 'text', 'placeholder="2026-2-semestr"'))}</div>
  <div class="fgrid">${field('Semestr boshlanishi', inp('semStart', s.semStart, 'date'))}${field('Semestr tugashi', inp('semEnd', s.semEnd, 'date'))}</div>
  <div class="fgrid">${field('Uygʻonish maqsadi', inp('wake', s.wake, 'time', 'required'))}${field('Uxlash maqsadi', inp('sleep', s.sleep, 'time', 'required'))}${field('Uyqu (soat)', inp('sleepHours', s.sleepHours, 'number', 'min="4" max="12" step="0.5"'))}</div>`;
}
function obCourses() {
  const l = D('courses').list;
  return `<h2>Shu semestrdagi kurslaringiz</h2><p class="muted">Har bir kurs uchun bitta dars vaqti. Ikkinchi dars vaqtini, professor va qoidalarni keyin Universitet boʻlimida qoʻshasiz.</p>
  ${[0, 1, 2, 3, 4, 5, 6].map(k => { const c = l[k] || {}, x = (c.sessions || [])[0] || {}; return `<div class="fgrid ob-row">${inp('cn' + k, c.name, 'text', 'placeholder="Fan nomi" aria-label="Fan nomi"')}${inp('cc' + k, c.credits, 'number', 'placeholder="Kredit" min="0" step="0.5" aria-label="Kredit"')}${sel('cd' + k, [['', 'Kun'], ...WEEK_ORDER.map(d => [d, UZ_DS[d]])], x.d ?? '', 'aria-label="Kun"')}${inp('cs' + k, x.s, 'time', 'aria-label="Boshlanish"')}${inp('ce' + k, x.e, 'time', 'aria-label="Tugash"')}${inp('cr' + k, c.room, 'text', 'placeholder="Xona" aria-label="Xona"')}</div>`; }).join('')}`;
}
function obWork() {
  const j = D('work').job, t = D('work').template;
  return `<h2>Yarim kunlik ish</h2><p class="muted">Maosh faqat siz kiritgan soatlik stavka va smenalardan taxminan hisoblanadi.</p>
  <div class="fgrid">${field('Ish joyi', inp('jname', j.name, 'text', 'placeholder="Restoran nomi"'))}${field('Soatlik maosh (₩)', inp('wage', j.wage || '', 'text', 'inputmode="numeric"'))}${field('Maosh kuni', inp('payday', j.payday, 'number', 'min="1" max="31"'))}</div>
  <h4 class="sub">Odatiy haftalik smenalar</h4>
  ${[0, 1, 2, 3, 4].map(k => { const x = t[k] || {}; return `<div class="fgrid">${sel('wd' + k, [['', 'Kun'], ...WEEK_ORDER.map(d => [d, UZ_DAYS[d]])], x.d ?? '', 'aria-label="Kun"')}${inp('ws' + k, x.s, 'time', 'aria-label="Boshlanish"')}${inp('we' + k, x.e, 'time', 'aria-label="Tugash"')}${inp('wb' + k, x.brk, 'number', 'placeholder="Tanaffus daq" min="0" aria-label="Tanaffus"')}</div>`; }).join('')}`;
}
function obMoney() {
  const m = D('money'), b = m.bills;
  const find = n => b.find(x => x.name === n) || {};
  return `<h2>Pul</h2><p class="muted">Faqat oʻzingiz bilgan raqamlarni kiriting. Bilmaganingizni boʻsh qoldiring.</p>
  <div class="fgrid">${field('Ijara (₩/oy)', inp('rent', find('Ijara').amt, 'text', 'inputmode="numeric"'))}${field('Ijara toʻlov kuni', inp('rentDay', find('Ijara').day || '', 'number', 'min="1" max="31"'))}</div>
  <div class="fgrid">${field('Telefon (₩/oy)', inp('phone', find('Telefon').amt, 'text', 'inputmode="numeric"'))}${field('Telefon toʻlov kuni', inp('phoneDay', find('Telefon').day || '', 'number', 'min="1" max="31"'))}</div>
  <div class="fgrid">${field('Kontrakt summasi (₩)', inp('tuition', find('Kontrakt').amt, 'text', 'inputmode="numeric"'))}${field('Kontrakt muddati', inp('tuitionDate', find('Kontrakt').date, 'date'))}</div>
  <div class="fgrid">${field('Ovqat byudjeti (₩/oy)', inp('food', (m.budget || {})['Ovqat'] || '', 'text', 'inputmode="numeric"'))}${field('Transport byudjeti (₩/oy)', inp('transport', (m.budget || {})['Transport'] || '', 'text', 'inputmode="numeric"'))}</div>
  <div class="fgrid">${field('Oʻyin / skin uchun oylik chegara (₩)', inp('impulse', m.impulseLimit || '', 'text', 'inputmode="numeric" placeholder="0 = umuman yoʻq"'))}${field('Favqulodda jamgʻarma maqsadi (₩)', inp('ef', m.emergencyTarget || '', 'text', 'inputmode="numeric"'))}</div>`;
}
function obLang() {
  const s = S();
  return `<h2>Til oʻrganish</h2><p class="muted">Yengil kun — uzun smena yoki charchagan kun. Shunda ham kichik qadam qilasiz.</p>
  <div class="fgrid">${field('Koreys soʻz/kun', inp('koWords', s.koWords, 'number', 'min="0"'))}${field('Yengil kunda', inp('koWordsLight', s.koWordsLight, 'number', 'min="0"'))}${field('Koreys daq/kun', inp('koMin', s.koMin, 'number', 'min="0"'))}</div>
  <div class="fgrid">${field('Ingliz soʻz/kun', inp('enWords', s.enWords, 'number', 'min="0"'))}${field('Yengil kunda', inp('enWordsLight', s.enWordsLight, 'number', 'min="0"'))}${field('Ingliz daq/kun', inp('enMin', s.enMin, 'number', 'min="0"'))}</div>
  ${field('TOPIK maqsadi', sel('topikTarget', [1, 2, 3, 4, 5, 6].map(n => [n, 'TOPIK ' + n]), s.topikTarget))}`;
}
function obHealth() {
  const s = S();
  return `<h2>Sogʻliq</h2><p class="muted">Realistik maqsad qoʻying. Sekin, lekin doimiy oʻzgarish eng yaxshisi.</p>
  <div class="fgrid">${field('Hozirgi vazn (kg)', inp('kg', '', 'number', 'min="30" max="250" step="0.1"'))}${field('Maqsad vazn (kg)', inp('weightGoal', s.weightGoal ?? '', 'number', 'min="30" max="250" step="0.1"'))}</div>
  <div class="fgrid">${field('Suv (stakan/kun)', inp('water', s.water, 'number', 'min="1" max="20"'))}${field('Oqsil (g/kun, ixtiyoriy)', inp('protein', s.protein || '', 'number', 'min="0" max="300"'))}</div>
  ${field('Mashq kunlari', daysPicker('wdays', s.workoutDays))}`;
}
function obFaith() {
  const s = S();
  return `<h2>Ibodat</h2><p class="muted">Bu qism shaxsiy. Maqsad — aybdorlik emas, izchillik.</p>
  <label class="cbx"><input type="checkbox" name="prayers" ${s.prayers ? 'checked' : ''}> Besh vaqt namozni kuzatish</label>
  ${field('Qurʼon: kuniga necha sahifa', inp('quranPages', s.quranPages, 'number', 'min="0" max="604"'))}
  <p class="muted sm">Namoz vaqtlarini keyin Ibodat → Namoz vaqtlari boʻlimida koordinata yoki qoʻlda kiritasiz.</p>`;
}
function obHabits() {
  const have = D('habits').list.map(h => h.name);
  return `<h2>Kundalik odatlar</h2><p class="muted">Keraklilarini belgilang. Kunlarini, maqsadini va tartibini keyin oʻzgartirasiz.</p>
  <div class="ob-habits">${DEFAULT_HABITS.map(([n, c]) => `<label class="cbx"><input type="checkbox" name="h" value="${esc(n)}" ${!have.length || have.includes(n) ? 'checked' : ''} ${have.includes(n) ? 'disabled' : ''}> ${esc(n)} <span class="muted sm">· ${c}</span></label>`).join('')}</div>`;
}
function obGoals() {
  const g = D('growth').goals;
  return `<h2>Asosiy maqsadlar</h2><p class="muted">Har bir maqsadni yangi qatorga yozing.</p>
  ${field('Qisqa muddatli (shu semestr)', area('short', g.filter(x => x.kind === 'short').map(x => x.title).join('\n'), 'rows="4" placeholder="Barcha darslarga qatnashish\nTOPIK 3 ga tayyorlanish\nHar oy 200 000 ₩ jamgʻarish"'))}
  ${field('Uzoq muddatli (1–5 yil)', area('long', g.filter(x => x.kind === 'long').map(x => x.title).join('\n'), 'rows="4" placeholder="Universitetni tugatish\nKoreyada IT sohasida ishlash\nMoliyaviy mustaqillik"'))}`;
}
ACT['ob-back'] = () => { S().obStep = Math.max(0, (S().obStep || 0) - 1); save('settings'); render(); };
ACT['ob-skip'] = () => { S().obStep = (S().obStep || 0) + 1; save('settings'); render(); };
FORM.ob = o => {
  const s = S(), step = s.obStep || 0;
  if (step === 0) {
    if (!(o.name || '').trim()) return 'Ismingizni yozing.';
    if (!o.wake || !o.sleep) return 'Uygʻonish va uxlash vaqtini kiriting.';
    Object.assign(s, { name: o.name.trim(), semester: o.semester || '', semStart: o.semStart || '', semEnd: o.semEnd || '', wake: o.wake, sleep: o.sleep, sleepHours: num(o.sleepHours) || 7.5 });
  }
  if (step === 1) {
    const l = D('courses').list, out = [];
    for (let k = 0; k < 7; k++) {
      const name = (o['cn' + k] || '').trim(); if (!name) continue;
      const ex = l.find(c => c.name === name) || { id: uid(), rules: {}, color: COURSE_COLORS[out.length % COURSE_COLORS.length] };
      const hasT = (o['cd' + k] ?? '') !== '' && o['cs' + k] && o['ce' + k];
      if (((o['cd' + k] ?? '') !== '' || o['cs' + k]) && !hasT) return `“${name}”: dars kuni, boshlanish va tugash vaqtini toʻliq kiriting yoki boʻsh qoldiring.`;
      if (hasT && tmin(o['ce' + k]) <= tmin(o['cs' + k])) return `“${name}”: tugash vaqti boshlanishdan keyin boʻlsin.`;
      Object.assign(ex, { name, credits: (o['cc' + k] ?? '') === '' ? '' : num(o['cc' + k]), room: o['cr' + k] || '', sessions: hasT ? [{ d: +o['cd' + k], s: o['cs' + k], e: o['ce' + k], room: '' }].concat((ex.sessions || []).slice(1)) : (ex.sessions || []) });
      out.push(ex);
    }
    D('courses').list = out.concat(l.filter(c => !out.includes(c) && !c.name)); save('courses');
  }
  if (step === 2) {
    const w = D('work'), tpl = [];
    for (let k = 0; k < 5; k++) { if ((o['wd' + k] ?? '') === '' && !o['ws' + k]) continue; if ((o['wd' + k] ?? '') === '' || !o['ws' + k] || !o['we' + k]) return `${k + 1}-smena qatori toʻliq emas.`; tpl.push({ d: +o['wd' + k], s: o['ws' + k], e: o['we' + k], brk: num(o['wb' + k]) }); }
    Object.assign(w.job, { name: o.jname || '', wage: num(o.wage), payday: num(o.payday) || 10 }); w.template = tpl; save('work');
  }
  if (step === 3) {
    const m = D('money');
    const bill = (name, cat, amt, extra) => { const a = num(amt); const i = m.bills.findIndex(b => b.name === name); if (!a) { if (i >= 0) m.bills.splice(i, 1); return; } const b = i >= 0 ? m.bills[i] : { id: uid(), name, cat, start: today() }; Object.assign(b, { amt: a }, extra); if (i < 0) m.bills.push(b); };
    if (num(o.rent) && !num(o.rentDay)) return 'Ijara toʻlov kunini kiriting.';
    if (num(o.tuition) && !o.tuitionDate) return 'Kontrakt muddatini kiriting.';
    bill('Ijara', 'Ijara', o.rent, { kind: 'monthly', day: num(o.rentDay) || 1 });
    bill('Telefon', 'Telefon', o.phone, { kind: 'monthly', day: num(o.phoneDay) || 1 });
    bill('Kontrakt', 'Kontrakt (tuition)', o.tuition, { kind: 'once', date: o.tuitionDate || '' });
    m.budget = m.budget || {};
    if (num(o.rent)) m.budget['Ijara'] = num(o.rent); if (num(o.phone)) m.budget['Telefon'] = num(o.phone);
    if (num(o.food)) m.budget['Ovqat'] = num(o.food); if (num(o.transport)) m.budget['Transport'] = num(o.transport);
    m.impulseLimit = num(o.impulse); m.emergencyTarget = num(o.ef); save('money');
  }
  if (step === 4) { ['koWords', 'koWordsLight', 'koMin', 'enWords', 'enWordsLight', 'enMin'].forEach(k => s[k] = num(o[k])); s.koMinLight = Math.round(s.koMin / 3); s.enMinLight = Math.round(s.enMin / 3); s.topikTarget = +o.topikTarget; }
  if (step === 5) {
    if (o.kg && (num(o.kg) < 30 || num(o.kg) > 250)) return 'Vazn 30–250 kg oraligʻida boʻlsin.';
    Object.assign(s, { weightGoal: o.weightGoal ? num(o.weightGoal) : null, water: num(o.water) || 8, protein: num(o.protein), workoutDays: arr(o.wdays).map(Number) });
    const plan = D('fitness').plan = D('fitness').plan || {}; s.workoutDays.forEach(d => { if (!plan[d]) plan[d] = 'Mashq'; }); save('fitness');
    if (o.kg && !allM('body').some(b => b.date === today())) upsertM('body', { id: uid(), date: today(), kg: num(o.kg) });
  }
  if (step === 6) { s.prayers = !!o.prayers; s.quranPages = num(o.quranPages); }
  if (step === 7) { const names = arr(o.h); if (names.length) makeDefaultHabits(names); }
  if (step === 8) {
    const g = D('growth');
    ['short', 'long'].forEach(kind => (o[kind] || '').split('\n').map(x => x.trim()).filter(Boolean).forEach(t => { if (!g.goals.some(x => x.title === t)) g.goals.push({ id: uid(), kind, title: t, area: 'Bilim', ms: [] }); }));
    save('growth');
    if (!D('work').roadmap.length) makeDefaultRoadmap();
    s.onboarded = true; s.startDate = s.startDate || today();
    save('settings'); APP.view = 'home'; render(); toast('Xush kelibsiz, ' + s.name + '!'); return;
  }
  s.obStep = step + 1; save('settings'); render(); window.scrollTo(0, 0);
};
