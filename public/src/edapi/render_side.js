class isolated_ed_api{
    async getPearltreesURL(){
        return await window.ed.getPearltreesURL()
    }

    async login(user, pass, callback){
        await window.ed.login(user, pass, callback)
    }

    downloadHomeworkFile(filedata, callback){
        window.ed.downloadHomeworkFile(filedata, callback)
    }

    getEDT(callback){
        window.ed.getEDT(callback)
    }

    getHomeWorkByDate(date, callback){
        window.ed.getHomeWorkByDate(date, callback)
    }
}

module.exports.isolated_ed_api = isolated_ed_api