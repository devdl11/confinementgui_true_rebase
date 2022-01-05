import './App.css';
import './Login.css';
import './Menu.css';
import './tailwind.output.css';
import React from 'react'
import Menu from "./Menu"
import Loading from "./Loading"
import Login from "./Login"

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loaded: false
    }
    this.menush = <Loading />
  }

  componentDidMount() {
    (async () => {
      let menut = await window.api.getStartMenuType()
      if (!menut) {
        this.menush = <Login />
        this.setState({
          loaded: true
        })
      } else {
        let result = await window.api.runAutoLogin()
        if (!result) {
          this.menush = <Login />
          this.setState({
            loaded: true
          })
        } else {
          
          let dt = await window.api.getEDData()
          this.menush = <Menu ed_inst={dt} />
          this.setState({
            loaded: true
          })
        }

      }
    })()
  }

  render() {
    return this.menush
  }

}

export default App;
