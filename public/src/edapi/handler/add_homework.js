class add_homework{
    constructor(props){
        this.storage = props.storage
    }

    build(){
        return async (args) => {
            return await this.storage.register_homework(args)
        }
    }
}

module.exports.add_homework = add_homework