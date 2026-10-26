'use strict';
/* BEHRUZ OS — kompyuter ilovasi (Electron). Sahifa www/ papkasidan oflayn ochiladi,
   maʼlumotlar kompyuterning oʻzida (ilova papkasidagi localStorage) saqlanadi. */
const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');

if (!app.requestSingleInstanceLock()) { app.quit(); }

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 380,
    minHeight: 560,
    title: 'BEHRUZ OS',
    backgroundColor: '#f3f4f8',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  });
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, '..', 'www', 'index.html'));
  win.once('ready-to-show', () => win.show());

  // Tashqi havolalar (http/https) oddiy brauzerda ochilsin
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (/^https?:/i.test(url)) { e.preventDefault(); shell.openExternal(url); }
  });

  // F12 / Ctrl+Shift+I — dasturchi oynasi; F5 / Ctrl+R — qayta yuklash; F11 — toʻliq ekran
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    const ctrl = input.control || input.meta;
    if (input.key === 'F12' || (ctrl && input.shift && input.key.toLowerCase() === 'i')) win.webContents.toggleDevTools();
    else if (input.key === 'F5' || (ctrl && input.key.toLowerCase() === 'r')) win.webContents.reload();
    else if (input.key === 'F11') win.setFullScreen(!win.isFullScreen());
  });
}

app.on('second-instance', () => {
  if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
