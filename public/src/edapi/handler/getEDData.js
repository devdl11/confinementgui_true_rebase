class getEDData{
    constructor(props){
        this.ed_inst_get = props.getter
    }

    build(module){
        return () => {
            if(this.ed_inst_get() === null){
                return null
            }else{
                let data = {
                    user_data: this.ed_inst_get().user_data
                }
                return data
            }
        }
    }
}

module.exports.getEDData = getEDData