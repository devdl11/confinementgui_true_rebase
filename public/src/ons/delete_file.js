const {nonscr} = require("../const")
const {dialog, shell} = require("electron")
const filemanager = require("fs")

class delete_file{
    constructor(app){
        this.channel = "delete_file"
        this.module_needed = nonscr
        this.myapp = app
    }

    build(module){
        return (name) => {
            if(this.myapp.isFile(name) && this.myapp.get_file_path(name)){
                filemanager.unlinkSync(this.myapp.get_file_path(name))
            }
        }
    }
}

module.exports.delete_file = delete_file