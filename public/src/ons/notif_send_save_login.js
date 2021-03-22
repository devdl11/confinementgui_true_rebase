const {nonscr} = require("../const")

class notif_send_save_login{
    constructor(app){
        this.channel = "notif_send_save_login"
        this.module_needed = nonscr
        this.myapp = app
    }

    build(module){
        return (usern, pass) => {
            this.myapp.notification_manager.show_save_login_dialog(usern, pass)
        }
    }
}

module.exports.notif_send_save_login = notif_send_save_login