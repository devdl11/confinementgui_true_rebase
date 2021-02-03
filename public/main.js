const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');
const url = require('url');

let worker, mainwin

function createWindow () {
  // Create the browser window.
  mainwin = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    }
  })

  mainwin.setResizable(false)
  mainwin.setMenuBarVisibility(false)

  //load the index.html from a url
  // mainwin.loadURL('http://localhost:3000');
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../index.html'),
    protocol: 'file:',
    slashes: true,
  });
  mainwin.loadFile(startUrl);

  worker = new BrowserWindow({
    show:false,
    webPreferences:{
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })
  worker.loadFile("./public/worker.html")
  worker.webContents.openDevTools()
  mainwin.on("closed", ()=>{
    worker.close()
  })
  // Open the DevTools.
//   win.webContents.openDevTools()
}


ipcMain.on("run-remote-download", (event, args)=>{
    if(typeof worker === 'undefined'){
      console.error("worker not available")
    }else{
      worker.webContents.send("run-download", args)
    }
})

ipcMain.on("get-edfiles", (event, args)=>{
  if(typeof worker === 'undefined'){
    console.error("worker not available")
  }else{
    worker.webContents.send("get-edfiles", args)
  }
})

ipcMain.on("get-homeworks", (event, args)=>{
  if(typeof worker === 'undefined'){
    console.error("worker not available")
  }else{
    worker.webContents.send("get-homeworks", args)
  }
})

ipcMain.on("get-matieres", (event, args)=>{
  if(typeof worker === 'undefined'){
    console.error("worker not available")
  }else{
    worker.webContents.send("get-matieres", args)
  }
})

ipcMain.on("take-edfiles", (event,args)=>{
  if(typeof mainwin === 'undefined'){
    console.error("main not available")
  }else{
    mainwin.webContents.send("take-edfiles", args)
  }
})

ipcMain.on("take-homeworks", (event,args)=>{
  if(typeof mainwin === 'undefined'){
    console.error("main not available")
  }else{
    mainwin.webContents.send("take-homeworks", args)
  }
})

ipcMain.on("take-matieres", (event,args)=>{
  if(typeof mainwin === 'undefined'){
    console.error("main not available")
  }else{
    mainwin.webContents.send("take-matieres", args)
  }
})


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.