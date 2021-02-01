const { x64 } = require('crypto-js');
const filemanager = require("fs")
const electron = require('electron');
const remote = electron.remote
const {dialog} = remote

const urllib = require("urllib")

const API_URL = "https://api.ecoledirecte.com/v3/"
const ED_URL = {
    login: {
        url:"login.awp",
        method: "post"
    },
    homework: {
        url:"Eleves/:eleveid:/cahierdetexte/:date:.awp?verbe=get&",
        method: "post"
    },
    downloadFile : {
        url : "telechargement.awp?verbe=get&",
        method: "post"
    }
}

class ED_Instance{
    constructor(data, usern, pass){
        this.token = data.token
        this.username = usern
        this.password = pass
        this.user_data = data.data.accounts[0]
        this.raw_data = data
    }

    getPearltreesURL(){
        for(let module of this.user_data.modules){
            if (module.code === "PEARLTREES"){
                return module.params.urlPearlTrees
            }
        }
        return undefined
    }

    async downloadHomeworkFile(filedata, callback){
        let directoryData = (electron.app || electron.remote.app).getPath("userData") + "/EDFiles"
        // console.log("Requested!")
        if(!filemanager.existsSync(directoryData)){
            filemanager.mkdirSync(directoryData)
        }
        let file_path = directoryData + "/" + encodeURI(filedata["nom"])
        if(!filemanager.existsSync(file_path)){
            let data = "leTypeDeFichier=" + filedata["type"].toString() + "&fichierId=" + filedata["id"] + "&token=" + this.token + "&anneeMessages="
            urllib.request(API_URL + ED_URL.downloadFile.url, {
                method: ED_URL.downloadFile.method,
                content: data,
                headers:{
                    "content-type":"application/x-www-form-urlencoded"
                }
            }, (err, data, res)=>{
                if(res.statusCode === 200){
                    filemanager.writeFileSync(file_path, data)
                }
                callback(res.statusCode)
                
            })
        }else{
            callback(200)
        }
    }

    async getHomeWorkByDate(date, callback){
        let day = date.getDate()
        day = day < 10 ? "0" + day.toString() : day.toString()
        let month = date.getMonth() + 1
        month = month < 10 ? "0" + month.toString() : month.toString()
        let year = date.getFullYear()
        let str_date = String(year) + "-" + String(month) + "-" + String(day)
        console.log(API_URL + ED_URL.homework.url.replace(":eleveid:", this.user_data["id"]).replace(":date:", str_date))
        // console.log("data={\"token\":\"" + this.token+"\"}")
        await urllib.request(API_URL + ED_URL.homework.url.replace(":eleveid:", this.user_data["id"]).replace(":date:", str_date),{
            method: ED_URL.homework.method,
            content:"data={\"token\":\"" + this.token+"\"}",
            headers:{
                "content-type":"application/x-www-form-urlencoded"
            },
            dataType:"json"
        }, (err, data, res)=>{
            // console.log(data)
            if(err || data.code === 525){
                login(this.username, this.password, (result)=>{
                    if(typeof result === undefined){
                        remote.app.quit()
                    }else{
                        this.user_data = result.user_data
                        this.token = result.token
                        this.getHomeWorkByDate(date, callback)
                    }
                })
            }else{
                callback(data.data)
            }
        })
    }
}

async function login(username, password, callback){
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
            callback(new ED_Instance(data, username, password))
        }
    })
}

module.exports = {ED_Instance, login}