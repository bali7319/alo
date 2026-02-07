const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAgent', {
  version: '0.1.0',
  getConfig: (args) => ipcRenderer.invoke('agent:getConfig', args),
  syncNow: (args) => ipcRenderer.invoke('agent:syncNow', args),
  getLogPath: () => ipcRenderer.invoke('agent:getLogPath'),
});

