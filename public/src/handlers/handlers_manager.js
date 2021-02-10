const {getStartMenuType} = require("./getStartMenuType")
const electron = require("electron")
const {ipcMain} = require("electron")
const {mainwin, worker, nonscr} = require("../const")
const { storage_remote_get } = require("./storage_remote_get")
const { storage_remote_open } = require("./storage_remote_open")


class IPC_handler_manager{
    constructor(mainview, worker, myapp){
        this.mainview = mainview
        this.worker = worker
        this.myapp = myapp

        //init modules
        this.getStartMenuType = new getStartMenuType(this.myapp)
        this.storage_remote_get = new storage_remote_get(this.myapp)
        this.storage_remote_open = new storage_remote_open(this.myapp)
    }

    getModule(mod){
        switch(mod){
            case mainwin:
                return this.mainview
            case worker:
                return this.worker
            case nonscr:
                return null
            default:
                return null
        }
    }

    initialize(){
        ipcMain.handle(this.getStartMenuType.channel, (...args) => {return this.getStartMenuType.build(this.getModule(this.getStartMenuType.module_needed))(...args)})
        ipcMain.handle(this.storage_remote_get.channel, (...args) => {return this.storage_remote_get.build(this.getModule(this.storage_remote_get.module_needed))(...args)})
        ipcMain.handle(this.storage_remote_open.channel, (...args) => {return this.storage_remote_open.build(this.getModule(this.storage_remote_open.module_needed))(...args)})
    }
}

module.exports.IPC_handler_manager = IPC_handler_manager