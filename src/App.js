import './App.css';
import './Login.css';
import './Menu.css';
import React from 'react';
import Menu from "./Menu"
import * as cryp from './crypto';
import Login from "./Login"
import {login as edlog} from "./ed-api"

const electron = window.require('electron');
const remote = electron.remote
const { BrowserWindow } = remote

class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      loaded: false
    }
    this.menush = null
  }

  componentDidMount(){
    cryp.SelfCrypto.__init__(()=>{
      console.log(cryp.SelfCrypto.data)
      if(cryp.SelfCrypto.data === undefined){
        this.menush = <Login/>
        this.setState({
          loaded:true
        })
      }else{
        edlog(cryp.SelfCrypto.data.username, cryp.SelfCrypto.data.password, (result)=>{
          if(result === undefined){
            this.menush = <Login/>
          }
          this.menush = <Menu ed_inst={result}/>
          this.setState({
            loaded:true
          })
        })
      }
    })
  }

  render(){
    return this.menush
  }
  
}

export default App;
