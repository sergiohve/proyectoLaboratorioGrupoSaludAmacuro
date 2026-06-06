'use strict';

const { app, BrowserWindow, dialog, Tray, Menu, nativeImage } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const net = require('net');
const fs = require('fs');
const os = require('os');

// ── Ports ──────────────────────────────────────────────────────────────────
const BACKEND_PORT = 4000;
const MONGO_PORT   = 27017;

// ── Persistent data directory (survives reinstall) ─────────────────────────
const APP_DATA_DIR  = path.join(process.env.APPDATA || path.join(os.homedir(), '.config'), 'SistemaLaboratorio');
const MONGO_DB_DIR  = path.join(APP_DATA_DIR, 'db');
const MONGO_LOG     = path.join(APP_DATA_DIR, 'mongod.log');

// ── State ──────────────────────────────────────────────────────────────────
let mainWindow  = null;
let tray        = null;
let mongodProc  = null;
let isQuitting  = false;

// ── Path helpers ───────────────────────────────────────────────────────────
// With asar:false, __dirname == resources/app/ in packaged mode.
// extraResources (mongod.exe) land in resources/mongodb/.
function appPath(...parts) {
  return path.join(__dirname, ...parts);
}
function mongoExe() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'mongodb', 'mongod.exe')
    : path.join(__dirname, 'mongodb-bin', 'mongod.exe');
}

// ── Helpers ────────────────────────────────────────────────────────────────
function waitForPort(port, retries = 40, intervalMs = 1000) {
  return new Promise((resolve, reject) => {
    let n = 0;
    const try_ = () => {
      const sock = new net.Socket();
      sock.setTimeout(1500);
      sock.on('connect', () => { sock.destroy(); resolve(); });
      const fail = () => {
        sock.destroy();
        if (++n <= retries) setTimeout(try_, intervalMs);
        else reject(new Error(`Puerto ${port} no disponible después de ${retries}s`));
      };
      sock.on('error', fail);
      sock.on('timeout', fail);
      sock.connect(port, '127.0.0.1');
    };
    try_();
  });
}

function isPortFree(port) {
  return new Promise(resolve => {
    const s = net.createServer();
    s.once('error', () => resolve(false));
    s.once('listening', () => { s.close(); resolve(true); });
    s.listen(port, '127.0.0.1');
  });
}

// ── MongoDB ────────────────────────────────────────────────────────────────
async function startMongoDB() {
  fs.mkdirSync(MONGO_DB_DIR, { recursive: true });

  const exe = mongoExe();
  if (!fs.existsSync(exe)) {
    throw new Error(
      `No se encontró mongod.exe\nEsperado en:\n${exe}\n\n` +
      `Ejecute get-mongodb.bat para descargarlo.`
    );
  }

  // Skip if MongoDB is already running on that port
  const alreadyUp = !(await isPortFree(MONGO_PORT));
  if (alreadyUp) {
    console.log('[MongoDB] ya está en ejecución, reutilizando.');
    return;
  }

  mongodProc = spawn(exe, [
    '--dbpath', MONGO_DB_DIR,
    '--port',   String(MONGO_PORT),
    '--logpath', MONGO_LOG,
    '--logappend',
    '--bind_ip', '127.0.0.1',
    '--noauth',
  ], { detached: false, windowsHide: true });

  mongodProc.on('error', e => console.error('[MongoDB] error:', e.message));
  mongodProc.on('exit', code => {
    if (!isQuitting && code !== 0 && code !== null)
      console.error(`[MongoDB] salió con código ${code}. Ver: ${MONGO_LOG}`);
  });

  await waitForPort(MONGO_PORT);
  console.log('[MongoDB] listo en puerto', MONGO_PORT);
}

// ── Express backend (runs in-process using Electron's Node.js) ─────────────
async function startBackend() {
  // Skip if something is already listening on port 4000
  const alreadyUp = !(await isPortFree(BACKEND_PORT));
  if (alreadyUp) {
    console.log('[Backend] ya está en ejecución en puerto', BACKEND_PORT, '— reutilizando.');
    return;
  }

  // Set env vars BEFORE requiring any backend modules
  process.env.MONGODB_URI = `mongodb://127.0.0.1:${MONGO_PORT}/laboratorio`;
  process.env.PORT        = String(BACKEND_PORT);
  process.env.NODE_ENV    = 'production';

  const mongoose   = require('mongoose');
  const expressApp = require(appPath('backend', 'app.js'));
  require(appPath('backend', 'database.js'));   // triggers mongoose.connect()

  await Promise.all([
    new Promise((resolve, reject) => {
      const srv = expressApp.listen(BACKEND_PORT, () => {
        console.log('[Backend] HTTP listo en puerto', BACKEND_PORT);
        resolve();
      });
      srv.on('error', reject);
    }),
    new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('Mongoose no conectó en 30s')), 30000);
      if (mongoose.connection.readyState === 1) { clearTimeout(t); resolve(); return; }
      mongoose.connection.once('connected', () => { clearTimeout(t); resolve(); });
      mongoose.connection.once('error', e  => { clearTimeout(t); reject(e); });
    }),
  ]);
  console.log('[Backend] listo (HTTP + DB)');
}

// ── Electron UI ────────────────────────────────────────────────────────────
function createSplash() {
  const w = new BrowserWindow({
    width: 420, height: 300,
    frame: false, alwaysOnTop: true,
    backgroundColor: '#1565c0',
    webPreferences: { nodeIntegration: false },
  });
  w.loadFile(path.join(__dirname, 'splash.html'));
  return w;
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, height: 800,
    minWidth: 960, minHeight: 640,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,        // permite fetch a localhost desde file://
    },
    title: 'Sistema de Laboratorio',
  });

  mainWindow.loadFile(appPath('frontend', 'index.html'));
  mainWindow.setMenuBarVisibility(false);
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('close', e => {
    if (!isQuitting) { e.preventDefault(); mainWindow.hide(); }
  });
}

function setupTray() {
  // Try to load custom icon, fall back to blank
  const iconFile = path.join(__dirname, 'assets', 'icon.ico');
  const icon = fs.existsSync(iconFile)
    ? nativeImage.createFromPath(iconFile)
    : nativeImage.createEmpty();

  tray = new Tray(icon);
  tray.setToolTip('Sistema de Laboratorio');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Abrir',  click: () => mainWindow && mainWindow.show() },
    { type: 'separator' },
    { label: 'Salir',  click: () => { isQuitting = true; app.quit(); } },
  ]));
  tray.on('double-click', () => mainWindow && mainWindow.show());
}

// ── App lifecycle ──────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  const splash = createSplash();
  try {
    await startMongoDB();
    await startBackend();
    createMainWindow();
    setupTray();
    splash.close();
  } catch (err) {
    splash.close();
    dialog.showErrorBox('Error al iniciar Sistema de Laboratorio', String(err.message || err));
    isQuitting = true;
    app.quit();
  }
});

app.on('before-quit', () => { isQuitting = true; });

app.on('will-quit', () => {
  if (mongodProc) mongodProc.kill('SIGTERM');
});

// Keep running in tray when all windows are closed
app.on('window-all-closed', () => { /* intentional: stay in tray */ });
