import React from 'react';

class MenuButton extends React.Component{
    constructor(props){
        super(props)
        this.title = props.ETitle

        this.myref = React.createRef()
    }
    
    setActivated(st){
        this.myref.current.disabled = !st
    }

    render(){
        return(
            <input type="button" onClick={() => {this.props.callBackClick(this.props.ECallBackArg)}} className="MenuButton" ref={this.myref} value={this.title}></input>
        )
    }
}

export default MenuButton;