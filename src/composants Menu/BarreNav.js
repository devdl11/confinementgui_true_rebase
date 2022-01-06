import React from 'react';
import "./BarreNav.css"
import MenuButton from "./MenuButton"

class BarreNav extends React.Component{
    constructor(props){
        super(props)
        this.name = props.name
        this.state = {
            menu:"F_ED"
        }
        this.menuSelectedCallback = this.props.liftup
        this.menus = {}
        this.OnClickMenuHandler = this.OnClickMenuHandler.bind(this)
        this.OnMenuChange = this.OnMenuChange.bind(this)
    }

    OnMenuChange(element){
        this.menuSelectedCallback(element)
    }

    OnClickMenuHandler(el){
        if(Object.keys(this.menus).includes(this.state.menu)){
            this.menus[this.state.menu].setActivated(true)
        }
        // console.log(el)
        // console.log("nav")
        this.menus[el].setActivated(false)
        this.setState({
            menu:el
        })
        this.OnMenuChange(el)
    }
    
    componentDidMount(){
        this.menus[this.state.menu].setActivated(false)
        this.OnMenuChange(this.state.menu)
    }

    render(){
        return (
            <div className="NavBar float-left">
                <div className="Etiquette">{this.name}</div>
                <div className="ButCont flex flex-col gap-3 justify-center items-center p-4">
                    <MenuButton ETitle="Fichiers ED" callBackClick={this.OnClickMenuHandler} ref={(rf) => this.menus["F_ED"] = rf} ECallBackArg="F_ED"/>
                    {/* <MenuButton ETitle="Fichiers PearlTrees" callBackClick={this.OnClickMenuHandler} ref={(rf) => this.menus["F_PT"] = rf} ECallBackArg="F_PT"/> */}
                    <MenuButton ETitle="Agenda" callBackClick={this.OnClickMenuHandler} ref={(rf) => this.menus["AGND"] = rf} ECallBackArg="AGND"/>
                    <MenuButton ETitle="Planning" callBackClick={this.OnClickMenuHandler} ref={(rf) => this.menus["PLAN"] = rf} ECallBackArg="PLAN"/>
                </div>
            </div>
        )
    }
}

export default BarreNav;