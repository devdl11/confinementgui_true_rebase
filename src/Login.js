import './App.css';
import './Menu.css';
import Menu from "./Menu"
import React from 'react';

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
        this.EDlogin_next = this.EDlogin_next.bind(this)
    }

    async EDlogin_next(username, password){
        let result = await window.api.login(username, password)
        this.buttonsub.current.disabled = false
        if(!result){
            return;
        }
        window.api.save_login_dialog(username, password)
        this.setState({
            edint: await window.api.getEDData()
        })
    }

    EDlogin(el){
        el.preventDefault()
        let username = String(this.username_in.current.value)
        let password = String(this.password_in.current.value)
        if(username.length < 2 || password.length < 2){
            window.api.error_login_dialog()
            return
        }
        this.buttonsub.current.disabled = true
        this.EDlogin_next(username, password)
    }

    render() {
        if(this.state.edint === null){
            return (
                <div className="Login items-center justify-center flex h-screen bg-white">
                    <form className="content grid grid-cols-2 max-w-s gap-4 bg-gray-100 p-5 rounded-md">
                        <h1 className="titre text-center">Login EcoleDirecte</h1>
                        <label htmlFor="username">Nom d'utilisateur: </label>    
                        <input className="bg-transparent border-b-2 border-grey focus:border-black focus:outline-none" name="username" maxLength="20" id="username" ref={this.username_in}></input>
                        <label htmlFor="password">Mot de passe: </label>    
                        <input className="bg-transparent border-b-2 border-grey focus:border-black focus:outline-none" name="password" maxLength="30" id="password" type="password" ref={this.password_in}></input>
                        <input className="rounded-md bg-gray-200 p-1"id="submit" value="Se connecter" type="submit" ref={this.buttonsub} onClick={(el) => {el.preventDefault();this.EDlogin(el)}}></input>
                    </form>
                </div>
                );
            }else{
                return <Menu ed_inst={this.state.edint}/>
        }
    }
}

export default Login;