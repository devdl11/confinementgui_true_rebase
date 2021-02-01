import React from 'react';
import DateContainerFiles from "./DateContainerFiles"
const electron = require('electron');
const remote = electron.remote
const {ipcRenderer} = electron

class MatiereFiles extends React.Component{
    constructor(props){
        super(props)
        this.files = props.files
        this.callbck = props.callback
        this.matiere = props.matiere
        this.dates = {}
        let ids = this.files.map(o => o.id)
        this.files = this.files.filter(({id}, index) => !ids.includes(id, index + 1))
        for (let file of this.files){
            if(!Object.keys(this.dates).includes(file["date"])){
                this.dates[file["date"]] = []
            }
            if(!this.dates[file["date"]].includes(file)){
                this.dates[file["date"]].push(file)
            }
            
        }
        this.keys = Object.keys(this.dates)
        this.keys.sort((a,b)=>{
            a = a.split('-').join('');
            b = b.split('-').join('');
            return a.localeCompare(b); 
        })
        this.keys = this.keys.reverse()
        this.shower = this.keys.map((date)=>{
            return <DateContainerFiles files={this.dates[date]} date={date} key={date} />
        })

    }

    render(){
        return(
            <div>
                <div className="MatiereMenu">
                    <div className="MatiereTitle">{this.matiere}</div>
                    <div className="BackMatiere" onClick={this.callbck}>Retour en arrière</div>
                    <div className="DatesList">
                        {this.shower}
                    </div>
                </div>
            </div>
        )
    }

}

export default MatiereFiles;