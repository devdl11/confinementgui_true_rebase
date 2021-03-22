
const { ipcMain } = require("electron")
const { getEDData } = require("./handler/getEDData")
const { getPearltreesURL } = require("./handler/getPearltreesURL")
const { login_handler } = require("./handler/login")
const { downloadHomeworkFile } = require("./handler/downloadHomeworkFile")
const { getEDT } = require("./handler/getEDT")
const { getHomeWorkByDate } = require("./handler/getHomeWorkByDate")


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
        this.getEDData = new getEDData({
            getter: this.ed_instance_get
        })
    }

    initialize(){
        //init handlers
        ipcMain.handle("ed_login", async (event, ...args) => {return await this.login_handler.build()(...args)})
        ipcMain.handle("ed_getPearltreesURL", (event, ...args) => {return this.getPearltreesURL.build()(...args)})
        ipcMain.handle("ed_getData", (event, ...args) => {return this.getEDData.build()(...args)})
        ipcMain.handle("ed_getEDT", async (event, ...args)=>{return await this.getEDT.build()(...args)})
        ipcMain.handle("ed_getHomeWorkByDate", async (event, ...args)=>{return await this.getHomeWorkByDate.build()(...args)})
        ipcMain.handle("ed_downloadHomeworkFile", async (event, ...args)=>{return await this.downloadHomeworkFile.build()(...args)})
        //init ons
    }
}

module.exports.ed_events_manager = ed_events_manager