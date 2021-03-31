const sqlite = require("sqlite3")
const fs = require("fs")
const { app_directory } = require("../storage/static_vars")
const { join } = require("path")
const electron = require("electron")

class ED_BDD {
    constructor() {
        this.BDD_FILE = join(app_directory, "ED_DATA.bdd")
        this.is_file = fs.existsSync(this.BDD_FILE)

        this.homeworks_fields = {
            prof : "prof",
            matiere : "matiere",
            date: "date",
            iscontrol : "iscontrol",
            docsraw : "docsraw",
            contenu : "contenu",
            cseance : "cseance",
            docsseance : "docsseance",
            raw : "raw",
        }

        this.files_fields = {
            matiere : "matiere",
            libelle : "libelle",
            fileid : "fileid",
            type : "type",
            date: "date"
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
            this.bdd.run("CREATE TABLE devoirs (\n" +
                "ID         INTEGER PRIMARY KEY ON CONFLICT REPLACE AUTOINCREMENT\n" +
                "                   UNIQUE\n" +
                "                   NOT NULL,\n" +
                "matiere    VARCHAR," +
                "prof       VARCHAR," +
                "date       VARCHAR," +
                "iscontrol  INTEGER," +
                "docsraw    TEXT," +
                "contenu    TEXT," +
                "cseance    TEXT," +
                "docsseance TEXT," +
                "raw        TEXT" +
                ");", (err) => {
                    if (err) {
                        console.log("ERROR 1!!!!")
                    } else {
                        resolve(null)
                    }
                })
        })

        await new Promise((resolve, reject) => {
            this.bdd.run(`CREATE TABLE fichiers (
                ID      INTEGER PRIMARY KEY
                                UNIQUE
                                NOT NULL,
                matiere VARCHAR,
                libelle VARCHAR,
                fileid  VARCHAR,
                type    VARCHAR,
                date    VARCHAR
            );`, (err)=>{
                if(err){
                    console.log("ERROR 2")
                }else{
                    resolve(null)
                }
            })
        })
    }

    get_homework_by(args){
        let commande = "SELECT * FROM devoirs WHERE "
        for(let key of Object.keys(args)){
            if (Object.keys(this.homeworks_fields).includes(key)){
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
            commande = "SELECT * FROM devoirs"
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

    register_homework(args){
        if(JSON.stringify(Object.keys(args).sort()) !== JSON.stringify(Object.keys(this.homeworks_fields).sort())){
            return new Promise((resolve)=>{resolve(null)})
        }
        let commande = "INSERT INTO devoirs (prof, matiere, date, iscontrol, docsraw, contenu, cseance, docsseance, raw) values (?,?,?,?,?,?,?,?,?)"
        return new Promise((resolve) => {
            (async()=>{
                let result = await this.get_homework_by(args)
                if(result.length === 0){
                    resolve(this.bdd.run(commande, [args.prof, args.matiere, args.date, args.iscontrol, args.docsraw, args.contenu, args.cseance, args.docsseance, args.raw]))
                }else{
                    resolve(null)
                }
            })()
        })
    }

    get_files_by(args){
        let commande = "SELECT * FROM fichiers WHERE "
        for(let key of Object.keys(args)){
            if (Object.keys(this.files_fields).includes(key)){
                if (typeof args[key] == "string"){
                    commande += key + "=\"" + args[key].replace("\"","\\\"") + "\" and "
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
            commande = "SELECT * FROM fichiers"
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

    register_files(args){
        if(JSON.stringify(Object.keys(args).sort()) !== JSON.stringify(Object.keys(this.files_fields).sort())){
            return new Promise((resolve)=>{resolve(null)})
        }
        let commande = "INSERT INTO fichiers (matiere, libelle, fileid, type, date) values (?,?,?,?, ?)"
        return new Promise((resolve)=>{
            (async()=>{
                let result = await this.get_files_by(args)
                if(result.length === 0){
                    resolve(this.bdd.run(commande, [args.matiere, args.libelle, args.fileid, args.type, args.date]))
                }else{
                    resolve(null)
                }
            })()
        })
    }
}

module.exports.ED_BDD = ED_BDD