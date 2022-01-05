import React from 'react';


class DateMenuSelector extends React.Component{
    constructor(props){
        super(props)
        this.homeworks = props.homeworks
        this.date = props.date
        this.callbck = props.callback

        let splitted = this.date.split("-")
        let dat = new Date(splitted[0], splitted[1]-1, splitted[2])
        let tmp = new Date()
        this.isToday = dat.getDate() === tmp.getDate() && dat.getMonth() === tmp.getMonth() && dat.getFullYear() === tmp.getFullYear() 
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

        this.date = weekday[dat.getDay()] + " " + splitted[2] + " " + month[dat.getMonth()]
        this.matieres = Object.keys(this.homeworks).map((key)=>{
            return Object.keys(this.homeworks[key]).map((key2)=>{
                return <div key={key + key2} className="SubMatiereDate">{key}</div>
            })
        })

        this.OnClickHandler = this.OnClickHandler.bind(this)
    }

    OnClickHandler(){
        this.callbck(this.date, this.homeworks)
    }

    render(){
        return(
            <div className="DateMenuSelector" id={this.isToday ? "Today": ""} onClick={this.OnClickHandler}>
                <div className="Title">{this.date}</div>
                <div className="Contents">{this.matieres}</div>
            </div>
        )
    }
}


export default DateMenuSelector;