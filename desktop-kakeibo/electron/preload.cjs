const { contextBridge } = require('electron');

// Minimal API surface; extend if you need native integrations later.
contextBridge.exposeInMainWorld('desktop', {
  version: '1.0.0',
});

