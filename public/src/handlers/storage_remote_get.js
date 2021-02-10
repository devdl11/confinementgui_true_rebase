const {nonscr} = require("../const")

class storage_remote_get{
    constructor(app){
        this.channel = "storage_remote_get"
        this.module_needed = nonscr
        this.app = app
    }

    build(module){
        return (id, key) => {
            return this.app.remote_storage_manager.remote_get(id, key)
        }
    }
}

module.exports.storage_remote_get = storage_remote_get