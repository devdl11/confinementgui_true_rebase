const electron = require("electron")

class getHomeWorkByDate{
    constructor(props){
        this.ed_inst_get = props.getter
    }

    build(){
        return async (data) => {
            return new Promise((resolve, reject)=>{
                if(this.ed_inst_get() === null){
                    electron.app.quit()
                }else{
                    this.ed_inst_get().getHomeWorkByDate(data, (result)=>{
                        resolve(result)
                    })
                }
            })
            
        }
    }
}

module.exports.getHomeWorkByDate = getHomeWorkByDate