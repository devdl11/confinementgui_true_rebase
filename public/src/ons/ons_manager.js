const { runAutoLogin } = require("./runAutoLogin")

const electron = require("electron")
const {ipcMain} = require("electron")
const {mainwin, worker, nonscr} = require("../const")
const { registerLogins } = require("./registerLogins")
const { storage_remote_set } = require("./storage_remote_set")
const { storage_remote_close } = require("./storage_remote_close")


class IPC_on_manager{
    constructor(mainview, worker, myapp){
        this.mainview = mainview
        this.worker = worker
        this.myapp = myapp

        //init modules
        this.runAutoLogin = new runAutoLogin(this.myapp)
        this.registerLogins = new registerLogins(this.myapp)
        this.storage_remote_set = new storage_remote_set(this.myapp)
        this.storage_remote_close = new storage_remote_close(this.myapp)
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
        ipcMain.on(this.runAutoLogin.channel, (...args)=>{this.runAutoLogin.build(this.getModule(this.runAutoLogin.module_needed))(...args)})
        ipcMain.on(this.registerLogins.channel, (...args)=>{this.registerLogins.build(this.getModule(this.registerLogins.module_needed))(...args)})
        ipcMain.on(this.storage_remote_set.channel, (...args)=>{this.storage_remote_set.build(this.getModule(this.storage_remote_set.module_needed))(...args)})
        ipcMain.on(this.storage_remote_close.channel, (...args)=>{this.storage_remote_close.build(this.getModule(this.storage_remote_close.module_needed))(...args)})
    }
    
}

module.exports.IPC_on_manager = IPC_on_manager