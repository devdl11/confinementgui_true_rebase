const {nonscr} = require("../const")

class storage_remote_close{
    constructor(app){
        this.channel = "storage_remote_close"
        this.module_needed = nonscr
        this.app = app
    }

    build(module){
        return (id) => {
            this.app.remote_storage_manager.close_storage(id)
        }
    }
}

module.exports.storage_remote_close = storage_remote_close