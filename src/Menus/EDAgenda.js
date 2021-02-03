import React from 'react';
import DateMenuSelector from "./edAgendaComp/DateMenuSelector"
import DateMenu from "./edAgendaComp/DateMenu"
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

    onMenuClick(date, homeworks){
        this.backup = this.list_h
        this.list_h = <DateMenu callback={this.getBackOnclick} date={date} homeworks={homeworks}/>
        this.setState({
            submenu: date
        })
    }

    componentDidMount(){
        
        ipcRenderer.on("take-homeworks", (event, args)=>{
            if(args.length === 0){
                this.list_h = <div className="NoHomeworks">Aucun devoir</div>
            }else{
                this.menus = {}
                this.list_h = ""
                for (let date of Object.keys(args)){
                    if(!Object.keys(this.menus).includes(date) && Object.keys(args[date]).length > 0){
                        this.menus[date] = {}
                    }else if(Object.keys(args[date]).length === 0){
                        continue
                    }
                    for(let mat of Object.keys(args[date])){
                        if(!Object.keys(this.menus[date]).includes(mat)){
                            this.menus[date][mat] = args[date][mat]
                        }
                    }
                    
                }
                let keys = Object.keys(this.menus)
                keys.sort((a,b)=>{
                    a = a.split('-').join('');
                    b = b.split('-').join('');
                    return a.localeCompare(b); 
                })
                keys = keys.reverse()
                this.list_h = keys.map((key)=>{
                    return <DateMenuSelector callback={this.onMenuClick} key={key} date={key} homeworks={this.menus[key]}/>
                })
            }
            this.setState({
                homeworks: args
            })
        })
        ipcRenderer.send("get-homeworks", {})
    }

    componentWillUnmount(){
        ipcRenderer.removeAllListeners("take-homeworks")
    }

    render(){
        return (
            <div className="EDAgenda">
               <div className="Barrnav">
                   <div className="Titre">Devoirs Ecole directe</div>
               </div>
               <div className="AllDates">
                    {this.list_h}
               </div>
            </div>
        )
    }
}

export default EDAgenda;