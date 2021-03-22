const {nonscr} = require("../const")

class register_license{
    constructor(app){
        this.channel = "register_license"
        this.module_needed = nonscr
        this.myapp = app
    }

    build(module){
        return async (prenom, nom) => {
            if(!this.myapp.waiting_registration){
                return await this.myapp.license.register(prenom, nom)
            }
        }
    }
}

module.exports.register_license = register_license