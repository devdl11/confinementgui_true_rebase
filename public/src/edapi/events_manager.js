
const { ipcMain } = require("electron")
const { getPearltreesURL } = require("./handler/getPearltreesURL")
const { login_handler } = require("./handler/login")
const { downloadHomeworkFile } = require("./on/downloadHomeworkFile")
const { getEDT } = require("./on/getEDT")
const { getHomeWorkByDate } = require("./on/getHomeWorkByDate")


class ed_events_manager{
    constructor(props){
        this.ed_creation_liftup = props.ed_callback
        this.ed_instance_get = props.ed_get
        
        //init modules
        this.login_handler = new login_handler({
            callback: this.ed_creation_liftup
        })
        this.getPearltreesURL = new getPearltreesURL({
            getter: this.ed_instance_get
        })
        this.downloadHomeworkFile = new downloadHomeworkFile({
            getter: this.ed_instance_get
        })
        this.getEDT = new getEDT({
            getter: this.ed_instance_get
        })
        this.getHomeWorkByDate = new getHomeWorkByDate({
            getter: this.ed_instance_get
        })
        this.getEDData = new getEDT({
            getter: this.ed_instance_get
        })
    }

    initialize(){
        //init handlers
        ipcMain.handle("ed_login", async (...args) => {return await this.login_handler.build()(...args)})
        ipcMain.handle("ed_getPearltreesURL", (...args) => {return this.getPearltreesURL.build()(...args)})
        ipcMain.handle("ed_getData", (...args) => {return this.getEDData.build()(...args)})
        //init ons
        ipcMain.on("ed_downloadHomeworkFile", (...args)=>{this.downloadHomeworkFile.build()(...args)})
        ipcMain.on("ed_getEDT", (...args)=>{this.getEDT.build()(...args)})
        ipcMain.on("ed_getHomeWorkByDate", (...args)=>{this.getHomeWorkByDate.build()(...args)})
    }
}

module.exports.ed_events_manager = ed_events_manager