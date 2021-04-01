const notif = require("node-notifier")
const WindownsBalon = require("node-notifier").WindowsBalloon
const {dialog} = require("electron")
const { Notification } = require("electron");
const {open_external_url} = require("./ons/open_external_url")

class notification_manager {
    constructor(app) {
        this.myapp = app
    }

    show_cours_notif(cours, url) {
        // if (process.platform === "win32") {
        //     new WindownsBalon().notify({
        //         title: "Cours",
        //         message: "Le cours " + cours + " va bientot commencer ! " + (url !== null ? "Cliquez pour accéder à la classe virtuelle ! " : ""),
        //         wait: true,
        //         type: "warn",
        //         time: 15 * 1000
        //     }, function(error, resp) {
        //         if(resp === "activate" && url !== null){
        //             new open_external_url(null).build(null)(url)
        //         }
        //     })
        // } else {
            
        // }
        let notificat = new Notification({
            title: "Cours",
            body:"Le cours " + cours + " va bientot commencer!" + (url !== null ? "\nCliquez pour accéder à la classe virtuelle ! " : ""),
            urgency: "critical",
            timeoutType: "never"
        })
        
        notificat.addListener("click", function(){
            console.log("CLICKED!")
            if(url !== null){
                console.log("CLICKED!2")
                new open_external_url(null).build(null)(url)
            }
        })

        notificat.once("click", (event, args) =>{
            console.log("CLICKED!")
            if(url !== null){
                console.log("CLICKED!2")
                new open_external_url(null).build(null)(url)
            }
        })
        
        notificat.show()
    }

    show_dialog_error_log(){
        dialog.showMessageBoxSync({
            type:"warning",
            buttons:["Ok"],
            defaultId:0,
            title:"Erreur",
            message:"Veuillez entrer des identifiants valides!",
            noLink:true
        })
    }

    show_error_connection_dialog(){
        dialog.showMessageBoxSync({
            type:"error",
            buttons: ["Okay"],
            defaultId: 0,
            title:"Connexion Internet",
            message: "Erreur: Cette action nécessite une connexion à internet !",
            noLink: true
        })
    }
    
    show_error_credentials_dialog(){
        dialog.showMessageBoxSync({
            type:"error",
            buttons: ["Okay"],
            defaultId: 0,
            title:"License Registration",
            message: "Erreur: Aucune license disponible!",
            noLink: true
        })
    }

    show_app_cant_start(){
        dialog.showMessageBoxSync({
            type:"error",
            buttons: ["Okay"],
            defaultId: 0,
            title:"Application Désactivé",
            message: "Erreur: Cette application n'est plus disponible !\nVeuillez contacter le développeur pour plus d'informations.",
            noLink: true
        })
    }

    show_app_update_available(){
        dialog.showMessageBoxSync({
            type:"error",
            buttons: ["Okay"],
            defaultId: 0,
            title:"Mise à jour",
            message: "Veuillez mettre à jour l'application afin de pouvoir l'utiliser.",
            noLink: true
        })
    }
    
    show_internal_error_dialog(){
        dialog.showMessageBoxSync({
            type:"error",
            buttons: ["Okay"],
            defaultId: 0,
            title:"Application",
            message: "Une erreur interne est survenue!",
            noLink: true
        })
    }

    show_save_login_dialog(username, password){
        let res = dialog.showMessageBoxSync({
            type: "question",
            buttons: ["Non", "Oui"],
            titre: "Identifiants",
            message:"Souhaitez-vous enregistrer vos identifiants et bénéficier de la connexion automatique?",
            defaultId: 1,
            noLink: true
        })
        if(res === 1){
            // console.log(this.myapp)
            let url = this.myapp.getEDinst().getPearltreesURL()
            this.myapp.on_manager.registerLogins.build(null)(username, password, url)
        }
    }
}

module.exports.notification_manager = notification_manager