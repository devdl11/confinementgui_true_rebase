const { login } = require("../ed-api")

class login_handler{
    constructor(props){
        this.callback = props.callback
    }

    build(){
        return async (user, pass) => {
            return new Promise((resolve, reject)=>{
                login(user, pass, (data)=>{
                    if(data === undefined){
                        resolve(false)
                    }else{
                        this.callback(data)
                        resolve(true)
                    }
                })
            })
        }
    }
}

module.exports.login_handler = login_handler