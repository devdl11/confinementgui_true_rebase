const {nonscr} = require("../const")
const {dialog, shell} = require("electron")

class auto_file_open{
    constructor(app){
        this.channel = "auto_file_open"
        this.module_needed = nonscr
        this.myapp = app
    }

    build(module){
        return (name) => {
            if(this.myapp.isFile(name) && this.myapp.get_file_path(name)){
                shell.openPath(this.myapp.get_file_path(name))
            }else{
                dialog.showErrorBox("Erreur","Fichier indisponible!")
            }
        }
    }
}

module.exports.auto_file_open = auto_file_open