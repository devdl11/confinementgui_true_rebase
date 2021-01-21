import React from 'react';
const electron = require('electron');
const remote = electron.remote
const {dialog} = remote

class Menu extends React.Component{
    constructor(props){
        super(props)
        this.ed_inst = props.ed
    }

    render(){
        return <h1>COucou</h1>
    }
}

export default Menu;