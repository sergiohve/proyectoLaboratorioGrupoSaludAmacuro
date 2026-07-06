'use strict';

const { app, BrowserWindow, dialog, Tray, Menu, nativeImage, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const net  = require('net');
const fs   = require('fs');
const os   = require('os');

// ── Ports ──────────────────────────────────────────────────────────────────
const BACKEND_PORT = 4000;
const MONGO_PORT   = 27017;

// ── Persistent data directory (survives reinstall) ─────────────────────────
const APP_DATA_DIR = path.join(process.env.APPDATA || path.join(os.homedir(), '.config'), 'SistemaLaboratorio');
const MONGO_DB_DIR = path.join(APP_DATA_DIR, 'db');
const MONGO_LOG    = path.join(APP_DATA_DIR, 'mongod.log');
const CONFIG_FILE  = path.join(APP_DATA_DIR, 'config.json');

// ── State ──────────────────────────────────────────────────────────────────
let mainWindow = null;
let tray       = null;
let mongodProc = null;
let isQuitting = false;

// ── Path helpers ───────────────────────────────────────────────────────────
function appPath(...parts) { return path.join(__dirname, ...parts); }
function mongoExe() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'mongodb', 'mongod.exe')
    : path.join(__dirname, 'mongodb-bin', 'mongod.exe');
}

// ── Config ─────────────────────────────────────────────────────────────────
function readConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch {}
  return {};
}
function writeConfig(data) {
  try {
    fs.mkdirSync(APP_DATA_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
  } catch (e) { console.error('[Config] Error:', e.message); }
}

// ── Helpers ────────────────────────────────────────────────────────────────
function waitForPort(port, retries = 40, intervalMs = 1000, crashCheck = null) {
  return new Promise((resolve, reject) => {
    let n = 0;
    const try_ = () => {
      if (crashCheck) { const err = crashCheck(); if (err) { reject(err); return; } }
      const sock = new net.Socket();
      sock.setTimeout(1500);
      sock.on('connect', () => { sock.destroy(); resolve(); });
      const fail = () => {
        sock.destroy();
        if (crashCheck) { const err = crashCheck(); if (err) { reject(err); return; } }
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

// ── Splash helper ──────────────────────────────────────────────────────────
function setSplashStatus(splash, msg) {
  if (!splash || splash.isDestroyed()) return;
  splash.webContents.executeJavaScript(
    `(function(){ var el=document.getElementById('status'); if(el) el.textContent=${JSON.stringify(msg)}; })()`
  ).catch(() => {});
}

// ── Remote sync helpers ────────────────────────────────────────────────────
function fetchJSON(url, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? require('https') : require('http');
    const req = mod.get(url, { timeout: timeoutMs }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} desde ${url}`));
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('Respuesta no es JSON válido')); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout conectando a ${url}`)); });
  });
}

async function upsertMany(Model, docs) {
  if (!docs || docs.length === 0) return 0;
  const ops = docs.map(doc => ({
    updateOne: {
      filter: { _id: doc._id },
      update: { $set: doc },
      upsert: true,
    }
  }));
  await Model.bulkWrite(ops, { ordered: false });
  return ops.length;
}

async function syncFromRemote(remoteUrl, onProgress) {
  const base = remoteUrl.replace(/\/+$/, '').replace(/\/api\/?$/, '') + '/api';

  const Cliente      = require(appPath('backend', 'models', 'Cliente'));
  const TipoExamen   = require(appPath('backend', 'models', 'TipoExamen'));
  const PrecioExamen = require(appPath('backend', 'models', 'PrecioExamen'));
  const Examen       = require(appPath('backend', 'models', 'Examen'));

  const results = { clientes: 0, tiposExamen: 0, precios: 0, examenes: 0, errores: [] };

  const trySync = async (label, urlPath, Model) => {
    onProgress(`Importando ${label}...`);
    try {
      const raw  = await fetchJSON(`${base}${urlPath}`);
      const docs = Array.isArray(raw) ? raw : (raw.data || []);
      const n    = await upsertMany(Model, docs);
      console.log(`[Sync] ${label}: ${n} documentos`);
      return n;
    } catch (e) {
      console.error(`[Sync] ${label} error:`, e.message);
      results.errores.push(`${label}: ${e.message}`);
      return 0;
    }
  };

  // Order matters: clientes before examenes (FK ref)
  // Use all=true to bypass pagination on remote backend
  results.clientes    = await trySync('pacientes',         '/clientes?all=true',           Cliente);
  results.tiposExamen = await trySync('plantillas',        '/tipos-examen',                TipoExamen);
  results.precios     = await trySync('precios exámenes',  '/precios-examenes',            PrecioExamen);
  results.examenes    = await trySync('exámenes',          '/examenes?all=true',           Examen);

  return results;
}

// ── Sync prompt window ─────────────────────────────────────────────────────
function showSyncPrompt() {
  return new Promise((resolve) => {
    let resolved = false;
    const finish = (url) => {
      if (resolved) return;
      resolved = true;
      ipcMain.removeAllListeners('sync-submit');
      ipcMain.removeAllListeners('sync-skip');
      resolve(url || null);
    };

    const win = new BrowserWindow({
      width: 480, height: 350,
      frame: true, alwaysOnTop: true,
      resizable: false,
      title: 'Configurar servidor remoto',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload-sync.js'),
      },
    });

    win.setMenuBarVisibility(false);
    win.loadFile(path.join(__dirname, 'sync-prompt.html'));

    ipcMain.once('sync-submit', (_, url) => { win.destroy(); finish(url && url.trim() ? url.trim() : null); });
    ipcMain.once('sync-skip',   ()       => { win.destroy(); finish(null); });
    win.on('closed', () => finish(null));
  });
}

// ── Check and run sync on first launch ─────────────────────────────────────
async function checkAndSync(splash) {
  const config = readConfig();

  // Skip if sync was already completed
  if (config.syncDone) return;

  // Check if local DB has any patients
  const Cliente  = require(appPath('backend', 'models', 'Cliente'));
  const localCount = await Cliente.countDocuments().catch(() => 0);

  if (localCount > 0) {
    // DB already has data — mark sync done so we don't ask again
    writeConfig({ ...config, syncDone: true });
    return;
  }

  // First launch with empty DB — hide splash so dialog is visible
  splash.setAlwaysOnTop(false);
  splash.hide();

  const choice = dialog.showMessageBoxSync(null, {
    type: 'question',
    title: 'Importar datos del servidor',
    message: 'Base de datos local vacía',
    detail:
      '¿Desea importar los datos desde el servidor remoto?\n\n' +
      'Esto copiará pacientes, exámenes y precios a esta computadora.\n' +
      'Necesita conexión a internet para continuar.',
    buttons: ['Sí, importar datos', 'No, empezar vacío'],
    defaultId: 0,
    cancelId: 1,
  });

  splash.show();
  splash.setAlwaysOnTop(true);

  if (choice !== 0) {
    writeConfig({ ...config, syncDone: true });
    return;
  }

  const remoteUrl = config.remoteApiUrl || 'https://backinvent.onrender.com';

  // Save URL for next time
  writeConfig({ ...config, remoteApiUrl: remoteUrl });

  // Run sync
  try {
    setSplashStatus(splash, 'Conectando con servidor remoto...');
    const results = await syncFromRemote(remoteUrl, (msg) => setSplashStatus(splash, msg));

    const total = results.clientes + results.examenes;
    writeConfig({
      ...readConfig(),
      syncDone: true,
      lastSync: new Date().toISOString(),
    });

    const msg = results.errores.length > 0
      ? `Importado con advertencias: ${results.clientes} pacientes, ${results.examenes} exámenes`
      : `Listo: ${results.clientes} pacientes, ${results.examenes} exámenes, ${results.precios} precios`;

    setSplashStatus(splash, msg);
    await new Promise(r => setTimeout(r, 2500));

  } catch (err) {
    console.error('[Sync] Error inesperado:', err);
    setSplashStatus(splash, 'No se pudo sincronizar — continuando sin importar');
    writeConfig({ ...readConfig(), syncDone: true });
    await new Promise(r => setTimeout(r, 2000));
  }
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

  const alreadyUp = !(await isPortFree(MONGO_PORT));
  if (alreadyUp) { console.log('[MongoDB] ya está en ejecución, reutilizando.'); return; }

  mongodProc = spawn(exe, [
    '--dbpath',   MONGO_DB_DIR,
    '--port',     String(MONGO_PORT),
    '--logpath',  MONGO_LOG,
    '--logappend',
    '--bind_ip',  '127.0.0.1',
    '--noauth',
  ], { detached: false, windowsHide: true });

  let mongodCrashErr = null;
  mongodProc.on('error', e => {
    mongodCrashErr = new Error(`mongod.exe no pudo iniciarse: ${e.message}\nRuta: ${exe}`);
  });
  mongodProc.on('exit', code => {
    if (!isQuitting && code !== 0 && code !== null) {
      let logTail = '';
      try { logTail = fs.readFileSync(MONGO_LOG, 'utf8').split('\n').slice(-8).join('\n'); } catch {}
      mongodCrashErr = new Error(
        `mongod.exe terminó con código ${code}.\n\n` +
        `Causa más probable: falta Visual C++ Redistributable 2019.\n` +
        `Descárgalo en: https://aka.ms/vs/17/release/vc_redist.x64.exe\n\n` +
        (logTail ? `Últimas líneas del log:\n${logTail}` : `Ver log: ${MONGO_LOG}`)
      );
    }
  });

  await waitForPort(MONGO_PORT, 40, 1000, () => mongodCrashErr);
  console.log('[MongoDB] listo en puerto', MONGO_PORT);
}

// ── Express backend ────────────────────────────────────────────────────────
async function startBackend() {
  const alreadyUp = !(await isPortFree(BACKEND_PORT));
  if (alreadyUp) { console.log('[Backend] ya está en ejecución en puerto', BACKEND_PORT, '— reutilizando.'); return; }

  process.env.MONGODB_URI = `mongodb://127.0.0.1:${MONGO_PORT}/laboratorio`;
  process.env.PORT        = String(BACKEND_PORT);
  process.env.NODE_ENV    = 'production';

  const express    = require('express');
  const mongoose   = require('mongoose');
  const expressApp = require(appPath('backend', 'app.js'));
  require(appPath('backend', 'database.js'));

  // Serve Next.js static export so Electron can load http://localhost:4000/
  const frontendDir = app.isPackaged
    ? path.join(process.resourcesPath, 'app', 'frontend')
    : path.join(__dirname, 'frontend');

  // Next.js RSC: client requests /route/index.txt but static export generates /route.txt at root
  expressApp.use((req, res, next) => {
    const p = req.path;
    if (p.endsWith('/index.txt')) {
      const route = p.slice(1, -10); // strip leading / and trailing /index.txt
      if (route) {
        const rscFile = path.join(frontendDir, route + '.txt');
        if (fs.existsSync(rscFile)) {
          return res.type('text/plain').sendFile(rscFile);
        }
      }
    }
    next();
  });

  expressApp.use(express.static(frontendDir));
  // SPA fallback only for HTML routes (not for data files)
  expressApp.use((req, res, next) => {
    if (!path.extname(req.path)) {
      res.sendFile(path.join(frontendDir, 'index.html'));
    } else {
      next();
    }
  });

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
      webSecurity: false,
      preload: path.join(__dirname, 'preload-main.js'),
    },
    title: 'Sistema de Laboratorio',
  });

  mainWindow.loadURL(`http://localhost:${BACKEND_PORT}/`);
  mainWindow.setMenuBarVisibility(false);
  mainWindow.webContents.setZoomFactor(0.85);

  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.on('close', e => {
    if (!isQuitting) { e.preventDefault(); mainWindow.hide(); }
  });
}

function setupTray() {
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

// Pre-launch MongoDB before Electron finishes initializing (saves 2-3s on splash)
const mongoReadyPromise = startMongoDB().catch(e => e);

// ── App lifecycle ──────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  const splash = createSplash();
  try {
    const mongoResult = await mongoReadyPromise;
    if (mongoResult instanceof Error) throw mongoResult;
    await startBackend();
    await checkAndSync(splash);
    createMainWindow();
    setupTray();
    splash.close();
  } catch (err) {
    if (splash && !splash.isDestroyed()) {
      splash.setAlwaysOnTop(false);
      splash.close();
    }
    dialog.showErrorBox('Error al iniciar Sistema de Laboratorio', String(err.message || err));
    isQuitting = true;
    app.quit();
  }
});

app.on('before-quit', () => { isQuitting = true; });
app.on('will-quit',   () => { if (mongodProc) mongodProc.kill('SIGTERM'); });
app.on('window-all-closed', () => { /* stay in tray */ });
