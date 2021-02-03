import "./Menu.css"
import "./composants Menu/BarreNav.css"
import "./Menus/EDFiles.css"
import "./Menus/EDAgenda.css"
import "./Menus/Planning.css"
import EDFiles from "./Menus/EDFiles"
import EDAgenda from "./Menus/EDAgenda"
import Planning from "./Menus/Planning"
import React from 'react';
import BarreNav from "./composants Menu/BarreNav"
const electron = require('electron');
const ipcRender = electron.ipcRenderer
const remote = electron.remote

const {dialog} = remote

class Menu extends React.Component{
    constructor(props){
        super(props)
        this.ed_inst = props.ed_inst
        this.menus = {
            F_ED: <EDFiles user={this.ed_inst.user_data} />,
            AGND: <EDAgenda user={this.ed_inst.user_data} />,
            PLAN: <Planning ed={this.ed_inst}/>
        }
        this.state = {
            menu: null
        }
        console.log(this.ed_inst)
        ipcRender.send("run-remote-download", {
            edinstance: this.ed_inst
        })

        this.onChangeMenu = this.onChangeMenu.bind(this)
    }

    onChangeMenu(menu){
        // console.log(menu)
        if(Object.keys(this.menus).includes(menu)){
            this.setState({
                menu: this.menus[menu]
            })
        }
    }

    render(){
        return (
            <div>
             <BarreNav name={this.ed_inst.user_data.prenom + " " + this.ed_inst.user_data.nom} liftup={this.onChangeMenu}/>
             <div className="MenuDisplayer">
                 {this.state.menu}
             </div>
            </div>
        )
    }
}

export default Menu;