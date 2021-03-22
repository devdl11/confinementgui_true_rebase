const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');
const { promisify } = require("util")
const fs = require('fs')
const readdir = promisify(fs.readdir)
const { IPC_handler_manager } = require("./src/handlers/handlers_manager")
const isDev = require('electron-is-dev');
const { virtual_file } = require("./src/storage/virtualFile")
const { files, directories } = require("./src/const")
const { app_directory } = require("./src/storage/static_vars");
const { virtual_directory } = require('./src/storage/virtualDirectory');
const { ED_Instance } = require('./src/edapi/ed-api');
const { ed_events_manager } = require("./src/edapi/events_manager");
const { SelfCrypto } = require('./src/crypto');
const { IPC_on_manager } = require("./src/ons/ons_manager")
const { remote_storage_manager } = require("./src/storage/remote_storage_manager")
const {notification_manager} = require("./src/notification_manager")
const {License} = require("./src/license_manager")

function logDev(msg) {
  if (isDev) {
    console.log(msg)
  }
}

const firebaseConfig = {
  apiKey: "AIzaSyCyEdsCGvFSrvlyfamVNPT-HyLxdOujBGI",
  authDomain: "schoolnet-fee00.firebaseapp.com",
  databaseURL: "https://schoolnet-fee00.firebaseio.com",
  projectId: "schoolnet-fee00",
  storageBucket: "schoolnet-fee00.appspot.com",
  messagingSenderId: "1010257640849",
  appId: "1:1010257640849:web:9cad46e21136b120336e30",
  measurementId: "G-09GRW582KC"
};

class ConfinementGui {
  static global_instance = null


  constructor() {
    this.mainwin = this.worker = this.firebase_win = this.registration_win =  this.handler_manager = this.on_manager = null
    this.files = {}
    this.directories = {}
    this.ed_inst = null
    this.remote_storage_manager = new remote_storage_manager(this)
    this.notification_manager = new notification_manager(this)
    this.waiting_registration = false
    this.is_firebase_init_success = false

    //On bind

    this.onLoading = this.onLoading.bind(this)
    this.init_firebase = this.init_firebase.bind(this)
    this.init_crypto_app = this.init_crypto_app.bind(this)
    this.app_initer = this.app_initer.bind(this)
    this.onEDLogged = this.onEDLogged.bind(this)
    this.getEDinst = this.getEDinst.bind(this)
    this.getInstance = this.getInstance.bind(this)
    this.init_ED_API = this.init_ED_API.bind(this)
    this.write_file = this.write_file.bind(this)
    this.read_file = this.read_file.bind(this)
    this.open_file = this.open_file.bind(this)
    this.create_file = this.create_file.bind(this)
    this.get_file_path = this.get_file_path.bind(this)
    this.isFile = this.isFile.bind(this)
    this.loadInternalEvents = this.loadInternalEvents.bind(this)
    this.loadDirectories = this.loadDirectories.bind(this)
    this.loadFiles = this.loadFiles.bind(this)
    this.loadEvents = this.loadEvents.bind(this)
    this.createMainWindow = this.createMainWindow.bind(this)
    this.createWorkerWindow = this.createWorkerWindow.bind(this)
    this.createRegistrationWindow = this.createRegistrationWindow.bind(this)
    this.licenseRegistrationCallback = this.licenseRegistrationCallback.bind(this)
    this.post_init_firebase = this.post_init_firebase.bind(this)
    this.manage_close_events = this.manage_close_events.bind(this)

    this.init_firebase()
    this.license = new License({
      listener: this.licenseRegistrationCallback,
    })

    this.onLoading()
    
    this.ed_events_manager = new ed_events_manager({
      ed_callback: this.onEDLogged,
      ed_get: this.getEDinst
    })
    this.app_initer()
    this.loadEvents()
  }

  async init_crypto_app() {
    logDev("[MAIN INFO] Initializing internal crypto...")
    SelfCrypto.__init__(() => {
      logDev("[MAIN INFO] internal crypto initialized!")
    })
  }

  async app_initer() {
    await this.init_crypto_app()
    this.init_ED_API()
    await this.loadFiles()
    await this.loadDirectories()
    await this.loadInternalEvents()
    this.createWorkerWindow()
  }

  post_init_firebase(){
    if(!this.is_firebase_init_success){
      if(isDev){
        logDev("[MAIN INFO] Error Firebase not init!")
      }else{
        app.exit(-1)
      }
    }else{
      logDev("[MAIN INFO] Firebase loaded ! ")
      this.license.register_firebase(this.firebase_win.webContents)
      this.license.start_verif().then(()=>{
        this.createMainWindow()
      })
    }
  }

  init_firebase(){
    logDev("[MAIN INFO] Initializing firebase...")
    
    ipcMain.handle("firebase-get-config", () => {
      return firebaseConfig
    })

    ipcMain.on("firebase_inited", (result)=>{
      this.is_firebase_init_success = result
      this.post_init_firebase()
    })

    this.createFirebaseWindow()

  }

  licenseRegistrationCallback(res){
    this.waiting_registration = false
    if(res === -1){
      this.notification_manager.show_error_connection_dialog()
    }else if(res === -2){
      this.notification_manager.show_error_credentials_dialog()
    }else if(res === -3){
      this.notification_manager.show_internal_error_dialog()
    }else if(res === 0){
      this.registration_win.destroy()
      delete this.license
      this.license = new License({
        listener: this.licenseRegistrationCallback,
      })
      this.license.register_firebase(this.firebase_win.webContents)
      this.license.start_verif().then(() =>{
        this.createMainWindow()
      })
    }
  }

  onEDLogged(inst) {
    this.ed_inst = inst
  }

  getEDinst() {
    return this.ed_inst
  }

  getInstance(){
    return this
  }

  async init_ED_API() {
    logDev("[MAIN INFO] initializing ed api...")
    this.ed_events_manager.initialize()
    logDev("[MAIN INFO] ed api initialized!")
  }

  write_file(args) {
    if (typeof args === 'object') {
      let allkeys = Object.keys(args)
      if (allkeys.includes("name") && allkeys.includes("content") && Object.keys(this.files).includes(args.name)) {
        this.files[args.name].write(args.content)
      }
    }
  }

  read_file(args) {
    if (typeof args === 'string') {
      if (Object.keys(this.files).includes(args)) {
        return this.files[args].read()
      }
    }
    return null
  }

  open_file(args){
    if (typeof args === "string") {
      let splitted = args.split("/")
      if (splitted.length === 2 && Object.keys(this.directories).includes(splitted[0]) && !Object.keys(this.files).includes(args)) {
        let res = this.directories[splitted[0]].getFile(splitted[1])
        if (res === null) {
          return null
        } else {
          this.files[args] = res
          return true
        }
      }else if(Object.keys(this.files).includes(args)){
        return true
      }
    }
    return null
  }

  create_file(args){
    if (typeof args === "object" && Object.keys(args).includes("name") && Object.keys(args).includes("folder") && Object.keys(this.directories).includes(args.folder)) {
      let res = this.directories[args.folder].createFile(args.name)
      if (res === null) {
        return null
      } else {
        this.files[args.folder + "/" + args.name] = res
        return true
      }
    }else if(typeof args === "object" && Object.keys(args).includes("name") && !Object.keys(args).includes("folder") && files.includes(args.name)){
      let pth = path.join(app_directory, args.name)
      let splitted = args.name.split(".")
      splitted.pop()
      let vf = new virtual_file({
        path: pth
      })
      this.files[splitted.join(".")] = vf
    }
    return null
  }

  get_file_path(args){
    if (typeof args === 'string') {
      if (Object.keys(this.files).includes(args)) {
        return this.files[args].path
      }
    }
    return null
  }

  isFile(args){
    if(typeof args === 'string'){
      return (Object.keys(this.files).includes(args) && this.files[args].exist()) || (() => {
        let splitted = args.split("/")
        if (splitted.length === 2){
          if(Object.keys(this.directories).includes(splitted[0]) && this.directories[splitted[0]].getFilesList().includes(splitted[1])){
            this.open_file(args)
            return this.files[args].exist()
          }else if (Object.keys(this.directories).includes(splitted[0])){
            for(let fi of this.directories[splitted[0]].getFilesList()){
              if(fi.includes(splitted[1])){
                this.open_file(splitted[0] + "/" + fi)
                return this.files[splitted[0] + "/" + fi].exist()
              }
            }
          }
        }else{
          for(let dir of Object.keys(this.directories)){
            if(this.directories[dir].getFilesList().includes(args)){
              this.open_file(args)
              return this.files[args].exist()
            }
          }
        }
        
        return false
      })()
    }
  }

  async loadInternalEvents() {
    logDev("[MAIN INFO] loading internals events....")
    ipcMain.on("write_file", (event, args) => {
      this.write_file(args)
    })

    ipcMain.handle("read_file", (event, args) => {
      return this.read_file(args)
    })

    ipcMain.handle("open_file", (event, args) => {
      return this.open_file(args)
    })

    ipcMain.handle("create_file", (event, args) => {
      return this.create_file(args)
    })
    
    ipcMain.handle("is_file", (event, args) => {
      return this.isFile(args)
    })
    logDev("[MAIN INFO] internals events loaded!")
  }

  async loadDirectories() {
    logDev("[MAIN INFO] loading virtual directories...")
    for (let direct of directories) {
      let pth = path.join(app_directory, direct)
      this.directories[direct] = new virtual_directory({
        path: pth,
        force: true
      })
    }
    logDev("[MAIN INFO] virtual directories loaded!")
  }

  async loadFiles() {
    logDev("[MAIN INFO] loading virtual files...")
    for (let file of files) {
      let pth = path.join(app_directory, file)
      let splitted = file.split(".")
      splitted.pop()
      let vf = new virtual_file({
        path: pth
      })
      this.files[splitted.join(".")] = vf
    }
    logDev("[MAIN INFO] virtual files loaded!")
    logDev(this.files)
  }

  async loadEvents() {
    logDev("[MAIN INFO] initializing handlers ...")
    this.handler_manager = new IPC_handler_manager(this.mainwin, this.worker, this)
    this.handler_manager.initialize()
    logDev("[MAIN INFO] handlers initialized!")
    logDev("[MAIN INFO] initializing ons...")
    this.on_manager = new IPC_on_manager(this.mainwin, this.worker, this)
    this.on_manager.initialize()
    logDev("[MAIN INFO] ons initialized!")
  }


  async onLoading() {
    ipcMain.on("run-remote-download", (event, args) => {
      if (typeof this.worker === 'undefined') {
        console.error("this.worker not available")
      } else {
        this.worker.webContents.send("run-download", args)
      }
    })

    ipcMain.on("get-edfiles", (event, args) => {
      if (typeof this.worker === 'undefined') {
        console.error("this.worker not available")
      } else {
        this.worker.webContents.send("get-edfiles", args)
      }
    })

    ipcMain.on("get-homeworks", (event, args) => {
      if (typeof this.worker === 'undefined') {
        console.error("this.worker not available")
      } else {
        this.worker.webContents.send("get-homeworks", args)
      }
    })

    ipcMain.on("get-matieres", (event, args) => {
      if (typeof this.worker === 'undefined') {
        console.error("this.worker not available")
      } else {
        this.worker.webContents.send("get-matieres", args)
      }
    })


    ipcMain.on("get-currentcours", (event, args) => {
      if (typeof this.worker === 'undefined') {
        console.error("this.worker not available")
      } else {
        this.worker.webContents.send("get-currentcours", args)
      }
    })

    ipcMain.on("update-cours", (event, args) => {
      if (typeof this.worker === 'undefined') {
        console.error("this.worker not available")
      } else {
        this.worker.webContents.send("update-cours", args)
      }
    })

    ipcMain.on("take-edfiles", (event, args) => {
      if (typeof this.mainwin === 'undefined') {
        console.error("main not available")
      } else {
        this.mainwin.webContents.send("take-edfiles", args)
      }
    })

    ipcMain.on("take-homeworks", (event, args) => {
      if (typeof this.mainwin === 'undefined') {
        console.error("main not available")
      } else {
        this.mainwin.webContents.send("take-homeworks", args)
      }
    })

    ipcMain.on("take-matieres", (event, args) => {
      if (typeof this.mainwin === 'undefined') {
        console.error("main not available")
      } else {
        this.mainwin.webContents.send("take-matieres", args)
      }
    })

    ipcMain.on("take-currentcours", (event, args) => {
      if (typeof this.mainwin === 'undefined') {
        console.error("main not available")
      } else {
        this.mainwin.webContents.send("take-currentcours", args)
      }
    })
  }

  manage_close_events(){
    if(this.registration_win !== null){
      this.registration_win.removeAllListeners("close")
      this.registration_win.on("close", ()=>{
        if(this.worker !== null && !this.worker.isDestroyed()){
          this.worker.close()
        }
        if(this.firebase_win !== null && !this.firebase_win.isDestroyed()){
          this.firebase_win.close()
        }
      })
    }
    if(this.mainwin !== null){
      this.mainwin.removeAllListeners("close")
      this.mainwin.on("close", ()=>{
        if(this.worker !== null && !this.worker.isDestroyed()){
          this.worker.close()
        }
        if(this.firebase_win !== null && !this.firebase_win.isDestroyed()){
          this.firebase_win.close()
        }
      })
    }

  }

  createRegistrationWindow(){
    logDev("[MAIN INFO] Creating registration window...")
    this.registration_win = new BrowserWindow({
      width: 500,
      height: 250,
      webPreferences: {
        nodeIntegration: false,
        enableRemoteModule: false,
        contextIsolation: true,
        preload: __dirname + "/src/registration_preload.js"
      }
    })

    this.registration_win.setResizable(false)
    this.registration_win.setMenuBarVisibility(false)

    const startUrl = process.env.ELECTRON_START_URL || path.join(__dirname, '../build/index.html');
    const url2 = startUrl === process.env.ELECTRON_START_URL ? path.join(__dirname, 'registration.html') : path.join(__dirname, '../build/registration.html')
    logDev("[MAIN INFO] Loading url " + url2 + "...")
    // this.worker.loadFile("./public/this.worker.html")
    this.registration_win.loadFile(url2)
    // this.registration_win.webContents.openDevTools()

    logDev("[MAIN INFO] Registration window created!")
    this.manage_close_events()
  }
  
  createFirebaseWindow(){
    logDev("[MAIN INFO] Creating firebase window...")
    this.firebase_win = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        enableRemoteModule: false,
        contextIsolation: true,
        preload: __dirname + "/src/firebase_preload.js",
      }
    })

    this.firebase_win.setResizable(false)
    this.firebase_win.setMenuBarVisibility(false)

    const startUrl = process.env.ELECTRON_START_URL || path.join(__dirname, '../build/index.html');
    const url2 = startUrl === process.env.ELECTRON_START_URL ? path.join(__dirname, 'firebase_app.html') : path.join(__dirname, '../build/firebase_app.html')
    logDev("[MAIN INFO] Loading url " + url2 + "...")
    // this.worker.loadFile("./public/this.worker.html")
    this.firebase_win.loadFile(url2)
    // this.firebase_win.webContents.openDevTools()

    logDev("[MAIN INFO] Firebase window created!")
    this.manage_close_events()
  }

  createMainWindow() {

    if(!this.license.has_license){
      this.createRegistrationWindow()
      return
    }
    logDev("[MAIN INFO] Creating Main Window...")
    this.mainwin = new BrowserWindow({
      width: 1000,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        enableRemoteModule: false,
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
    if (startUrl === process.env.ELECTRON_START_URL) {
      this.mainwin.loadURL(startUrl)
    } else {
      this.mainwin.loadFile(startUrl)
    }
    logDev("[MAIN INFO] Main creation done!")
    this.manage_close_events()
  }


  createWorkerWindow() {

    // app.setAppUserModelId(app.name)
    logDev("[MAIN INFO] Creating Worker Process...")
    this.worker = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, "/src/worker_preload.js")
      }
    })
    const startUrl = process.env.ELECTRON_START_URL || path.join(__dirname, '../build/index.html');
    const url2 = startUrl === process.env.ELECTRON_START_URL ? path.join(__dirname, 'worker.html') : path.join(__dirname, '../build/worker.html')
    logDev("[MAIN INFO] Loading url " + url2 + "...")
    // this.worker.loadFile("./public/this.worker.html")
    this.worker.loadFile(url2)
    this.worker.webContents.openDevTools()
    
    
    
    logDev("[MAIN INFO] Worker creation done!")
    // Open the DevTools.
    //   win.webContents.openDevTools()
    this.manage_close_events()
  }
}



module.exports.ConfinementGui = ConfinementGui;