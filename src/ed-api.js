const electron = require('electron');
const remote = electron.remote
const {dialog} = remote

const urllib = require("urllib")

const API_URL = "https://api.ecoledirecte.com/v3/"
const ED_URL = {
    login: {
        url:"login.awp",
        method: "post"
    }
}

export class ED_Instance{
    constructor(data){
        this.token = data.token
        this.user_data = data.data.accounts[0]
    }

    getPearltreesURL(){
        for(let module of this.user_data.modules){
            if (module.code === "PEARLTREES"){
                return module.params.urlPearlTrees
            }
        }
        return undefined
    }
}

export async function login(username, password, callback){
    await urllib.request(API_URL + ED_URL.login.url, {
        method:ED_URL.login.method,
        content:"data={\"identifiant\":\""+username+"\",\"motdepasse\":\""+password+"\"}",
        headers:{
            "content-type":"application/x-www-form-urlencoded"
        },
        dataType: "json"
    }, (err, data, res)=>{
        if(err|| data.code === 505){
            dialog.showMessageBoxSync({
                type:"warning",
                buttons:["Ok"],
                defaultId:0,
                title:"Erreur",
                message:data.message,
                noLink:true
            })
            callback(undefined)
        }else{
            callback(new ED_Instance(data))
        }
    })
}