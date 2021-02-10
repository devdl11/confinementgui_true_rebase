class downloadHomeworkFile{
    constructor(props){
        this.ed_inst_get = props.getter
    }

    build(){
        return async (filedata, callback) => {
            if(this.ed_inst_get() === null){
                callback(500)
            }else{
                await this.ed_inst_get().downloadHomeworkFile(filedata, callback)
            }
        }
    }
}

module.exports.downloadHomeworkFile = downloadHomeworkFile