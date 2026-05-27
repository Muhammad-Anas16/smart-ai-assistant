// import { contextBridge, ipcRenderer } from 'electron'
// import { electronAPI } from '@electron-toolkit/preload'

// // Custom APIs for renderer
// // const api = {}
// const api = {
//   startRecording: () => ipcRenderer.send('start-recording'),
//   stopRecording: () => ipcRenderer.send('stop-recording')
// }

// contextBridge.exposeInMainWorld('api', api)

// // Use `contextBridge` APIs to expose Electron APIs to
// // renderer only if context isolation is enabled, otherwise
// // just add to the DOM global.
// if (process.contextIsolated) {
//   try {
//     contextBridge.exposeInMainWorld('electron', electronAPI)
//     contextBridge.exposeInMainWorld('api', api)
//   } catch (error) {
//     console.error(error)
//   }
// } else {
//   window.electron = electronAPI
//   window.api = api
// }

import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  startRecording: () => ipcRenderer.send('start-recording'),
  stopRecording: () => ipcRenderer.send('stop-recording'),

  // ✅ NEW FIX: live status listener
  onStatus: (callback) => {
    ipcRenderer.on('status', (_, data) => callback(data))
  },

  // ✅ NEW FIX: transcript listener
  onTranscript: (callback) => {
    ipcRenderer.on('transcript', (_, data) => callback(data))
  }
}

// 👉 IMPORTANT: expose BEFORE fallback (prevents undefined issue)
contextBridge.exposeInMainWorld('api', api)

// Use `contextBridge` APIs to expose Electron APIs
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
