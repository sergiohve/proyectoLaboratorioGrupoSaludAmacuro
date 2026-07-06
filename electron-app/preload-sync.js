'use strict';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('syncAPI', {
  submit: (url) => ipcRenderer.send('sync-submit', url),
  skip:   ()    => ipcRenderer.send('sync-skip'),
});
