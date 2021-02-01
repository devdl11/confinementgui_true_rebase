import React from 'react';
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
const electron = require('electron');
const remote = electron.remote

class DateRangeSelector extends React.Component{
    constructor(props){
        super(props)
        
        this.now = new Date()
        let year = this.now.getFullYear()
        if (this.now.getMonth() < 8){
            year -= 1
        }

        this.state = {
            startDate: new Date(year, 8, 1),
            endDate: new Date()
        } 
        this.onDateChange = this.onDateChange.bind(this)
    }

    onDateChange(date){
        this.setState({
            startDate: date[0],
            endDate: date[1]
        })
    }

    render(){
        return(
            <div>
                <DatePicker selected={this.state.startDate} onChange={this.onDateChange} startDate={this.state.startDate} endDate={this.state.endDate} selectsRange inline/>
            </div>
            
        )
    }
}

export default DateRangeSelector;