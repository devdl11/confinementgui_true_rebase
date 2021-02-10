const {nonscr} = require("../const")

class storage_remote_set{
    constructor(app){
        this.channel = "storage_remote_set"
        this.module_needed = nonscr
        this.app = app
    }

    build(module){
        return (id, key, value) => {
            this.app.remote_storage_manager.remote_set(id, key, value)
        }
    }
}

module.exports.storage_remote_set = storage_remote_set