const {nonscr} = require("../const")
const { SelfCrypto } = require("../crypto")

class getStartMenuType{
    constructor(app){
        this.channel = "getStartMenuType"
        this.module_needed = nonscr
    }

    build(module){
        return (...args) => {
            if(SelfCrypto.data === undefined){
                return false
            }else{
                return true
            }
        }
    }
}

module.exports.getStartMenuType = getStartMenuType