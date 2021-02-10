const { login } = require("../ed-api")

class login_handler{
    constructor(props){
        this.callback = props.callback
    }

    build(){
        return async (user, pass, callback) => {
            await login(user, pass, (data)=>{
                if(data === undefined){
                    callback(false)
                }else{
                    this.callback(data)
                    callback(true)
                }
            })
        }
    }
}

module.exports.login_handler = login_handler