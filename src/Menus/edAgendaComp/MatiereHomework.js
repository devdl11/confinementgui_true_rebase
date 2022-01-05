import React from 'react';

class MatiereHomework extends React.Component{
    constructor(props){
        super(props)
        this.matiere = props.matiere
        this.contents = props.contents
        console.log("DEV MATIERE HOMW")
        console.log(this.contents)
        

        this.files = [...JSON.parse(atob(this.contents.docsraw)), ...JSON.parse(atob(this.contents.docsseance))]
        let ids = this.files.map(o => o.id)
        this.files = this.files.filter(({id}, index) => !ids.includes(id, index + 1))
        
        this.files_render = this.files.map((file)=>{
            let name = file["nom"]
            let ext = file["nom"].split(".")[file["nom"].split(".").length-1]
            if(name.length > 32){
                name = name.substr(0, 29) + "." + ext
            }
            return <div key={file["nom"]} className="filename" onClick={() => this.openFile(file["nom"])}>{name}</div>
        })

        this.openFile = this.openFile.bind(this)
    }

    openFile(name){
        let file_path = "EDFiles/" + encodeURI(name)
        window.api.open_file(file_path)
    }

    render(){
        return (
            <div className="MatiereHomework">
                <div className="Matiere">{this.matiere}</div>
                <div className="Prof">{this.contents["prof"]}</div>
                <div className="Content">
                    <div className="toDO" dangerouslySetInnerHTML={{ __html: atob(this.contents["contenu"]).replaceAll("http", "http").replaceAll("href", "value")} }/>
                    {
                        atob(this.contents["cseance"]).length > 0 &&
                        <div className="ContenuDS">
                            <div className="Title">Contenu de séance: </div>
                            <div className="content" dangerouslySetInnerHTML={{ __html: atob(this.contents["cseance"]).replaceAll("http", "http").replaceAll("href", "value")}} />
                        </div>
                    }
                    {
                        this.files.length > 0 &&
                        <div className="Files">
                            <div className="Title">Fichiers:</div>
                            <div className="content">
                                {this.files_render}
                            </div>
                        </div>
                    }
                </div>
            </div>
        )
    }
}

export default MatiereHomework;