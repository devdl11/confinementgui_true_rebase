const { ipcRenderer } = require("electron")
const {nonscr} = require("../const")
const { SelfCrypto , AppData} = require("../crypto")

class registerLogins{
    constructor(app){
        this.channel = "registerLogins"
        this.module_needed = nonscr
    }

    build(module){
        return (username, password, pearltrees) => {
            let dat = new AppData("00")
            dat.password = password
            dat.username = username
            dat.pearlURL = pearltrees
            SelfCrypto.data = dat
            SelfCrypto.saveDate()
        }
    }
}

module.exports.registerLogins = registerLogins