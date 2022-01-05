const { ipcRenderer, contextBridge } = require('electron')

contextBridge.exposeInMainWorld(
    "api",{
        register : async (...args) => {return await ipcRenderer.invoke("register_license", ...args)}
    }
)