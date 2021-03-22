const crypto = require("crypto")
const {Storage} = require("../storage")

function generate_random_id(){
    return crypto.randomBytes(16).toString("hex")
}

class remote_storage_manager{
    constructor(app){
        this.local_storage = {}
        this.opened_storage = {}
        this.myapp = app
    }

    new_storage(configname, defaults){
        if(Object.keys(this.opened_storage).includes(configname)){
            return this.opened_storage[configname]
        }
        let id = generate_random_id()
        let storage = new Storage({configName: configname, defaults:defaults, app:this.myapp})
        this.local_storage[id] = storage
        this.opened_storage[configname] = id
        return id
    }

    remote_get(id, key){
        if(Object.keys(this.local_storage).includes(id)){
            return this.local_storage[id].get(key)
        }
        return null
    }

    remote_set(id, key, value){
        if(Object.keys(this.local_storage).includes(id)){
            this.local_storage[id].set(key, value)
        }
    }

    close_storage(id){
        if(Object.keys(this.local_storage).includes(id)){
            delete this.local_storage[id]
        } 
    }
}


module.exports.remote_storage_manager = remote_storage_manager