class add_file{
    constructor(props){
        this.storage = props.storage
    }

    build(){
        return async (args) => {
            return await this.storage.register_files(args)
        }
    }
}

module.exports.add_file = add_file