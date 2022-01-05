class get_file{
    constructor(props){
        this.storage = props.storage
    }

    build(){
        return async (args) => {
            return await this.storage.get_files_by(args)
        }
    }
}

module.exports.get_file = get_file