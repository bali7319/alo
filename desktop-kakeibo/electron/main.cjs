const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

let logFilePath = null;

function getLogFilePath() {
  if (logFilePath) return logFilePath;
  const dir = app.getPath('userData');
  logFilePath = path.join(dir, 'kakeibo.log');
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
  const iconPath = path.join(__dirname, '..', 'build', 'icon.ico');
  const windowIcon = fs.existsSync(iconPath) ? iconPath : undefined;

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: '#0b1220',
    show: false,
    ...(windowIcon ? { icon: windowIcon } : {}),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      // Some Windows setups have issues with sandbox in packaged apps.
      sandbox: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  const showTimer = setTimeout(() => {
    if (!win.isVisible()) {
      log('ready-to-show timeout; forcing show()');
      win.show();
    }
  }, 2500);

  win.once('ready-to-show', () => {
    clearTimeout(showTimer);
    win.show();
  });

  win.webContents.on('did-fail-load', (_e, code, desc, url) => {
    log('did-fail-load', code, desc, url);
    dialog.showErrorBox('Kakeibo Offline', `Sayfa yüklenemedi.\n\n${desc} (${code})\n${url}`);
  });

  win.webContents.on('render-process-gone', (_e, details) => {
    log('render-process-gone', JSON.stringify(details));
    dialog.showErrorBox('Kakeibo Offline', `Uygulama beklenmedik şekilde kapandı.\n\nDetay: ${details.reason}`);
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    log('dev mode url', devServerUrl);
    win.loadURL(devServerUrl);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    log('prod mode loadFile', indexPath);
    win.loadFile(indexPath);
  }
}

app.whenReady().then(() => {
  try {
    app.setAppUserModelId('tr.alo17.kakeibo.offline');
  } catch {}

  log('app ready', `electron=${process.versions.electron}`, `chrome=${process.versions.chrome}`);
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  // On macOS keep app open until Cmd+Q; Windows/Linux quit.
  if (process.platform !== 'darwin') app.quit();
});

process.on('uncaughtException', (err) => {
  log('uncaughtException', err && err.stack ? err.stack : String(err));
});

process.on('unhandledRejection', (reason) => {
  log('unhandledRejection', reason && reason.stack ? reason.stack : String(reason));
});

