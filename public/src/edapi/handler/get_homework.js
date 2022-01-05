class get_homework{
    constructor(props){
        this.storage = props.storage
    }

    build(){
        return async (args) => {
            return await this.storage.get_homework_by(args)
        }
    }
}

module.exports.get_homework = get_homework