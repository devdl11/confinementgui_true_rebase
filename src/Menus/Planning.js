import React from 'react';
import MatiereBarre from "./planningComp/MatiereBarre"
const electron = require('electron');
const remote = electron.remote
const {ipcRenderer} = electron

class Planning extends React.Component{
    constructor(props){
        super(props)
        this.ed_inst = props.ed
        
        this.matieres = []
        this.mat_ref = {}
        this.list_m = ""
        this.state = {
            matieres: [],
            current_cours: null
        }
    }

    componentDidMount(){
        
        ipcRenderer.on("take-matieres", (event, args)=>{
            if(args.length === 0){
                this.list_m = <div className="NoMatieres">Aucune Matière</div>
            }else{
                
                this.matieres = args
                this.list_m = this.matieres.map((key)=>{
                    return <MatiereBarre key={key.nom + key.prof} ref={(rf)=>this.mat_ref[key.nom + key.prof] = rf} matiere={key.nom} url={key.url} prof={key.prof} rappel={key.rappel} />
                })
                console.log(this.list_m)
            }
            this.setState({
                files: args
            })
        })
        ipcRenderer.send("get-matieres", {})
    }

    componentWillUnmount(){
        ipcRenderer.removeAllListeners("take-matieres")
    }

    render(){
        return(
            <div className="Planning">
                <div className="Nav">
                    <div className="Title">Planning</div>
                    <div className="SubTitle">Cours en moment: </div><div className="CoursName">{this.state.current_cours}</div>
                </div>
                <div className="content">
                    {this.list_m}
                </div>
            </div>
        );
    }
}

export default Planning;