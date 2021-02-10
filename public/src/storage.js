const { ipcRenderer} = require('electron')

class Storage {
    constructor(opts) {
        this.filename = opts.configName
        this.data = ""
        this.renderer = opts.renderer
        this.parseDataFile(opts.defaults);
        }

    get(key) {
        return this.data[key];
    }

    set(key, val) {
        this.data[key] = val;
        ipcRenderer.send("write_file", {name: this.filename, content: JSON.stringify(this.data)})
    }

    async parseDataFile(defaults) {
        console.log(this.renderer)
        try {
            this.data = JSON.parse( await ipcRenderer.invoke("read_file", this.filename));
        } catch (error) {
            ipcRenderer.send("write_file", {name: this.filename, content: JSON.stringify(defaults)});
            this.data = defaults;
        }
    }
}

module.exports.Storage = Storage