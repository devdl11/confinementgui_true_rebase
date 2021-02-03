import React from 'react';
const electron = require('electron');

class MatiereBarre extends React.Component{
    constructor(props){
        super(props)
        this.matiere = props.matiere
        this.url = props.url
        this.prof = props.prof
        this.rappel = props.rappel

        this.state = {
            url: this.url,
            rappelState: this.rappel
        }

        this.onInputChange = this.onInputChange.bind(this)
    }

    onInputChange(val){
        this.setState({
            url: val
        })
    }

    render(){
        return (
            <div className="MatiereBarre">
                <div className="Matiere">{this.matiere}</div>
                <div className="Prof">{this.prof}</div>
                <label htmlFor="UrlInput">Lien classe virtuelle: </label>
                <input className="UrlInput" name="UrlInput" onChange={(event)=>this.onInputChange(event.target.value)}></input>
                
            </div>
        )
    }
}

export default MatiereBarre;