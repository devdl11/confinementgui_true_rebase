import React from 'react';
import DateMenuSelector from "./edAgendaComp/DateMenuSelector"
import DateMenu from "./edAgendaComp/DateMenu"

class EDAgenda extends React.Component{
    constructor(props){
        super(props)
        this.userdata = props.user
        this.state = {
            homeworks:{},
            submenu: undefined
        }
        this.backup = ""
        this.list_h = ""
        
        this.raw_data = []
        this.menus = {}

        this.onMenuClick = this.onMenuClick.bind(this)
        this.getBackOnclick = this.getBackOnclick.bind(this)
    }

    getBackOnclick(){
        this.list_h =this.backup
        this.setState({
            submenu: undefined
        })
    }

    onMenuClick(date, homeworks){
        this.backup = this.list_h
        this.list_h = <DateMenu callback={this.getBackOnclick} date={date} homeworks={homeworks}/>
        this.setState({
            submenu: date
        })
    }

    componentDidMount(){
        
        window.ipcrend.on("take-homeworks", (event, args)=>{
            console.log(args)
            if(args.length === 0){
                this.raw_data = []
                this.list_h = <div className="NoHomeworks">Aucun devoir</div>
            }else if(args.length !== this.raw_data.length){
                this.raw_data = args

                this.menus = {}
                this.list_h = ""

                let dates = []
                args.forEach(element => {
                    if (this.menus[element.date] === undefined){
                        this.menus[element.date] = {}
                    }
                    if (this.menus[element.date][element.matiere] === undefined){
                        this.menus[element.date][element.matiere] = {}
                    }
                    
                    this.menus[element.date][element.matiere][element.prof] = element
                    dates.push(element.date)
                })

                console.log(dates)

                let ids = dates.map(o => o.id)
                dates = dates.filter(({ id }, index) => !ids.includes(id, index + 1))

                // for (let date of Object.keys(args)){
                //     if(!Object.keys(this.menus).includes(date) && Object.keys(args[date]).length > 0){
                //         this.menus[date] = {}
                //     }else if(Object.keys(args[date]).length === 0){
                //         continue
                //     }
                //     for(let mat of Object.keys(args[date])){
                //         if(!Object.keys(this.menus[date]).includes(mat)){
                //             this.menus[date][mat] = args[date][mat]
                //         }
                //     }
                    
                // }

                let keys = Object.keys(this.menus)
                keys.sort((a,b)=>{
                    a = a.split('-').join('');
                    b = b.split('-').join('');
                    return a.localeCompare(b); 
                })
                keys = keys.reverse()

                this.backup = keys.map((key)=>{
                    return <DateMenuSelector callback={this.onMenuClick} key={key} date={key} homeworks={this.menus[key]}/>
                })
            }
            if(this.state.submenu === undefined){
                this.list_h = this.backup
                this.setState({
                    homeworks: args.length
                })
            }
        })
        window.ipcrend.send("get-homeworks", {})
    }

    componentWillUnmount(){
        window.ipcrend.removeAllListeners("take-homeworks")
    }

    render(){
        return (
            <div className="EDAgenda">
               <div className="Barrnav">
                   <div className="Titre">Devoirs Ecole directe</div>
               </div>
               <div className="AllDates">
                    {this.list_h}
               </div>
            </div>
        )
    }
}

export default EDAgenda;