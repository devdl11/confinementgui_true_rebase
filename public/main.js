const { app, BrowserWindow} = require('electron')
const {ConfinementGui} = require("./confinement")

let app2 = null

app.on("ready", ()=>{
  app.setAppUserModelId("com.dl11.confinementGUI")
  app2 = new ConfinementGui()
  ConfinementGui.global_instance = app2
})
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// app.setAppUserModelId()

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    app2.createWindow()
  }
})
