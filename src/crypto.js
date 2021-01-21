const crypt = require("crypto-js")
const filemanager = require("fs")
const sys = require('util')
const exec = require('child_process').execSync;
const sysinfo = require("systeminformation")

const electron = window.require('electron');
const remote = electron.remote

class AppData {
    constructor(raw) {
        this.username = this.password = this.pearlURL = undefined
        let octet = ""
        let buffer = ""
        let index = 0

        for (let c of raw) {
            octet += c
            if (octet.length === 8 && octet !== "10011101") {
                buffer += String.fromCharCode(parseInt(octet, 2))
                octet = ""
            } else if (octet === "10011101") {
                switch (index) {
                    case 0:
                        this.username = buffer
                        break
                    case 1:
                        this.password = buffer
                        break
                    case 2:
                        this.pearlURL = buffer
                        break
                    default:
                        break
                }
                buffer = ""
                octet = ""
                index += 1
            }
        }
    }

    getRaw() {
        if (typeof (this.username) == "string" && typeof (this.password) == "string" && typeof (this.pearlURL) == "string") {
            let buffer = ""
            for (let i of this.username) {
                if (i === undefined) continue;
                let result = parseInt(i.charCodeAt(0)).toString(2)
                while (result.length < 8) {
                    result = "0" + result
                }
                buffer += result
            }
            buffer += "10011101"
            for (let i of this.password) {
                if (i === undefined) continue;
                let result = parseInt(i.charCodeAt(0)).toString(2)
                while (result.length < 8) {
                    result = "0" + result
                }
                buffer += result
            }
            buffer += "10011101"
            for (let i of this.pearlURL) {
                if (i === undefined) continue;
                let result = parseInt(i.charCodeAt(0)).toString(2)
                while (result.length < 8) {
                    result = "0" + result
                }
                buffer += result
            }
            buffer += "10011101"
            return buffer
        } else {
            return "0"
        }
    }
}

class SelfCrypto {
    static getDirectoryData() {
        return (remote.process.env.APPDATA || (remote.process.platform === 'darwin' ? remote.process.env.HOME + '/Library/Preferences' : remote.process.env.HOME + "/.local/share")) + "/ConfinementGUI"
    }

    static data = undefined

    static getKey(callback) {
        sysinfo.baseboard().then((data) => {
            sysinfo.system().then(dt2 => {
                callback(data.serial + dt2.serial + dt2.uuid)
            })
        })
    }

    static __init__(callback) {
        let directory = this.getDirectoryData()
        if (!filemanager.existsSync(directory)) {
            filemanager.mkdirSync(directory)
        }
        let fpath = directory + "/data.dcrypt"
        if (!filemanager.existsSync(fpath)) {
            let stream = filemanager.createWriteStream(fpath)
            stream.end()
            callback()
        } else {
            let data = filemanager.readFileSync(fpath, "utf8")
            
            if (data.length > 16) {
                this.getKey((key)=>{
                    let decrypted = crypt.AES.decrypt(data,key)
                    if (decrypted.toString(crypt.enc.Utf8).indexOf("10011101")) {
                        SelfCrypto.data = new AppData(decrypted.toString(crypt.enc.Utf8))
                        console.log(SelfCrypto.data)
                    }
                    callback()
                })
            }else{
                callback()
            }
        }

    }


    static saveDate(){
    let directory = this.getDirectoryData()
    let fpath = directory + "/data.dcrypt"
    if (SelfCrypto.data !== undefined) {
        let dat = SelfCrypto.data.getRaw()
        this.getKey((key) => {
            dat = crypt.AES.encrypt(dat, key)
            dat = dat.toString()
            filemanager.writeFileSync(fpath, dat, { encoding: "utf8" })
        })

    }
}
    
    static isFile(){
    return SelfCrypto.data === undefined
}
}

export { SelfCrypto, AppData };