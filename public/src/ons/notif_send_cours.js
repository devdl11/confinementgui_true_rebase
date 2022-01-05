const {nonscr} = require("../const")

class notif_send_cours{
    constructor(app){
        this.channel = "notif_send_cours"
        this.module_needed = nonscr
        this.myapp = app
    }

    build(module){
        return (cours, url) => {
            this.myapp.notification_manager.show_cours_notif(cours, url)
        }
    }
}

module.exports.notif_send_cours = notif_send_cours