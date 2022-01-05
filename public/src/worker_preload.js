const { ipcRenderer, contextBridge } = require('electron')

contextBridge.exposeInMainWorld(
    "api",{
        read_file: async (name) => {return await ipcRenderer.invoke("read_file", name)},
        write_file: (name, content) => {ipcRenderer.send("write_file", {name: name, content: content})},
        open_file: async (path) => {return await ipcRenderer.invoke("open_file", path)},
        create_file: async (name, folder) => {return await ipcRenderer.invoke("create_file", {name: name, folder: folder})},
        open_storage: async (name, def) => {return await ipcRenderer.invoke("storage_remote_open", name, def)},
        storage_get: async (id, key) => {return await ipcRenderer.invoke("storage_remote_get", id, key)},
        storage_set: (id, key, value) =>{ipcRenderer.send("storage_remote_set", id, key, value)},
        close_storage: (id) =>{ipcRenderer.send("storage_remote_close", id)}
    }
)

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
]

contextBridge.exposeInMainWorld(
    "ed",{
        login: async(...args) => {return await ipcRenderer.invoke("ed_login", ...args)},
        getPearltreesURL: async(...args) => {return await ipcRenderer.invoke("ed_getPearltreesURL", ...args)},
        downloadHomeworkFile: async (...args) => {return await ipcRenderer.invoke("ed_downloadHomeworkFile", ...args)},
        getEDT: async (...args) => {return await ipcRenderer.invoke("ed_getEDT", ...args)},
        getHomeWorkByDate: async (...args) => {return await ipcRenderer.invoke("ed_getHomeWorkByDate", ...args)},
        getHomework: async (...args) => {return await ipcRenderer.invoke("ed_gethomework", ...args)},
        addHomework: async (...args) => {return await ipcRenderer.invoke("ed_addhomework", ...args)},
        getFile: async (...args) => {return await ipcRenderer.invoke("ed_getfile", ...args)},
        addFile: async (...args) => {return await ipcRenderer.invoke("ed_addfile", ...args)},
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
        }
    }
)

contextBridge.exposeInMainWorld(
    "internal",{
        send_cours: (cours, url) => {ipcRenderer.send("notif_send_cours", cours, url)}
    }
)