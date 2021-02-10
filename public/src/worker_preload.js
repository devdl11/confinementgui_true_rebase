const { ipcRenderer, contextBridge } = require('electron')
const {Storage} = require("./storage")
const {isolated_ed_api} = require("./edapi/render_side")
const electron = require("electron");

const shell = electron.shell
const ipcrend = electron.ipcRenderer
require("./global_preload")

contextBridge.exposeInMainWorld(
    "ed",{
        login: async(...args) => {return await ipcRenderer.invoke("ed_login", ...args)},
        getPearltreesURL: async(...args) => {return await ipcRenderer.invoke("ed_getPearltreesURL", ...args)},
        downloadHomeworkFile: (...args) => {ipcRenderer.send("ed_downloadHomeworkFile", ...args)},
        getEDT: (...args) => {ipcRenderer.send("ed_getEDT", ...args)},
        getHomeWorkByDate: (...args) => {ipcRenderer.send("ed_getHomeWorkByDate", ...args)},
    }
)

contextBridge.exposeInMainWorld(
    "internal",{
        isolated_ed_api: () => {return new isolated_ed_api()},
        shell: () => {return shell},
        ipcrend: () => {return ipcrend}
    }
)