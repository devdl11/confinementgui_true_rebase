const filemanager = require("fs")
const { app_directory, is_online } = require("./storage/static_vars")
const sysinfo = require("systeminformation")
const crypto = require("crypto")
const { join } = require("path")
const cryptosJS = require("crypto-js")
const { ipcMain } = require("electron")

const file = "license.dlic"

const PUBLIC_KEY = "-----BEGIN PUBLIC KEY-----\n" +
    "MIICHDANBgkqhkiG9w0BAQEFAAOCAgkAMIICBAKCAfsAtj/llQcAzY48zzxdnB3d\n" +
    "rgGynHagDfp9crESSUPDAOP9q2hXxsPRqzIXSPjmVK2HZ18EVM8LJbl+bFFeNJkW\n" +
    "3dCmUPoDlZx1tA654DzWdSIo0t8VSfW/QpJOfYL0sM+o1bCUlsqpJxT2xggD741q\n" +
    "6DQ+k5FSHg+wzjDeHkK4RPV9uFOOJHqxk86IDzr0u9isdh7xcLIYwmQRxoyzjhLw\n" +
    "O+OSl7jqID6h/HCWRE8srm+POKHDgk+3TOGY9wNHQyGLU+JATWA9EflRfEBi4eAl\n" +
    "W4vccln39m7B2b0sBeIrZ46DxzA17BuxOvr3DUebAUaf1ZvRBAWYC4okC4c+3DDt\n" +
    "2y4MW1FUXYheHeAHEqcf02gWQbYU7SSups2TmWyw90K5E32TFqQDxpkzmuDF9LUw\n" +
    "LAFzHlbkHjY7SbgJUbfSsPZlJzLbdZEXD/ZwiN+msL1t6Wb3ti080p2s8uR1aWs0\n" +
    "pu5c+dcx60KWFoShSZA6GW8pJyx6F5HasPAYeoGAELreCWuMlbbxmznip5iUnH4Z\n" +
    "e2aP6xqNWTxHjqUwit9Lb7yk6Ijo4LcIqb+36+ahAI1ONytNxNX5pYMy6fmR7eoM\n" +
    "wuOQR9Cxe1lz/EcIwzBmSjWVWKcEVKjP2KfaaViprSrEbcP3DxMVNEOAbD5kjnzc\n" +
    "10XpCoc4jzNRBCkCAwEAAQ==\n" +
    "-----END PUBLIC KEY-----"

class License {
    constructor(props) {
        this.check_license = this.check_license.bind(this)
        this.register_firebase = this.register_firebase.bind(this)
        this.register = this.register.bind(this)
        this.SendCallback = this.SendCallback.bind(this)
        this.writeLicence = this.writeLicence.bind(this)
        this.start_verif = this.start_verif.bind(this)

        this.firebase = null
        this.listener = props.listener

        this.file_path = app_directory + "/" + file
        this.is_file = filemanager.existsSync(this.file_path) && filemanager.statSync(this.file_path).isFile()
    }

    async start_verif() {
        return new Promise((resolve) => {
            (async () => {
                try{
                    this.has_license = await this.check_license();
                }catch(err){
                    console.error(err)
                }finally{
                    resolve(0)
                }
            })()
        })
    }

    register_firebase(fire) {
        this.firebase = fire
    }

    async check_license() {
        if (!this.is_file) {
            return false
        }
        let content;
        try{    
            content = filemanager.readFileSync(this.file_path, {encoding: 'utf8', flag:"r"})
        }catch(e){
            // console.log(e)
        }
        
        if (content.length < 500) {
            return false
        }

        let system = await sysinfo.system()
        let baseboard = await sysinfo.baseboard()
        let chassis = await sysinfo.chassis()
        let uuids = await sysinfo.uuid()

        let secretKey = uuids.os + baseboard.serial + system.uuid + system.serial + chassis.serial + uuids.hardware
        let lic = cryptosJS.AES.decrypt(content, secretKey).toString(cryptosJS.enc.Utf8)

        if (!lic.includes("$$$")) {
            return false
        }
        let splitted = lic.split("$$$")
        if (!splitted[1].includes("$$")) {
            return false
        }
        let spl = splitted[1].split("$$")
        let nom = spl[0]
        let prenom = spl[1]
        let val = prenom.toLowerCase() + "@isc." + nom.toLowerCase()
        const checker = crypto.createVerify("RSA-SHA256")
        checker.update(val, "ascii")
        const publicK = Buffer.from(PUBLIC_KEY, "ascii")
        const sign = Buffer.from(splitted[0], "hex")
        const res = checker.verify(publicK, sign)
        return res
    }


    SendCallback(args) {
        this.listener(args)
    }

    writeLicence(key, lic, nom, prenom) {
        if (this.is_file) {
            filemanager.unlinkSync(this.file_path)
        }
        lic = lic + "$$$" + nom + "$$" + prenom
        const result = cryptosJS.AES.encrypt(lic, key).toString()
        filemanager.writeFileSync(this.file_path, result, { encoding: "utf8" })
        this.is_file = true
    }

    /**
     * Enregistrement de la license (avec validation)
     * @param {String} prenom 
     * @param {String} nom 
     * @returns {Number}
     */
    async register(prenom, nom) {
        return new Promise((resolve, reject) => {
            (async () => {
                const is_on = await is_online()
                if (!is_on) {
                    this.listener(-1)
                    resolve(-1)
                }

                if (this.firebase === null) {
                    this.listener(-3)
                    resolve(-3)
                }
                const callback = this.SendCallback
                const valid = this.firebase
                const lic = this.writeLicence

                ipcMain.once("license_result", function (event, result) {
                    if (typeof result === "object") {
                        if (result.actif) {
                            callback(-2)
                            resolve(-2)
                            return
                        }
                        let verify = prenom.toLowerCase() + "@isc." + nom.toLowerCase()
                        // console.log(verify)
                        const checker = crypto.createVerify("RSA-SHA256")
                        checker.update(verify, "ascii")
                        const publicK = Buffer.from(PUBLIC_KEY, "ascii")
                        const sign = Buffer.from(result.id, "hex")
                        const res = checker.verify(publicK, sign)
                        if (!res) {
                            callback(-2)
                            resolve(-2)
                            return
                        }
                        valid.send("set-used", prenom, nom, true)

                        sysinfo.system().then(system => {
                            sysinfo.baseboard().then(baseborad => {
                                sysinfo.chassis().then(chassis => {
                                    sysinfo.uuid().then(uuids => {
                                        let secretKey = uuids.os + baseborad.serial + system.uuid + system.serial + chassis.serial + uuids.hardware
                                        lic(secretKey, result.id, nom, prenom)
                                        callback(0)
                                        resolve(0)
                                    })
                                })
                            })
                        })

                    } else {
                        callback(result)
                        resolve(result)
                    }
                })

                this.firebase.send("get-license", prenom, nom)
            })()
        })
    }
}


module.exports.License = License