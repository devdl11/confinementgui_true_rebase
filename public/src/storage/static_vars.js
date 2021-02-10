const electron = require("electron")

module.exports.app_directory = (electron.app || electron.remote.app).getPath('userData');