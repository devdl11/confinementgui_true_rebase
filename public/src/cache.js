const sqlite = require("sqlite3")
const fs = require("fs")
const { app_directory } = require("../storage/static_vars")
const { join } = require("path")
const electron = require("electron")

class Cache {
    constructor() {
        this.BDD_FILE = join(app_directory, "CACHE")
        this.is_file = fs.existsSync(this.BDD_FILE)

        this.cache_fields = {
            path:"path",
            value:"value",
            at:"at"
        }

        if (!this.is_file) {
            this.create_bdd()
        }else{
            this.open()
        }
    }

    async open(){
        await new Promise((resolve, reject) => {
            this.bdd = new sqlite.Database(this.BDD_FILE, (err) => {
                if (err) {
                    electron.app.exit()
                } else {
                    resolve(null)
                }
            })
        })
    }

    async create_bdd() {
        await new Promise((resolve, reject) => {
            fs.writeFileSync(this.BDD_FILE, "", { flag: "w", encoding: "utf8" })
            this.bdd = new sqlite.Database(this.BDD_FILE, (err) => {
                if (err) {
                    electron.app.exit()
                } else {
                    resolve(null)
                }
            })
        })
        await new Promise((resolve, reject) => {
            this.bdd.run(`CREATE TABLE cache (
                id    INTEGER PRIMARY KEY
                              UNIQUE
                              NOT NULL,
                path  VARCHAR,
                value TEXT,
                at    VARCHAR
            );`, (err) => {
                    if (err) {
                        console.log("ERROR 1!!!!")
                    } else {
                        resolve(null)
                    }
                })
        })

    }

    get_cache_by(args){
        let commande = "SELECT * FROM cache WHERE "
        for(let key of Object.keys(args)){
            if (Object.keys(this.cache_fields).includes(key)){
                if (typeof args[key] == "string"){
                    commande += key + "='" + args[key] + "' and "
                }else if(typeof args[key] == "boolean"){
                    commande += key + "= " + (args[key] ? "1" : "0") + " and "
                }else{
                    commande += key + "= " + args[key] + " and "
                }
            }
        }
        if (commande.substr(commande.length-"and ".length) === "and "){
            commande = commande.substr(0, commande.length- "and ".length)
        }
        if (Object.keys(args).length === 0){
            commande = "SELECT * FROM cache"
        }
        // console.log("DEV BDD: ", commande)
        return new Promise((resolve, reject) => {
            this.bdd.all(commande, (err, results)=>{
                if (err){
                    console.log(err)
                    resolve(null)
                }else{
                    resolve(results)
                }
            })
        })
    }

    register_cache(args){
        if(JSON.stringify(Object.keys(args).sort()) !== JSON.stringify(Object.keys(this.cache).sort())){
            return new Promise((resolve)=>{resolve(null)})
        }
        let commande = "INSERT INTO cache (path, value, at) values (?,?,?)"
        return new Promise((resolve) => {
            (async()=>{
                let result = await this.get_cache_by(args)
                if(result.length === 0){
                    resolve(this.bdd.run(commande, [args.path, args.value, args.at]))
                }else{
                    resolve(null)
                }
            })()
        })
    }


    remove_cache(args){
        
    }
}

module.exports.Cache = Cache