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
            <input type="button" onClick={() => {this.props.callBackClick(this.props.ECallBackArg)}} className="MenuButton w-36 rounded-md p-1 shadow-md bg-gray-50 dark:bg-gray-800  cursor-pointer" ref={this.myref} value={this.title}></input>
        )
    }
}

export default MenuButton;