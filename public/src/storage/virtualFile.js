const fs = require('fs');

class virtual_file{
    constructor(props){
        this.file_path = props.path
    }

    write(content){
        fs.writeFileSync(this.file_path, content)
    }

    read(){
        return fs.readFileSync(this.file_path)
    }

    exist(){
        return fs.existsSync(this.file_path)
    }

    get path(){
        return this.file_path
    }
}

module.exports.virtual_file = virtual_file