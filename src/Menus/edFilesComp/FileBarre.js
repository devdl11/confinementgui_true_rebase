import React from 'react';
const electron = window.require('electron');
const filemanager = require("fs");
const shell = window.require('electron').shell;
const remote = electron.remote
const {ipcRenderer} = electron

class FileBarre extends React.Component{
    constructor(props){
        super(props)
        this.name = props.name
        let directoryData = (electron.app || electron.remote.app).getPath("userData") + "/EDFiles"
        this.file_path = directoryData + "/" + encodeURI(this.name)
        this.isAvailable = filemanager.existsSync(this.file_path)
        this.onClickOpen = this.onClickOpen.bind(this)

        if(this.name.length > 32){
            let splitted = this.name.split(".")
            this.name = this.name.substr(0, 29) + "[...]." + splitted[splitted.length -1]
        }
    }

    onClickOpen(){
        if(this.isAvailable){
            shell.openPath(this.file_path)
        }
    }

    render(){
        return(
            <div className="FileBarre">
                <div className="FileName">{this.name}</div> <div className={this.isAvailable ? "OpenButton" : "Unavailable"} onClick={this.onClickOpen}>{this.isAvailable ? "Ouvrir" : "Indisponible"}</div>
            </div>
        )
    }
}

export default FileBarre;