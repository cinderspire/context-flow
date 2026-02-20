const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  snap: () => ipcRenderer.invoke('snap-context'),
  restore: (id) => ipcRenderer.invoke('restore-context', id)
})
