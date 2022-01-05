const {nonscr} = require("../const")
const {shell} = require("electron")

class open_external_url{
    constructor(app){
        this.channel = "open_external_url"
        this.module_needed = nonscr
        this.myapp = app
    }

    build(module){
        return (url) => {
            if(url !== ""){
                url = url.includes("http") ? url : "https://" + url
                shell.openExternal(url)
            }
        }
    }
}

module.exports.open_external_url = open_external_url