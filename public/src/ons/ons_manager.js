const electron = require("electron")
const {ipcMain} = require("electron")
const {mainwin, worker, nonscr} = require("../const")
const { registerLogins } = require("./registerLogins")
const { storage_remote_set } = require("./storage_remote_set")
const { storage_remote_close } = require("./storage_remote_close")
const { notif_send_cours } = require("./notif_send_cours")
const { notif_send_error_login_dialog } = require("./notif_send_error_login_dialog")
const { notif_send_save_login } = require("./notif_send_save_login")
const { auto_file_open } = require("./auto_file_open")
const { open_external_url } = require("./open_external_url")
const { delete_file } = require("./delete_file")


class IPC_on_manager{
    constructor(mainview, worker, myapp){
        this.mainview = mainview
        this.worker = worker
        this.myapp = myapp
        //init modules
        this.registerLogins = new registerLogins(this.myapp)
        this.storage_remote_set = new storage_remote_set(this.myapp)
        this.storage_remote_close = new storage_remote_close(this.myapp)
        this.notif_send_cours = new notif_send_cours(this.myapp)
        this.notif_send_error_login_dialog = new notif_send_error_login_dialog(this.myapp)
        this.notif_send_save_login = new notif_send_save_login(this.myapp)
        this.auto_file_open = new auto_file_open(this.myapp)
        this.open_external_url = new open_external_url(this.myapp)
        this.delete_file = new delete_file(this.myapp)
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
        ipcMain.on(this.registerLogins.channel, (event, ...args)=>{this.registerLogins.build(this.getModule(this.registerLogins.module_needed))(...args)})
        ipcMain.on(this.storage_remote_set.channel, (event, ...args)=>{this.storage_remote_set.build(this.getModule(this.storage_remote_set.module_needed))(...args)})
        ipcMain.on(this.storage_remote_close.channel, (event, ...args)=>{this.storage_remote_close.build(this.getModule(this.storage_remote_close.module_needed))(...args)})
        ipcMain.on(this.notif_send_cours.channel, (event, ...args)=>{this.notif_send_cours.build(this.getModule(this.notif_send_cours.module_needed))(...args)})
        ipcMain.on(this.notif_send_error_login_dialog.channel, (event, ...args)=>{this.notif_send_error_login_dialog.build(this.getModule(this.notif_send_error_login_dialog.module_needed))(...args)})
        ipcMain.on(this.notif_send_save_login.channel, (event, ...args)=>{this.notif_send_save_login.build(this.getModule(this.notif_send_save_login.module_needed))(...args)})
        ipcMain.on(this.auto_file_open.channel, (event, ...args)=>{this.auto_file_open.build(this.getModule(this.auto_file_open.module_needed))(...args)})
        ipcMain.on(this.open_external_url.channel, (event, ...args)=>{this.open_external_url.build(this.getModule(this.open_external_url.module_needed))(...args)})
        ipcMain.on(this.delete_file.channel, (event, ...args)=>{this.delete_file.build(this.getModule(this.delete_file.module_needed))(...args)})
        
    }
    
}

module.exports.IPC_on_manager = IPC_on_manager