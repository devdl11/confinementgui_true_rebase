import './App.css';
import './Login.css';
import './Menu.css';
import React from 'react'
import Menu from "./Menu"
import Loading from "./Loading"
import * as cryp from './crypto';
import Login from "./Login"
const {login} =  require("./ed-api")
const electron = window.require('electron');
const remote = electron.remote
const { BrowserWindow } = remote

class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      loaded: false
    }
    this.menush = <Loading/>
  }

  componentDidMount(){
    cryp.SelfCrypto.__init__(()=>{
      if(cryp.SelfCrypto.data === undefined){
        this.menush = <Login/>
        this.setState({
          loaded:true
        })
      }else{
        login(cryp.SelfCrypto.data.username, cryp.SelfCrypto.data.password, (result)=>{
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
