const { ipcRenderer, contextBridge } = require('electron')

contextBridge.exposeInMainWorld(
    "api",{
        getStartMenuType: (...args) => {return ipcRenderer.invoke("getStartMenuType", ...args)},
        runAutoLogin: (...args) => {ipcRenderer.send("runAutoLogin", ...args)},
        getEDData: (...args) => {return ipcRenderer.invoke("ed_getData", ...args)},
        login: async(...args) => {return await ipcRenderer.invoke("ed_login", ...args)},
        getPearltreesURL: async(...args) => {return await ipcRenderer.invoke("ed_getPearltreesURL", ...args)},
        registerLogins: (...args) =>{ipcRenderer.send("registerLogins", ...args)}
    }
)