const fs = require('fs');
const path = require('path')
const {virtual_file} = require("./virtualFile")

class virtual_directory{
    constructor(props){
        this.directory_path = props.path
        this.isValid = fs.existsSync(this.directory_path)
        if (!this.isValid && props.force){
            fs.mkdirSync(this.directory_path)
            this.isValid = true
        }else{
            this.isValid = fs.lstatSync(this.directory_path).isDirectory()
        }
    }

    getFilesList(){
        if(!this.isValid){
            return null
        }
        return Array.from(fs.readdirSync(this.directory_path, {withFileTypes: true}), (val, _) => val.name)
    }

    getFile(filename){
        if(!this.isValid || typeof filename != 'string' || !this.getFilesList().includes(filename)){
            return null
        }
        return new virtual_file({
            path: path.join(this.directory_path, filename)
        })
    }

    createFile(filename){
        if(!this.isValid || typeof filename != "string" || this.getFilesList().includes(filename)){
            return null
        }
        let fpath = path.join(this.directory_path, filename)
        if(!fpath.includes(this.directory_path)){
            fpath = path.join(this.directory_path, path.basename(fpath))
        }
        fs.closeSync(fs.openSync(fpath, "w"))
        return new virtual_file({
            path:fpath
        })
    }
}

module.exports.virtual_directory = virtual_directory