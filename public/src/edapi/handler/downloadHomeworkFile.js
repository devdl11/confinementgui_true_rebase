class downloadHomeworkFile{
    constructor(props){
        this.ed_inst_get = props.getter
    }

    build(){
        return async (filedata) => {
            return new Promise((resolve, reject)=>{
                if(this.ed_inst_get() === null){
                    resolve(500)
                }else{
                    this.ed_inst_get().downloadHomeworkFile(filedata, (result)=>{
                        resolve(result)
                    })
                }
            })
        }
    }
}

module.exports.downloadHomeworkFile = downloadHomeworkFile