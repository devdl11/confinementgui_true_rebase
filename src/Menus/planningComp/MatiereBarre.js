import React from 'react';
import Switch from "@material-ui/core/Switch"

class MatiereBarre extends React.Component{
    constructor(props){
        super(props)
        this.matiere = props.matiere
        this.url = props.url === null ? "" : props.url
        this.prof = props.prof
        this.rappel = props.rappel
        this.saveData = props.callback

        this.state = {
            url: this.url,
            rappelState: this.rappel
        }
        this.incorrectInput = false

        this.onInputChange = this.onInputChange.bind(this)
        this.onSwitchChange = this.onSwitchChange.bind(this)
        this.onInputUnFocused = this.onInputUnFocused.bind(this)
        this.getCoursUrl = this.getCoursUrl.bind(this)
        this.getReminderState = this.getReminderState.bind(this)
        this.getMatiere = this.getMatiere.bind(this)
        this.getProf = this.getProf.bind(this)
        this.onClickTitle = this.onClickTitle.bind(this)
    }

    onInputChange(val){
        this.setState({
            url: val
        })
    }

    onInputUnFocused(){
        let urlTemplate = "lycee.cned.fr/cv/"
        let entered = this.state.url.replace("http", "").replace("s://", "").replace("://", "")
        let substr_en = entered.substr(0, urlTemplate.length)
        if(substr_en !== urlTemplate && entered !== ""){
            this.incorrectInput = true
            this.url = ""
            this.setState({
                url: ""
            })
        }else{
            this.incorrectInput = false
            this.url = this.state.url
            this.setState({
                url: this.state.url
            })
        }
        this.saveData()
    }

    onSwitchChange(state){
        this.setState({
            rappelState: state.target.checked
        })
        this.rappel = state.target.checked
        this.saveData()
    }

    getReminderState(){
        return this.rappel
    }
    
    getCoursUrl(){
        return this.url === "" ? null : this.url
    }

    getMatiere(){
        return this.matiere
    }

    getProf(){
        return this.prof
    }

    onClickTitle(){
        if(this.url !== ""){
            window.api.open_url(this.url)
        }
    }

    render(){
        return (
            <div className="MatiereBarre">
                <div className={"Matiere " + (this.state.url !== "" ? "MatiereClick": "")} onClick={this.onClickTitle}>{this.matiere}</div>
                <div className="Prof">{this.prof}</div><br/>
                <div className="action">
                <label htmlFor="UrlInput" className="labelInput">Lien classe virtuelle: </label>
                <input className={"UrlInput " + (this.incorrectInput ? "incorrectInput" : "")} name="UrlInput" onChange={(event)=>this.onInputChange(event.target.value)} onBlur={this.onInputUnFocused} value={this.state.url}></input>
                
                    <div className="reminderDiv">
                        <div className="autoRemindTitle">Rappel automatique: </div>
                        <div className="reminderSwitch">
                            <Switch checked={this.state.rappelState} color="primary" onChange={this.onSwitchChange}/>
                        </div>
                    </div>
                </div>
                
            </div>
        )
    }
}

export default MatiereBarre;