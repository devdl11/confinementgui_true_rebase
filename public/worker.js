const shell = window.internal.shell()
const ipcrend = window.internal.ipcrend()


let myED = window.internal.isolated_ed_api()

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }   

let run = false
let available_files = []
let current_cours = ""
let lastWarned = ""

let data = window.api.open_storage("ed_data",{
        fichiers:[],
        devoirs:{},
        last_update:0,
        lastday: 1
    })

let planning_data = window.api.open_storage("planning",{
        days: {},
        matieres: []
    }
)

let edt_data = window.api.open_storage("edt",{
        matieres: []
    }
)
// let data = new Storage({
//     configName: "ed_data",
//     defaults:{
//         fichiers:[],
//         devoirs:{},
//         last_update:0,
//         lastday: 1
//     }
// })

// let planning_data = new Storage({
//     configName: "planning",
//     defaults:{
//         days: {},
//         matieres: []
//     }
// })

// let edt_data = new Storage({
//     configName: "edt",
//     defaults:{
//         matieres: []
//     }
// })

async function getPlanning(){
    const ed = myED
    let tmpmat = window.api.storage_get(planning_data, "matieres")
    if(typeof tmpmat === "undefined"){
        tmpmat = []
    }
    let finalMatiere = []
    let matnames = []
    let matnames_pushed = []
    let currentMat = {}
    for(let mat of tmpmat){
        console.log(mat)
        matnames.push(mat["nom"] + mat["prof"])
        currentMat[mat["nom"] + mat["prof"]] = mat
    }
    console.log(tmpmat)
    console.log(matnames)
    console.log(currentMat)

    await ed.getEDT((data)=>{
        // console.log(data)
        window.api.storage_set(edt_data, "matieres", data)
        let matieres = {}
        for(let mati of data){
            let date = mati["start_date"].split(" ")[0]
            if(!Object.keys(matieres).includes(date)){
                matieres[date] = []
            }
            matieres[date].push(mati)
        }
        let finalData = {}
        for(let key of Object.keys(matieres)){
            let splitted = key.split("-")
            let date = new Date(splitted[0], splitted[1]-1, splitted[2])
            let day = date.getDay()
            finalData[day] = []
            for(let mat of matieres[key]){
                let heure_dbt = mat["start_date"].split(" ")[1]
                let heure_fin = mat["end_date"].split(" ")[1]
                let matiere = {
                    nom: mat["matiere"],
                    prof: mat["prof"],
                    url: null,
                    rappel:true
                }
                if(!matnames_pushed.includes(matiere.nom + matiere.prof)){
                    if(!matnames.includes(matiere.nom + matiere.prof)){
                        finalMatiere.push({
                            nom: matiere.nom,
                            prof: matiere.prof,
                            url: null,
                            rappel: true
                        })
                    }else{
                        finalMatiere.push(currentMat[matiere.nom+matiere.prof])
                    }
                    matnames_pushed.push(matiere.nom + matiere.prof)
                }
                
                finalData[day].push({
                        nom: matiere.nom,
                        prof: matiere.prof,
                        debut: heure_dbt,
                        fin: heure_fin
                })
            }
            if(finalData[day].length === 1){
                delete finalData[day]
            }
        }
        // let ids = finalMatiere.map(o => o.id)
        // finalMatiere = finalMatiere.filter(({id}, index) => !ids.includes(id, index + 1))

        window.api.storage_set(planning_data, "days", finalData)
        window.api.storage_set(planning_data, "matieres", finalMatiere)
    })
    
}

async function internPlanningManager(){
    let today = new Date()
    let planningDays = window.api.storage_get(planning_data, "days")
    let matieres = window.api.storage_get(planning_data, "matieres")

    let allAvailableDays = Object.keys(planningDays)
    if(!allAvailableDays.includes(String(today.getDay()))){
        if("" === current_cours){
            current_cours = ""
            ipcrend.send("take-currentcours", current_cours)
        }
        return
    }
    let td_mat = planningDays[today.getDay()]
    let minutes = today.getMinutes()
    // minutes = minutes < 10 ? "0" + String(minutes) : String(minutes)
    let current_time = today.getHours()*60 + minutes
    console.log(current_time)
    for(let mat of td_mat){
        let dbtTime = parseInt(mat["debut"].split(":")[0])*60 + parseInt(mat["debut"].split(":")[1])
        let finTime = parseInt(mat["fin"].split(":")[0])*60 + parseInt(mat["fin"].split(":")[1])
        // console.log(dbtTime)
        // console.log(finTime)
        console.log(dbtTime-40)
        console.log((dbtTime - 40) <= current_time && current_time <= dbtTime)
        if(dbtTime <= current_time && current_time <= finTime){
            if(current_cours !== mat["nom"]){
                current_cours = mat["nom"]
                ipcrend.send("take-currentcours", current_cours)
            }
        }
        if(dbtTime - 120 <= current_time && current_time <= dbtTime + 40 && lastWarned !== mat["nom"]){
            console.log("Alert?")
            lastWarned = mat["nom"]
            console.log(lastWarned)
            for(let tmp of matieres){
                if(tmp["nom"] === mat["nom"]){
                    if(tmp["rappel"]){
                        console.log("NOTIF!")
                        
                        const notif = new Notification({
                            title: "Cours",
                            body:"Le cours " + mat["nom"] + " va bientot commencer!"
                        })
                        notif.onclick = (event) =>{
                            if(tmp["url"] !== null){
                                let url = tmp["url"].includes("http") ? tmp["url"] : "https://" + tmp["url"]
                                shell.openExternal(url)
                            }
                        }
                        // notif.show()
                        
                    }
                    break;
                }
            }
        }
    }
}


async function download(arg){
    const ed = myED
    await getPlanning(ed)

    while(run){
        internPlanningManager()
        
        let tmpf = window.api.storage_get(data, "fichiers")
        if(tmpf.length > 0){
            for (let doc of tmpf){
                ed.downloadHomeworkFile(doc, (result)=>{
                    if (result === 200){
                        available_files.push(doc)
                    }
                })
            }
        }

        let havtostop = false
        if(window.api.storage_get(data, "last_update") + 60*60*6<= Math.round(new Date().getTime()/1000)){
            let today = new Date()
            today = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4*7)
            let rentree_year = today.getMonth() + 1 < 9 ? today.getFullYear() - 1 : today.getFullYear() 
            let day = window.api.storage_get(data, "lastday")
            if (day + 7 > 7*6+1){
                day -= 7 * 6
            }
            let school_ren = new Date(rentree_year, 8, day)
            // console.log(school_ren)
            while(run && (today.getDate() !== school_ren.getDate() || today.getMonth() !== school_ren.getMonth() || today.getFullYear() !== school_ren.getFullYear()) ){
                school_ren = new Date(rentree_year, 8, day)

                // console.log(school_ren)
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
                    if(typeof window.api.storage_get(data, "devoirs") !== "undefined"){
                        oldData = window.api.storage_get(data, "devoirs")
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
                            if(typeof window.api.storage_get(data, "devoirs") !== "undefined"){
                                alldataDate = window.api.storage_get(data, "devoirs")
                            }
                            let keys = Object.keys(alldataDate)
                            if(!keys.includes(str_date)){
                                alldataDate[str_date] = {}
                            }
                            alldataDate[str_date][mat["matiere"]] = finalData
                            window.api.storage_set(data, "devoirs", alldataDate)
                            let allfiles = finalData["documents"]
                            if(Object.keys(finalData["contenuDS"]).length > 0 && finalData["contenuDS"]["documents"].length > 0){
                                for(let file of finalData["contenuDS"]["documents"]){
                                    allfiles.push(file)
                                }
                            }
                            let ids = allfiles.map(o => o.id)
                            allfiles = allfiles.filter(({id}, index) => !ids.includes(id, index + 1))

                            let allDocuments = window.api.storage_get(data, "fichiers")
                            if(typeof allDocuments === "undefined"){
                                allDocuments = []
                            }
                            allDocuments = [...allDocuments, ...allfiles]
                            ids = allDocuments.map(o => o.id)
                            allDocuments = allDocuments.filter(({id}, index) => !ids.includes(id, index + 1))
                            window.api.storage_set(data, "fichiers", allDocuments)

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
                        if(typeof window.api.storage_get(data, "devoirs") !== "undefined"){
                            alldataDate = window.api.storage_get(data, "devoirs")
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
            window.api.storage_set(data, "lastday", day)
        }
        await sleep(1000*60*2)
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
    if(typeof window.api.storage_get(data, "devoirs") !== "undefined"){
        dat = window.api.storage_get(data, "devoirs")
    }
    ipcrend.send("take-homeworks", dat)
})

ipcrend.on("get-matieres", (event, args)=>{
    ipcrend.send("take-matieres", window.api.storage_get(planning_data, "matieres"))
})

ipcrend.on("get-currentcours", (event, args)=>{
    ipcrend.send("take-currentcours", current_cours)
})

ipcrend.on("update-cours", (event, args)=>{
    let allmat = window.api.storage_get(planning_data, "matieres")
    let final = []
    for(let mat of allmat){
        let recv = args[mat["nom"] + mat["prof"]]
        // console.log(recv === mat)
        if(recv["rappel"] !== mat["rappel"] || recv["url"] !== mat["url"]){
            final.push(recv)
        }else{
            final.push(mat)
        }
    }
    
    window.api.storage_set(planning_data, "matieres", final)
})