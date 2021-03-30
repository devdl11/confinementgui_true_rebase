// const shell = window.internal.shell()
const ipcrend = window.ipcrend


let myED = window.ed

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

let run = false
let available_files = []
let current_cours = ""
let lastWarned = ""

let data = {}
let planning_data = {}
let edt_data = {}

async function initer() {
    data = await window.api.open_storage("ed_data", {
        fichiers: [],
        devoirs: {},
        last_update: 0,
        lastday: 1
    })

    planning_data = await window.api.open_storage("planning", {
        days: {},
        matieres: []
    })

    edt_data = await window.api.open_storage("edt", {
        matieres: []
    })
}

initer()

async function getPlanning() {
    const ed = myED
    let tmpmat = await window.api.storage_get(planning_data, "matieres")
    if (typeof tmpmat === "undefined") {
        tmpmat = []
    }
    let finalMatiere = []
    let matnames = []
    let matnames_pushed = []
    let currentMat = {}
    for (let mat of tmpmat) {
        console.log(mat)
        matnames.push(mat["nom"] + mat["prof"])
        currentMat[mat["nom"] + mat["prof"]] = mat
    }
    // console.log(tmpmat)
    // console.log(matnames)
    // console.log(currentMat)

    let data = await ed.getEDT()
    // console.log(data)
    window.api.storage_set(edt_data, "matieres", data)
    let matieres = {}
    for (let mati of data) {
        let date = mati["start_date"].split(" ")[0]
        if (!Object.keys(matieres).includes(date)) {
            matieres[date] = []
        }
        matieres[date].push(mati)
    }
    let finalData = {}
    for (let key of Object.keys(matieres)) {
        let splitted = key.split("-")
        let date = new Date(splitted[0], splitted[1] - 1, splitted[2])
        let day = date.getDay()
        finalData[day] = []
        for (let mat of matieres[key]) {
            let heure_dbt = mat["start_date"].split(" ")[1]
            let heure_fin = mat["end_date"].split(" ")[1]
            let matiere = {
                nom: mat["matiere"],
                prof: mat["prof"],
                url: null,
                rappel: true
            }
            if (!matnames_pushed.includes(matiere.nom + matiere.prof)) {
                if (!matnames.includes(matiere.nom + matiere.prof)) {
                    finalMatiere.push({
                        nom: matiere.nom,
                        prof: matiere.prof,
                        url: null,
                        rappel: true
                    })
                } else {
                    finalMatiere.push(currentMat[matiere.nom + matiere.prof])
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
        if (finalData[day].length === 1) {
            delete finalData[day]
        }
    }
    // let ids = finalMatiere.map(o => o.id)
    // finalMatiere = finalMatiere.filter(({id}, index) => !ids.includes(id, index + 1))

    window.api.storage_set(planning_data, "days", finalData)
    window.api.storage_set(planning_data, "matieres", finalMatiere)


}

async function internPlanningManager() {
    let today = new Date()
    let planningDays = await window.api.storage_get(planning_data, "days")
    let matieres = await window.api.storage_get(planning_data, "matieres")

    let allAvailableDays = Object.keys(planningDays)
    if (!allAvailableDays.includes(String(today.getDay()))) {
        if ("" === current_cours) {
            current_cours = ""
            ipcrend.send("take-currentcours", current_cours)
        }
        return
    }
    let td_mat = planningDays[today.getDay()]
    let minutes = today.getMinutes()
    // minutes = minutes < 10 ? "0" + String(minutes) : String(minutes)
    let current_time = today.getHours() * 60 + minutes
    console.log(current_time)
    for (let mat of td_mat) {
        let dbtTime = parseInt(mat["debut"].split(":")[0]) * 60 + parseInt(mat["debut"].split(":")[1])
        let finTime = parseInt(mat["fin"].split(":")[0]) * 60 + parseInt(mat["fin"].split(":")[1])
        // console.log(dbtTime)
        // console.log(finTime)
        console.log(dbtTime - 40)
        console.log((dbtTime - 40) <= current_time && current_time <= dbtTime)
        if (dbtTime <= current_time && current_time <= finTime) {
            if (current_cours !== mat["nom"]) {
                current_cours = mat["nom"]
                ipcrend.send("take-currentcours", current_cours)
            }
        }
        if (dbtTime - 120 <= current_time && current_time <= dbtTime + 40 && lastWarned !== mat["nom"]) {
            console.log("Alert?")
            lastWarned = mat["nom"]
            console.log(lastWarned)
            for (let tmp of matieres) {
                if (tmp["nom"] === mat["nom"]) {
                    if (tmp["rappel"]) {
                        window.internal.send_cours(mat["nom"], tmp["url"])
                    }
                    break;
                }
            }
        }
    }
}


async function download(arg) {
    const ed = myED
    await getPlanning(ed)
    console.log("HELLO")

    while (run) {
        internPlanningManager()

        let tmpf = await window.api.storage_get(data, "fichiers")
        console.log(await myED.getFile  ({}))
        if (tmpf.length > 0) {
            for (let doc of tmpf) {
                let result = await ed.downloadHomeworkFile(doc) 
                if (result === 200) {
                    available_files.push(doc)
                }
            }
        }

        let havtostop = false
        let lupdate = await window.api.storage_get(data, "last_update")
        if (lupdate + 60 * 60 * 6 <= Math.round(new Date().getTime() / 1000)) {
            let today = new Date()
            today = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4 * 7)
            let rentree_year = today.getMonth() + 1 < 9 ? today.getFullYear() - 1 : today.getFullYear()
            let day = await window.api.storage_get(data, "lastday")
            if (day + 7 > 7 * 6 + 1) {
                day -= 7 * 6
            }else if(day > 8){
                day -= 7
            }
            let school_ren = new Date(rentree_year, 8, day)
            // console.log(school_ren)
            while (run && (today.getDate() !== school_ren.getDate() || today.getMonth() !== school_ren.getMonth() || today.getFullYear() !== school_ren.getFullYear())) {
                
                school_ren = new Date(rentree_year, 8, day)

                console.log(school_ren)
                console.log(school_ren.getDay())
                if (school_ren.getDay() === 0 || school_ren.getDay() === 6) {
                    day += 1
                    console.log("-- SKIPPED --")
                    continue
                }
                // eslint-disable-next-line no-loop-func
                let data_recv = await ed.getHomeWorkByDate(school_ren)
                console.log(data_recv)
                let tempdate = new Date(data_recv.date)
                // console.log(tempdate)
                let day2 = tempdate.getDate()
                day2 = day2 < 10 ? "0" + day2.toString() : day2.toString()
                let month = tempdate.getMonth() + 1
                month = month < 10 ? "0" + month.toString() : month.toString()
                let year = tempdate.getFullYear()
                let str_date = year + "-" + month + "-" + day2

                let oldData = {}
                let tmp = await window.api.storage_get(data, "devoirs")
                if (typeof tmp !== "undefined") {
                    oldData = tmp
                }
                let keys = Object.keys(oldData)
                if (!keys.includes(str_date)) {
                    oldData[str_date] = {}
                }

                let matieres = data_recv.matieres
                if (matieres.length > 0) {
                    for (let mat of matieres) {
                        let finalData = {
                            prof: mat["nomProf"],
                            hasEval: mat["interrogation"]
                        }
                        let allKeys = Object.keys(mat)
                        if (allKeys.includes("aFaire")) {
                            let afaire = mat["aFaire"]
                            finalData["contenuDevoir"] = atob(afaire["contenu"])
                            // console.log(finalData)
                            if (afaire["ressourceDocuments"].length === 0) {
                                finalData["documents"] = []
                            } else {
                                let docs = afaire["ressourceDocuments"]
                                let fdocs = []
                                for (let doc of docs) {
                                    let docdata = {
                                        id: doc["id"],
                                        nom: doc["libelle"],
                                        type: doc["type"],
                                        matiere: mat["matiere"],
                                        date: str_date
                                    }
                                    fdocs.push(docdata)
                                }
                                finalData["documents"] = fdocs
                            }
                            if (afaire["documents"].length > 0) {
                                let fdocs = finalData["documents"]
                                for (let doc of afaire["documents"]) {
                                    let docdata = {
                                        id: doc["id"],
                                        nom: doc["libelle"],
                                        type: doc["type"],
                                        matiere: mat["matiere"],
                                        date: str_date
                                    }
                                    fdocs.push(docdata)
                                }
                                finalData["documents"] = fdocs
                            }

                        } else {
                            finalData["documents"] = []
                            finalData["contenuDevoir"] = ""
                        }

                        if (allKeys.includes("contenuDeSeance")) {
                            let contenueDS = mat["contenuDeSeance"]
                            let finalSeance = {}
                            if (contenueDS["contenu"] === "") {
                                finalSeance["contenu"] = ""
                            } else {
                                finalSeance["contenu"] = atob(contenueDS["contenu"])
                            }
                            if (contenueDS["documents"] === 0) {
                                finalSeance["documents"] = []
                            } else {
                                let fdocs = []
                                for (let doc of contenueDS["documents"]) {
                                    let docdata = {
                                        id: doc["id"],
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
                        } else {
                            finalData["contenuDS"] = {}
                        }
                        let alldataDate = {}
                        tmp = await window.api.storage_get(data, "devoirs")
                        if (typeof tmp !== "undefined") {
                            alldataDate = tmp
                        }
                        let keys = Object.keys(alldataDate)
                        if (!keys.includes(str_date)) {
                            alldataDate[str_date] = {}
                        }

                        await myED.addHomework({
                            prof: finalData.prof, 
                            matiere: mat.matiere,
                            date: str_date,
                            iscontrol: finalData.hasEval,
                            docsraw: JSON.stringify(finalData.documents),
                            raw: JSON.stringify(finalData),
                            contenu: finalData.contenuDevoir,
                            cseance: Object.keys(finalData.contenuDS).length > 0 ? finalData.contenuDS.contenu : "",
                            docsseance: Object.keys(finalData.contenuDS).length > 0 ? finalData.contenuDS.contenu : JSON.stringify([]),
                        })

                        alldataDate[str_date][mat["matiere"]] = finalData
                        window.api.storage_set(data, "devoirs", alldataDate)
                        let allfiles = finalData["documents"]
                        if (Object.keys(finalData["contenuDS"]).length > 0 && finalData["contenuDS"]["documents"].length > 0) {
                            for (let file of finalData["contenuDS"]["documents"]) {
                                allfiles.push(file)
                            }
                        }
                        let ids = allfiles.map(o => o.id)
                        allfiles = allfiles.filter(({ id }, index) => !ids.includes(id, index + 1))

                        for (let f of allfiles) {
                            await myED.addFile({
                                matiere: mat.matiere,
                                libelle: f.nom,
                                fileid: f.id, 
                                type: f.type,
                                date: str_date
                            })
                        }

                        let allDocuments = await window.api.storage_get(data, "fichiers")
                        if (typeof allDocuments === "undefined") {
                            allDocuments = []
                        }
                        allDocuments = [...allDocuments, ...allfiles]
                        ids = allDocuments.map(o => o.id)
                        allDocuments = allDocuments.filter(({ id }, index) => !ids.includes(id, index + 1))
                        window.api.storage_set(data, "fichiers", allDocuments)

                        for (let doc of allfiles) {
                            let result = await ed.downloadHomeworkFile(doc)
                            if (result === 200) {
                                available_files.push(doc)
                            }

                        }
                        if (allfiles.length > 0) {
                            ipcrend.send("take-edfiles", available_files)
                        }
                    }

                    let alldataDate = {}
                    tmp = await window.api.storage_get(data, "devoirs")
                    if (typeof tmp !== "undefined") {
                        alldataDate = tmp
                    }
                    let keys = Object.keys(alldataDate)
                    if (!keys.includes(str_date)) {
                        alldataDate[str_date] = {}
                    }
                    if (alldataDate[str_date] !== oldData[str_date]) {
                        ipcrend.send("take-homeworks", alldataDate)
                    }
                }




                day += 1
                if (havtostop) {
                    break
                }
            }
            window.api.storage_set(data, "lastday", day)
        }
        await sleep(1000 * 60 * 2)
    }
}

ipcrend.on("run-download", (event, arg) => {
    if (!run) {
        run = true
        download(arg)
    }
})

ipcrend.on("stop-download", (event, arg) => {
    if (run) {
        run = false
    }
})
ipcrend.on("force-stop-download", (event, arg) => {
    if (run) {
        run = false
    }
})

ipcrend.on("get-edfiles", (event, args) => {
    // console.log(available_files)
    ipcrend.send("take-edfiles", available_files)
})

ipcrend.on("get-homeworks", (event, args) => {
    (async () => {
        let dat = {}
        let tmp = await window.api.storage_get(data, "devoirs")
        if (typeof tmp !== "undefined") {
            dat = tmp
        }
        ipcrend.send("take-homeworks", dat)
    })()
})

ipcrend.on("get-matieres", (event, args) => {
    (async () => {
        ipcrend.send("take-matieres", await window.api.storage_get(planning_data, "matieres"))
    })()
})

ipcrend.on("get-currentcours", (event, args) => {
    ipcrend.send("take-currentcours", current_cours)
})

ipcrend.on("update-cours", (event, args) => {
    (async () => {
        let allmat = await window.api.storage_get(planning_data, "matieres")
        let final = []
        for (let mat of allmat) {
            let recv = args[mat["nom"] + mat["prof"]]
            // console.log(recv === mat)
            if (recv["rappel"] !== mat["rappel"] || recv["url"] !== mat["url"]) {
                final.push(recv)
            } else {
                final.push(mat)
            }
        }

        window.api.storage_set(planning_data, "matieres", final)
    })()
})