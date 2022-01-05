import React from 'react';

class FileBarre extends React.Component{
    constructor(props){
        super(props)
        this.name = props.name
        this.backm = props.backm
        this.real_name = props.name
        this.isAvailable = false
        this.isMountedComp = false
        this.onClickOpen = this.onClickOpen.bind(this)
        this.state = {
            stateFile : this.isAvailable
        }
        if(this.name.length > 32){
            let splitted = this.name.split(".")
            this.name = this.name.substr(0, 29) + "[...]." + splitted[splitted.length -1]
        }

        this.isFileGetter = this.isFileGetter.bind(this)
        this.onClickOpen = this.onClickOpen.bind(this)
        this.onClickRemove = this.onClickRemove.bind(this)
    }

    async isFileGetter(){
        this.isAvailable = await window.api.is_file("EDFiles/"+encodeURI(this.real_name))
        if(this.isMountedComp){
            this.setState({
                stateFile: this.isAvailable
            })
        }
    }

    onClickOpen(){
        if(this.isAvailable){
            window.api.open_file("EDFiles/" + encodeURI(this.real_name))
        }
    }

    onClickRemove(){
        if(this.isAvailable){
            window.api.delete_file("EDFiles/" + encodeURI(this.real_name))
            this.backm()
        }
    }

    componentDidMount(){
        this.isMountedComp = true
        this.isFileGetter()
    }

    componentWillUnmount(){
        this.isMountedComp = false
    }

    render(){
        return(
            <div className="FileBarre">
                <div className="FileName">{this.name}</div> <div className={this.isAvailable ? "OpenButton" : "Unavailable"} onClick={this.onClickOpen}>{this.isAvailable ? "Ouvrir" : "Indisponible"}</div> {this.isAvailable && <div className="DeleteButton" onClick={this.onClickRemove}>Supprimer</div>}
            </div>
        )
    }
}

export default FileBarre;