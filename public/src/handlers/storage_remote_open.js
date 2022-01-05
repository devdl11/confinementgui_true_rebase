const {nonscr} = require("../const")

class storage_remote_open{
    constructor(app){
        this.channel = "storage_remote_open"
        this.module_needed = nonscr
        this.app = app
    }

    build(module){
        return (configname, defaults) => {
            return this.app.remote_storage_manager.new_storage(configname, defaults)
        }
    }
}

module.exports.storage_remote_open = storage_remote_open