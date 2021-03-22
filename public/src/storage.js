class Storage {
    constructor(opts) {
        this.filename = opts.configName
        this.data = ""
        this.myapp = opts.app
        this.parseDataFile(opts.defaults);
        }

    get(key) {
        return this.data[key];
    }

    set(key, val) {
        this.data[key] = val;
        this.myapp.write_file({name: this.filename, content: JSON.stringify(this.data)})
    }

    parseDataFile(defaults) {
        try {
            this.data = JSON.parse( this.myapp.read_file(this.filename));
        } catch (error) {
            this.myapp.write_file({name: this.filename, content: JSON.stringify(defaults)});
            this.data = defaults;
        }
        // console.log(this.data)
    }
}

module.exports.Storage = Storage