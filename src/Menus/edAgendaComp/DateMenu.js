import React from 'react';
import MatiereHomework from "./MatiereHomework"

class DateMenu extends React.Component{
    constructor(props){
        super(props)
        this.date_str = props.date
        this.homeworks = props.homeworks
        this.callbck = props.callback

        this.shower = ""
        let keys = Object.keys(this.homeworks)
        this.shower = keys.map((mat)=>{
            return <MatiereHomework key={mat} matiere={mat} contents={this.homeworks[mat]}/>
        })
    }

    render(){
        return (
            <div className="DateMenu">
                <div className="nav">
                    <div className="Title">{this.date_str}</div>
                    <div className="Back" onClick={this.callbck}>Retour en arrière</div>
                </div>
                
                
                <div className="Displayer">
                    {this.shower}
                </div>
            </div>
        )
    }
}

export default DateMenu;