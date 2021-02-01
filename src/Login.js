import './App.css';
import './Menu.css';
import Menu from "./Menu"
import React from 'react';
import {login as edlog} from "./ed-api"
import {SelfCrypto, AppData} from "./crypto"
const electron = require('electron');
const remote = electron.remote
const {dialog} = remote

class Login extends React.Component {
    constructor(props){
        super(props)
        this.username_in = React.createRef()
        this.password_in = React.createRef()
        this.buttonsub = React.createRef()

        this.state = {
            edint: null
        }
        //defined bind
        this.EDlogin = this.EDlogin.bind(this)
    }

    EDlogin(el){
        el.preventDefault()
        let username = String(this.username_in.current.value)
        let password = String(this.password_in.current.value)
        if(username.length < 2 || password.length < 2){
            dialog.showMessageBoxSync({
                type:"warning",
                buttons:["Ok"],
                defaultId:0,
                title:"Erreur",
                message:"Veuillez entrer des identifiants valides!",
                noLink:true
            })
            return
        }
        this.buttonsub.current.disabled = true
        edlog(username, password, (result) => {
            this.buttonsub.current.disabled = false
            if(result === undefined){
                return;
            }
            let res = dialog.showMessageBoxSync({
                type: "question",
                buttons: ["Non", "Oui"],
                titre: "Identifiants",
                message:"Souhaitez-vous enregistrer vos identifiants et bénéficier de la connexion automatique?",
                defaultId: 1,
                noLink: true
            })
            if(res === 1){
                let dat = new AppData("00")
                dat.password = password
                dat.username = username
                dat.pearlURL = result.getPearltreesURL()
                SelfCrypto.data = dat
                SelfCrypto.saveDate()
            }
            this.setState({
                edint: result
            })
        })
        
    }

    render() {
        if(this.state.edint === null){
            return (
                <div className="Login">
                    <div className="titre">Login EcoleDirecte</div>
                    <br/>
                    <div className="content">
                        <label htmlFor="username">Nom d'utilisateur: </label>    
                        <input name="username" maxLength="20" id="username" ref={this.username_in}></input>
                        <br/>
                        <label htmlFor="password">Mot de passe: </label>    
                        <input name="password" maxLength="30" id="password" type="password" ref={this.password_in}></input>
                        <br/>
                        <input id="submit" value="Se connecter" type="button" ref={this.buttonsub} onClick={(el) => {this.EDlogin(el)}}></input>
                    </div>
                </div>
                );
            }else{
                return <Menu ed_inst={this.state.edint}/>
        }
    }
}

export default Login;