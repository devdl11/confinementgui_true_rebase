const electron = require("electron");
const { get } = require("systeminformation");
const Storage = require("../src/Storage");
const {ED_Instance} = window.require("../src/ed-api")
const crypto = require("crypto-js")
const ipcrend = electron.ipcRenderer
const {dialog} = electron.remote

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }   

let run = false
let available_files = []

let data = new Storage({
    configName: "ed_data",
    defaults:{
        fichiers:[],
        devoirs:{},
        last_update:0,
        lastday: 1
    }
})



async function download(arg){
    let ed = new ED_Instance(arg.edinstance.raw_data, arg.edinstance.username, arg.edinstance.password)
    let tmpf = data.get("fichiers")
    if(tmpf.length > 0){
        for (let doc of tmpf){
            ed.downloadHomeworkFile(doc, (result)=>{
                if (result === 200){
                    available_files.push(doc)
                }
            })
        }
    }

    while(run){
        let havtostop = false
        if(data.get("last_update") + 60*60*6<= Math.round(new Date().getTime()/1000)){
            let today = new Date()
            today = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4*7)
            let rentree_year = today.getMonth() + 1 < 9 ? today.getFullYear() - 1 : today.getFullYear() 
            let day = data.get("lastday")
            if (day + 7 > 8){
                day -= 7
            }
            let school_ren = new Date(rentree_year, 8, day)
            // console.log(school_ren)
            while(run && (today.getDate() !== school_ren.getDate() || today.getMonth() !== school_ren.getMonth() || today.getFullYear() !== school_ren.getFullYear()) ){
                school_ren = new Date(rentree_year, 8, day)

                // console.log("run")
                if (school_ren.getDay() === 0 || school_ren.getDate() === 6){
                    day += 1
                    continue
                }
                await ed.getHomeWorkByDate(school_ren, (data_recv)=>{
                    let tempdate = new Date(data_recv.date)
                    // console.log(tempdate)
                    let day = tempdate.getDate()
                    day = day < 10 ? "0" + day.toString() : day.toString()
                    let month = tempdate.getMonth() + 1
                    month = month < 10 ? "0" + month.toString() : month.toString()
                    let year = tempdate.getFullYear()
                    let str_date = year + "-" + month + "-" + day
                    
                    let oldData = {}
                    if(typeof data.get("devoirs") !== "undefined"){
                        oldData = data.get("devoirs")
                    }
                    let keys = Object.keys(oldData)
                    if(!keys.includes(str_date)){
                        oldData[str_date] = {}
                    }

                    let matieres = data_recv.matieres
                    if(matieres.length > 0){
                        for(let mat of matieres){
                            let finalData = {
                                prof: mat["nomProf"],
                                hasEval: mat["interrogation"]
                            }
                            let allKeys = Object.keys(mat)
                            if (allKeys.includes("aFaire")){
                                let afaire = mat["aFaire"]
                                finalData["contenuDevoir"] = atob(afaire["contenu"])
                                // console.log(finalData)
                                if(afaire["ressourceDocuments"].length === 0){
                                    finalData["documents"] = []
                                }else{
                                    let docs = afaire["ressourceDocuments"]
                                    let fdocs = []
                                    for (let doc of docs){
                                        let docdata = {
                                            id:doc["id"],
                                            nom: doc["libelle"],
                                            type: doc["type"],
                                            matiere: mat["matiere"],
                                            date: str_date
                                        }
                                        fdocs.push(docdata)
                                    }
                                    finalData["documents"] = fdocs
                                }
                                if(afaire["documents"].length > 0){
                                    let fdocs = finalData["documents"]
                                    for (let doc of afaire["documents"]){
                                        let docdata = {
                                            id:doc["id"],
                                            nom: doc["libelle"],
                                            type: doc["type"],
                                            matiere: mat["matiere"],
                                            date: str_date
                                        }
                                        fdocs.push(docdata)
                                    }
                                    finalData["documents"] = fdocs
                                }

                            }else{
                                finalData["documents"] = []
                                finalData["contenuDevoir"] = ""
                            }

                            if(allKeys.includes("contenuDeSeance")){
                                let contenueDS = mat["contenuDeSeance"]
                                let finalSeance = {}
                                if (contenueDS["contenu"] === ""){
                                    finalSeance["contenu"] = ""
                                }else{
                                    finalSeance["contenu"] = atob(contenueDS["contenu"])
                                }
                                if(contenueDS["documents"] === 0){
                                    finalSeance["documents"] = []
                                }else{
                                    let fdocs = []
                                    for(let doc of contenueDS["documents"]){
                                        let docdata = {
                                            id:doc["id"],
                                            nom: doc["libelle"],
                                            type: doc["type"],
                                            matiere: mat["matiere"],
                                            date: str_date
                                        }
                                        fdocs.push(docdata)
                                    }
                                    finalSeance["documents"] = fdocs
                                }
                                finalData["contenuDS"] = finalSeance
                            }else{
                                finalData["contenuDS"] = {}
                            }
                            let alldataDate = {}
                            if(typeof data.get("devoirs") !== "undefined"){
                                alldataDate = data.get("devoirs")
                            }
                            let keys = Object.keys(alldataDate)
                            if(!keys.includes(str_date)){
                                alldataDate[str_date] = {}
                            }
                            alldataDate[str_date][mat["matiere"]] = finalData
                            data.set("devoirs", alldataDate)
                            let allfiles = finalData["documents"]
                            if(Object.keys(finalData["contenuDS"]).length > 0 && finalData["contenuDS"]["documents"].length > 0){
                                for(let file of finalData["contenuDS"]["documents"]){
                                    allfiles.push(file)
                                }
                            }
                            let ids = allfiles.map(o => o.id)
                            allfiles = allfiles.filter(({id}, index) => !ids.includes(id, index + 1))

                            let allDocuments = data.get("fichiers")
                            if(typeof allDocuments === "undefined"){
                                allDocuments = []
                            }
                            allDocuments = [...allDocuments, ...allfiles]
                            ids = allDocuments.map(o => o.id)
                            allDocuments = allDocuments.filter(({id}, index) => !ids.includes(id, index + 1))
                            data.set("fichiers", allDocuments)

                            for(let doc of allfiles){
                                ed.downloadHomeworkFile(doc, (result)=>{
                                    if (result === 200){
                                        available_files.push(doc)
                                    }
                                })
                            }
                            if(allfiles.length > 0){
                                ipcrend.send("take-edfiles", available_files)
                            }
                        }
                    
                        let alldataDate = {}
                        if(typeof data.get("devoirs") !== "undefined"){
                            alldataDate = data.get("devoirs")
                        }
                        let keys = Object.keys(alldataDate)
                        if(!keys.includes(str_date)){
                            alldataDate[str_date] = {}
                        }
                        if (alldataDate[str_date] !== oldData[str_date]){
                            ipcrend.send("take-homeworks", alldataDate)
                        }
                    }


                })

                day += 1
                if(havtostop){
                    break
                }
            }
            data.set("lastday", day)
        }
        await sleep(1000*60*30)
    }
}

ipcrend.on("run-download", (event, arg)=>{
    if(!run){
        run = true
        download(arg)
    }
})

ipcrend.on("stop-download", (event, arg)=>{
    if(run){
        run=false
    }
})
ipcrend.on("force-stop-download", (event, arg)=>{
    if(run){
        run=false
    }
})

ipcrend.on("get-edfiles", (event, args)=>{
    // console.log(available_files)
    ipcrend.send("take-edfiles", available_files)
})

ipcrend.on("get-homeworks", (event, args)=>{
    let dat = {}
    if(typeof data.get("devoirs") !== "undefined"){
        dat = data.get("devoirs")
    }
    ipcrend.send("take-homeworks", dat)
})