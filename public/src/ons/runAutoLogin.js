const { ipcRenderer } = require("electron")
const {nonscr} = require("../const")
const { SelfCrypto } = require("../crypto")

class runAutoLogin{
    constructor(app){
        this.channel = "runAutoLogin"
        this.module_needed = nonscr
    }

    build(module){
        return (callback) => {
            if(SelfCrypto.data === undefined){
                callback(false)
            }else{
                ipcRenderer.send("ed_login", SelfCrypto.data.username, SelfCrypto.data.password, callback)
            }
        }
    }
}

module.exports.runAutoLogin = runAutoLogin