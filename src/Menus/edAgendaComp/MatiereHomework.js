import React from 'react';
const electron = require('electron');
const filemanager = require("fs");
const shell = require('electron').shell;
const remote = electron.remote
const {dialog} = remote

class MatiereHomework extends React.Component{
    constructor(props){
        super(props)
        this.matiere = props.matiere
        this.contents = props.contents
        if(!Object.keys(this.contents["contenuDS"]).includes("documents")){
            this.contents["contenuDS"]["documents"] = []
        }
        if(!Object.keys(this.contents["contenuDS"]).includes("contenu")){
            this.contents["contenuDS"]["contenu"] = ""
        }

        this.files = [...this.contents["documents"], ...this.contents["contenuDS"]["documents"]]
        let ids = this.files.map(o => o.id)
        this.files = this.files.filter(({id}, index) => !ids.includes(id, index + 1))
        
        this.files_render = this.files.map((file)=>{
            let name = file["nom"]
            let ext = file["nom"].split(".")[file["nom"].split(".").length-1]
            if(name.length > 32){
                name = name.substr(0, 29) + "." + ext
            }
            return <div key={name} className="filename" onClick={() => this.openFile(file["nom"])}>{name}</div>
        })

        this.openFile = this.openFile.bind(this)
    }

    openFile(name){
        let directoryData = (electron.app || electron.remote.app).getPath("userData") + "/EDFiles"
        let file_path = directoryData + "/" + encodeURI(name)
        if(filemanager.existsSync(file_path)){
            shell.openPath(file_path)
        }else{
            dialog.showErrorBox("Erreur","Fichier indisponible!")
        }
    }

    render(){
        return (
            <div className="MatiereHomework">
                <div className="Matiere">{this.matiere}</div>
                <div className="Prof">{this.contents["prof"]}</div>
                <div className="Content">
                    <div className="toDO" dangerouslySetInnerHTML={{ __html: this.contents["contenuDevoir"].replaceAll("http", "http").replaceAll("href", "value")} }/>
                    {
                        this.contents["contenuDS"]["contenu"].length > 0 &&
                        <div className="ContenuDS">
                            <div className="Title">Contenu de séance: </div>
                            <div className="content" dangerouslySetInnerHTML={{ __html: this.contents["contenuDS"]["contenu"].replaceAll("http", "http").replaceAll("href", "value")}} />
                        </div>
                    }
                    {
                        this.files.length > 0 &&
                        <div className="Files">
                            <div className="Title">Fichiers:</div>
                            <div className="content">
                                {this.files_render}
                            </div>
                        </div>
                    }
                </div>
            </div>
        )
    }
}

export default MatiereHomework;