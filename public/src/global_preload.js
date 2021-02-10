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