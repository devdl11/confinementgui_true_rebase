const { ipcRenderer, contextBridge } = require('electron')

const channels = [
    "get-license",
    "license_result",
    "firebase_inited",
    "set-used"
]

contextBridge.exposeInMainWorld(
    "api",{
        on : (name, listener) => {
            if(channels.includes(name)){
                ipcRenderer.on(name, (event, ...args) =>{listener(...args)})
            }
        },
        send: (name, ...args) =>{
            if(channels.includes(name)){
                ipcRenderer.send(name, ...args)
            }
        },
        getConfig: async () => {
            return await ipcRenderer.invoke("firebase-get-config")
        }
})