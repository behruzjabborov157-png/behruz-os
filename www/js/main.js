'use strict';
/* BEHRUZ OS — ishga tushirish */

(async function boot() {
  const h = (location.hash || '').slice(1);
  if (VIEWS[h]) APP.view = h;
  render();
  await Store.init();
  render();
  let lastDay = today();
  // yarim tundan keyin sahifa ochiq qolsa, “bugun” yangilansin
  setInterval(() => { if (today() !== lastDay) { lastDay = today(); if (!MODAL) render(); } }, 60000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && today() !== lastDay) { lastDay = today(); if (!MODAL) render(); } });
  window.addEventListener('hashchange', () => { const v = (location.hash || '').slice(1); if (VIEWS[v] && v !== APP.view) { APP.view = v; render(); } });
})();
