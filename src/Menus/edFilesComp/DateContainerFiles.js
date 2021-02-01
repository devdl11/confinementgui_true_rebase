import React from 'react';
import FileBarre from "./FileBarre"
const electron = require('electron');
const remote = electron.remote
const {ipcRenderer} = electron

class DateContainerFiles extends React.Component{
    constructor (props){
        super(props)
        this.files = props.files
        this.date = props.date
        
        let splitted = this.date.split("-")
        let dat = new Date(splitted[0], splitted[1]-1, splitted[2])
        let weekday=new Array(7);
        weekday[0]="Dimanche";
        weekday[1]="Lundi";
        weekday[2]="Mardi";
        weekday[3]="Mercredi";
        weekday[4]="Jeudi";
        weekday[5]="Vendredi";
        weekday[6]="Samedi";

        let month = new Array(12)
        month[0] = "Janvier"
        month[1] = "Février"
        month[2] = "Mars"
        month[3] = "Avril"
        month[4] = "Mai"
        month[5] = "Juin"
        month[6] = "Juillet"
        month[7] = "Aout"
        month[8] = "Septembre"
        month[9] = "Octobre"
        month[10] = "Novembre"
        month[11] = "Décembre"

        this.str_date = weekday[dat.getDay()] + " " + splitted[2] + " " + month[dat.getMonth()]

        this.state = {
            fileList: this.files.map((file)=>{
                return <FileBarre name={file["nom"]} key={file["nom"]}/>
            })
        }
    }

    render(){
        return(
            <div className="DateContainer">
                <div className="DateTitle">{this.str_date}</div>
                <div className="DateFiles">
                    {this.state.fileList}
                </div>
            </div>
        )
    }
}

export default DateContainerFiles;