const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');
const { promisify } = require("util")
const fs = require('fs')
const readdir = promisify(fs.readdir)
const {IPC_handler_manager} = require("./src/handlers/handlers_manager")
const isDev = require('electron-is-dev');
const {virtual_file} = require("./src/storage/virtualFile")
const {files, directories} = require("./src/const")
const {app_directory} = require("./src/storage/static_vars");
const { virtual_directory } = require('./src/storage/virtualDirectory');
const { ED_Instance } = require('./src/edapi/ed-api');
const {ed_events_manager} = require("./src/edapi/events_manager");
const { SelfCrypto } = require('./src/crypto');
const {IPC_on_manager} = require("./src/ons/ons_manager")
const {remote_storage_manager} = require("./src/storage/remote_storage_manager")

function logDev(msg){
  if(isDev){
    console.log(msg)
  }
}

class ConfinementGui{

    constructor(){
        this.mainwin = this.worker = this.handler_manager = this.on_manager= null
        this.files = {}
        this.directories = {}
        this.ed_inst = null
        this.remote_storage_manager = new remote_storage_manager()
        this.onLoading()
        
        this.ed_events_manager = new ed_events_manager({
          ed_callback: this.onEDLogged,
          ed_get: this.getEDinst
        })
        this.init_crypto_app()
        this.app_initer()
        this.loadEvents()
    }

    init_crypto_app(){
      logDev("[MAIN INFO] Initializing internal crypto...")
      SelfCrypto.__init__(()=>{
        logDev("[MAIN INFO] internal crypto initialized!")
      })
    }

    async app_initer(){
      this.init_ED_API()
      await this.loadFiles()
      await this.loadDirectories()
      await this.loadInternalEvents()
      this.createMainWindow()
      this.createWorkerWindow()
    }


    onEDLogged(inst){
      this.ed_inst = inst
    }

    getEDinst(){
      return this.ed_inst
    }

    async init_ED_API(){
      logDev("[MAIN INFO] initializing ed api...")
      this.ed_events_manager.initialize()
      logDev("[MAIN INFO] ed api initialized!")
    }

    async loadInternalEvents(){
      logDev("[MAIN INFO] loading internals events....")
      ipcMain.on("write_file", (event, args)=>{
        if(typeof args === 'object'){
          let allkeys = Object.keys(args)
          if(allkeys.includes("name") && allkeys.includes("content") && Object.keys(this.files).includes(args.name)){
            this.files[args.name].write(args.content)
          }
        }
      })

      ipcMain.handle("read_file", (event, args)=>{
        if(typeof args === 'string'){
          if(Object.keys(this.files).includes(args)){
            return this.files[args].read()
          }
        }
        return null
      })

        ipcMain.handle("open_file", (event, args)=>{
          if(typeof args === "string"){
            let splitted = args.split("/")
            if(splitted.length === 2 && Object.keys(this.directories).includes(splitted[0])){
              let res = this.directories[splitted[0]].getFile()
              if(res === null){
                return null
              }else{
                this.files[args] = res
                return true
              }
            }
          }
          return null
        })

        ipcMain.handle("create_file", (event, args)=>{
          if(typeof args === "object" && Object.keys(args).includes("name") && Object.keys(args).includes("folder") && Object.keys(this.directories).includes(args.folder)){
            let res = this.directories[args.folder].createFile(args.name)
            if(res === null){
              return null
            }else{
              this.files[args.folder + "/" + args.name] = res
              return true 
            }
          }
          return null
        })
      logDev("[MAIN INFO] internals events loaded!")
    }

    async loadDirectories(){
      logDev("[MAIN INFO] loading virtual directories...")
      for (let direct of directories){
        let pth = path.join(app_directory, direct)
        this.directories[pth] = new virtual_directory({
          path: pth,
          force: true
        })
      }
      logDev("[MAIN INFO] virtual directories loaded!")
    }

    async loadFiles(){
      logDev("[MAIN INFO] loading virtual files...")
      for(let file of files){
        let pth = path.join(app_directory, file)
        let splitted = file.split(".")
        splitted.pop()
        let vf = new virtual_file({
          path: pth
        })
        this.files[splitted.join(".")] = vf
      }
      logDev("[MAIN INFO] virtual files loaded!")
    }

    async loadEvents(){
      logDev("[MAIN INFO] initializing handlers ...")
      this.handler_manager = new IPC_handler_manager(this.mainwin, this.worker, this)
      this.handler_manager.initialize()
      logDev("[MAIN INFO] handlers initialized!")
      logDev("[MAIN INFO] initializing ons...")
      this.on_manager = new IPC_on_manager(this.mainwin, this.worker, this)
      this.on_manager.initialize()
      logDev("[MAIN INFO] ons initialized!")
    }


    async onLoading(){
        ipcMain.on("run-remote-download", (event, args)=>{
            if(typeof this.worker === 'undefined'){
              console.error("this.worker not available")
            }else{
              this.worker.webContents.send("run-download", args)
            }
        })
        
        ipcMain.on("get-edfiles", (event, args)=>{
          if(typeof this.worker === 'undefined'){
            console.error("this.worker not available")
          }else{
            this.worker.webContents.send("get-edfiles", args)
          }
        })
        
        ipcMain.on("get-homeworks", (event, args)=>{
          if(typeof this.worker === 'undefined'){
            console.error("this.worker not available")
          }else{
            this.worker.webContents.send("get-homeworks", args)
          }
        })
        
        ipcMain.on("get-matieres", (event, args)=>{
          if(typeof this.worker === 'undefined'){
            console.error("this.worker not available")
          }else{
            this.worker.webContents.send("get-matieres", args)
          }
        })
        
        
        ipcMain.on("get-currentcours", (event, args)=>{
          if(typeof this.worker === 'undefined'){
            console.error("this.worker not available")
          }else{
            this.worker.webContents.send("get-currentcours", args)
          }
        })
        
        ipcMain.on("update-cours", (event, args)=>{
          if(typeof this.worker === 'undefined'){
            console.error("this.worker not available")
          }else{
            this.worker.webContents.send("update-cours", args)
          }
        })
        
        ipcMain.on("take-edfiles", (event,args)=>{
          if(typeof this.mainwin === 'undefined'){
            console.error("main not available")
          }else{
            this.mainwin.webContents.send("take-edfiles", args)
          }
        })
        
        ipcMain.on("take-homeworks", (event,args)=>{
          if(typeof this.mainwin === 'undefined'){
            console.error("main not available")
          }else{
            this.mainwin.webContents.send("take-homeworks", args)
          }
        })
        
        ipcMain.on("take-matieres", (event,args)=>{
          if(typeof this.mainwin === 'undefined'){
            console.error("main not available")
          }else{
            this.mainwin.webContents.send("take-matieres", args)
          }
        })
        
        ipcMain.on("take-currentcours", (event,args)=>{
          if(typeof this.mainwin === 'undefined'){
            console.error("main not available")
          }else{
            this.mainwin.webContents.send("take-currentcours", args)
          }
        })
    }

    createMainWindow(){
      logDev("[MAIN INFO] Creating Main Window...")
        this.mainwin = new BrowserWindow({
          width: 1000,
          height: 800,
          webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: true,
            preload: __dirname + "/src/main_preload.js"
          }
        })
      
        this.mainwin.setResizable(false)
        this.mainwin.setMenuBarVisibility(false)
      
        //load the index.html from a url
        // this.mainwin.loadURL('http://localhost:3000');
        
        
        const startUrl = process.env.ELECTRON_START_URL || path.join(__dirname, '../build/index.html');
        logDev("[MAIN INFO] Loading url " + startUrl + "...")
        if(startUrl === process.env.ELECTRON_START_URL){
          this.mainwin.loadURL(startUrl)
        }else{
          this.mainwin.loadFile(startUrl)
        }
        logDev("[MAIN INFO] Main creation done!")
    }
    

    createWorkerWindow() {
        
        // app.setAppUserModelId(app.name)
        logDev("[MAIN INFO] Creating Worker Process...")
        this.worker = new BrowserWindow({
          show:false,
          webPreferences:{
            nodeIntegration: true,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "/src/worker_preload.js")
          }
        })
        const startUrl = process.env.ELECTRON_START_URL || path.join(__dirname, '../build/index.html');
        const url2 = startUrl === process.env.ELECTRON_START_URL? path.join(__dirname, 'worker.html') : path.join(__dirname, '../build/worker.html')
        logDev("[MAIN INFO] Loading url " + url2 + "...")
        // this.worker.loadFile("./public/this.worker.html")
        this.worker.loadFile(url2)
        this.worker.webContents.openDevTools()
        this.mainwin.on("closed", ()=>{
          this.worker.close()
        })
        this.onLoading()
        logDev("[MAIN INFO] Worker creation done!")
        // Open the DevTools.
      //   win.webContents.openDevTools()
      }
}



module.exports.ConfinementGui = ConfinementGui;