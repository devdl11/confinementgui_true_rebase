import React from 'react';
const electron = require('electron');
const remote = electron.remote
const {ipcRenderer} = electron

class EDAgenda extends React.Component{
    constructor(props){
        super(props)
        this.userdata = props.user
        this.state = {
            homeworks:{},
            submenu: undefined
        }
        this.backup = ""
        this.list_h = ""
        this.menus = {}

        this.onMenuClick = this.onMenuClick.bind(this)
        this.getBackOnclick = this.getBackOnclick.bind(this)
    }

    getBackOnclick(){
        this.list_h =this.backup
        this.setState({
            submenu: undefined
        })
    }

    onMenuClick(menu){
    }

    componentDidMount(){
        
        ipcRenderer.on("take-homeworks", (event, args)=>{
            if(args.length === 0){
                this.list_f = <div className="NoHomeworks">Aucun devoirs</div>
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
                   <div className="Titre">Devoirs Ecole directe</div>
               </div>
               <div className="AllFiles">
                    {this.list_f}
               </div>
            </div>
        )
    }
}

export default EDAgenda;