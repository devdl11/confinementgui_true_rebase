const electron = require("electron")

class getHomeWorkByDate{
    constructor(props){
        this.ed_inst_get = props.getter
    }

    build(){
        return async (data, callback) => {
            if(this.ed_inst_get() === null){
                electron.app.quit()
            }else{
                await this.ed_inst_get().getHomeWorkByDate(data, callback)
            }
        }
    }
}

module.exports.getHomeWorkByDate = getHomeWorkByDate