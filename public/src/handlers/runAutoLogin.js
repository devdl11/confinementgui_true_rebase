const { ipcRenderer } = require("electron")
const {nonscr} = require("../const")
const { SelfCrypto } = require("../crypto")

class runAutoLogin{
    constructor(app){
        this.channel = "runAutoLogin"
        this.module_needed = nonscr
        this.myapp = app
    }

    build(module){
        return async () => {
            if(SelfCrypto.data === undefined){
                return false;
            }else{
                return await this.myapp.ed_events_manager.login_handler.build(null)(SelfCrypto.data.username, SelfCrypto.data.password)
                // return await ipcRenderer.invoke("ed_login", )
            }
        }
    }
}

module.exports.runAutoLogin = runAutoLogin