import React from 'react';
import DataRangeSelector from "./DateRangeSelector"
import Storage from "../Storage"
import MatiereFiles from "./edFilesComp/MatiereFiles"
const electron = require('electron');
const remote = electron.remote
const {ipcRenderer} = electron

class EDFiles extends React.Component{
    constructor(props){
        super(props)
        this.userdata = props.user
        this.state = {
            files:{},
            submenu: undefined
        }
        this.backup = ""
        this.list_f = ""
        this.menus = {}

        this.onMenuClick = this.onMenuClick.bind(this)
        this.getBackOnclick = this.getBackOnclick.bind(this)
    }

    getBackOnclick(){
        this.list_f =this.backup
        this.setState({
            submenu: undefined
        })
    }

    onMenuClick(menu){
        let selectedFiles =this.menus[menu.target.innerText]
        this.backup = this.list_f
        this.list_f = <MatiereFiles files={selectedFiles} callback={this.getBackOnclick} matiere={menu.target.innerText}/>
        this.setState({
            submenu: menu
        })
    }

    componentDidMount(){
        
        ipcRenderer.on("take-edfiles", (event, args)=>{
            if(args.length === 0){
                this.list_f = <div className="NoFile">Aucun fichier</div>
            }else{
                this.menus = {}
                this.list_f = ""
                for (let file of args){
                    if(!Object.keys(this.menus).includes(file["matiere"])){
                        this.menus[file["matiere"]] = []
                    }
                    if(!this.menus[file["matiere"]].includes(file)){
                        this.menus[file["matiere"]].push(file)
                    }
                }
                this.list_f = Object.keys(this.menus).map((key)=>{
                    return <div className="MatiereButton" onClick={this.onMenuClick} key={key}>{key}</div>
                })
            }
            this.setState({
                files: args
            })
        })
        ipcRenderer.send("get-edfiles", {})
    }

    componentWillUnmount(){
        ipcRenderer.removeAllListeners("take-edfiles")
    }

    render(){
        return (
            <div className="EDFiles">
               <div className="Barrnav">
                   {/* <div className="Titre">Fichiers Ecole directe</div> */}
                   <div className="Reload">Recharger</div>
               </div>
               <div className="AllFiles">
                    {this.list_f}
               </div>
            </div>
        )
    }
}

export default EDFiles;