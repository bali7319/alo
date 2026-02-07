const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

const agent = require('./syncAgent.cjs');

let logFilePath = null;

function getLogFilePath() {
  if (logFilePath) return logFilePath;
  const dir = app.getPath('userData');
  logFilePath = path.join(dir, 'alo17-sync-agent.log');
  return logFilePath;
}

function log(...args) {
  try {
    const line = `[${new Date().toISOString()}] ${args.map((a) => String(a)).join(' ')}\n`;
    const p = getLogFilePath();
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.appendFileSync(p, line);
  } catch {
    // ignore
  }
}

function createMainWindow() {
  const win = new BrowserWindow({
    width: 980,
    height: 720,
    minWidth: 860,
    minHeight: 620,
    backgroundColor: '#0b1220',
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  const showTimer = setTimeout(() => {
    if (!win.isVisible()) win.show();
  }, 1500);

  win.once('ready-to-show', () => {
    clearTimeout(showTimer);
    win.show();
  });

  win.webContents.on('did-fail-load', (_e, code, desc, url) => {
    log('did-fail-load', code, desc, url);
    dialog.showErrorBox('Alo17 Sync Agent', `Sayfa yüklenemedi.\n\n${desc} (${code})\n${url}`);
  });

  const indexPath = path.join(__dirname, '..', 'renderer', 'index.html');
  log('loadFile', indexPath);
  win.loadFile(indexPath);
}

app.whenReady().then(() => {
  try {
    app.setAppUserModelId('tr.alo17.syncagent');
  } catch {}

  log('app ready', `electron=${process.versions.electron}`, `chrome=${process.versions.chrome}`, `node=${process.versions.node}`);
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('agent:getConfig', async (_evt, args) => {
  const { panelUrl, token, provider } = args || {};
  log('getConfig', panelUrl, provider);
  return await agent.getConfig({ panelUrl, token, provider, log });
});

ipcMain.handle('agent:syncNow', async (_evt, args) => {
  const { panelUrl, token, provider } = args || {};
  log('syncNow', panelUrl, provider);
  return await agent.syncNow({ panelUrl, token, provider, log });
});

ipcMain.handle('agent:getLogPath', async () => {
  return getLogFilePath();
});

process.on('uncaughtException', (err) => {
  log('uncaughtException', err && err.stack ? err.stack : String(err));
});

process.on('unhandledRejection', (reason) => {
  log('unhandledRejection', reason && reason.stack ? reason.stack : String(reason));
});

