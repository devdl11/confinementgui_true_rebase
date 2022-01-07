import React from 'react';
import MatiereFiles from "./edFilesComp/MatiereFiles"

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
        
        window.ipcrend.on("take-edfiles", (event, args)=>{
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
                    return <div className="MatiereButton p-2 bg-gray-50 dark:bg-gray-800  shadow-md m-2 text-center cursor-pointer rounded-md" onClick={this.onMenuClick} key={key}>{key}</div>
                })
            }
            this.setState({
                files: args
            })
        })
        window.ipcrend.send("get-edfiles", {})
    }

    componentWillUnmount(){
        window.ipcrend.removeAllListeners("take-edfiles")
    }

    render(){
        return (
            <div className="EDFiles">
               <div className="Barrnav">
                   <div className="Titre text-center border-b-2 mt-2">Fichiers Ecole directe</div>
                   {/* <div className="Reload">Recharger</div> */}
               </div>
               <div className="AllFiles">
                    {this.list_f}
               </div>
            </div>
        )
    }
}

export default EDFiles;