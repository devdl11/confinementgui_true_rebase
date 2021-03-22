const { ipcRenderer, contextBridge } = require('electron')

const available_channels = [
    "take-currentcours",
    "take-edfiles",
    "take-homeworks",
    "take-matieres",
    "run-download",
    "stop-download",
    "force-stop-download",
    "get-edfiles",
    "get-homeworks",
    "get-matieres",
    "get-currentcours",
    "update-cours",
    "run-remote-download"
]

contextBridge.exposeInMainWorld(
    "api",{
        getStartMenuType: async (...args) => {return await ipcRenderer.invoke("getStartMenuType", ...args)},
        runAutoLogin: async (...args) => {return await ipcRenderer.invoke("runAutoLogin", ...args)},
        getEDData: async (...args) => {return await ipcRenderer.invoke("ed_getData", ...args)},
        login: async(...args) => {return await ipcRenderer.invoke("ed_login", ...args)},
        getPearltreesURL: async(...args) => {return await ipcRenderer.invoke("ed_getPearltreesURL", ...args)},
        registerLogins: (...args) =>{ipcRenderer.send("registerLogins", ...args)},
        error_login_dialog: (...args) => {ipcRenderer.send("notif_send_error_login_dialog", ...args)},
        save_login_dialog: (...args) => {ipcRenderer.send("notif_send_save_login", ...args)},
        open_file: (...args) => {ipcRenderer.send("auto_file_open", ...args)},
        open_url: (...args) => {ipcRenderer.send("open_external_url", ...args)},
        is_file: async (...args) => {return await ipcRenderer.invoke("is_file", ...args)},
        delete_file: (...args) => {ipcRenderer.send("delete_file", ...args)}
    }
)

contextBridge.exposeInMainWorld(
    "ipcrend",{
        send: (channel, ...args)=>{
            if(available_channels.includes(channel)){
                ipcRenderer.send(channel, ...args)
            }
        },
        on: (channel, callback)=>{
            if(available_channels.includes(channel)){
                ipcRenderer.on(channel, callback)
            }
        },
        removeAllListeners : (channel)=>{
            if(available_channels.includes(channel)){
                ipcRenderer.removeAllListeners(channel)
            }
        }
    }
)