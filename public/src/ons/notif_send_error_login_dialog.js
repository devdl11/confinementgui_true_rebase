const {nonscr} = require("../const")

class notif_send_error_login_dialog{
    constructor(app){
        this.channel = "notif_send_error_login_dialog"
        this.module_needed = nonscr
        this.myapp = app
    }

    build(module){
        return () => {
            this.myapp.notification_manager.show_dialog_error_log()
        }
    }
}

module.exports.notif_send_error_login_dialog = notif_send_error_login_dialog