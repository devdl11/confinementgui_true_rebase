const electron = require("electron")

class getEDT{
    constructor(props){
        this.ed_inst_get = props.getter
    }

    build(){
        return async () => {
            return new Promise((resolve, reject)=>{
                if(this.ed_inst_get() === null){
                    electron.app.quit()
                }else{
                    this.ed_inst_get().getEDT((result)=>{
                        resolve(result)
                    })
                }
            })
        }
    }
}

module.exports.getEDT = getEDT