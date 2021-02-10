const electron = require("electron")

class getEDT{
    constructor(props){
        this.ed_inst_get = props.getter
    }

    build(){
        return async (callback) => {
            if(this.ed_inst_get() === null){
                electron.app.quit()
            }else{
                await this.ed_inst_get().getEDT(callback)
            }
        }
    }
}

module.exports.getEDT = getEDT