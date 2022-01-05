const electron = require("electron")
const dns = require("dns")

module.exports.app_directory = (electron.app || electron.remote.app).getPath('userData');
module.exports.is_online = function(){
    return new Promise((resolve, error)=>{
        dns.resolve("google.fr", (err, addrs)=>{
            if(err){
                resolve(false)
            }
            resolve(true)
        })
    })
}