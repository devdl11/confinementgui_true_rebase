const {is_online} = require("./storage/static_vars")
const {ipcMain} = require("electron")

const VERSION = "0.5"
const VKEY = "39d3e9dc-af7b-4df4-a88d-11b7d2e081cb"

class internal_manager{
    constructor(){
        (async ()=>{
            this.can_start = await is_online()
        })()
        this.has_update = false
        this.firebase = null
    }

    register_firebase(fire){
        this.firebase = fire
    }

    start_verif() {
        if(this.firebase === null || !this.can_start){
            this.can_start = true
            return new Promise((resolve)=>{resolve(null)})
        }
        let me = this
        function post_process(result){
            if(me.can_start){
                me.can_start = result.version === VERSION && VKEY === result.vkey && result.online
            }
            me.has_update = !(result.version === VERSION && VKEY === result.vkey)
        }
        return new Promise((resolve)=>{
            ipcMain.once("on-status", function (event, result) {
                post_process(result)
                resolve(0)
            })

            this.firebase.send("get-status",{})
        })
    }
}

module.exports.internal_manager = internal_manager;