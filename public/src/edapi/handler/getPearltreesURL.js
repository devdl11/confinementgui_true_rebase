class getPearltreesURL{
    constructor(props){
        this.ed_inst_get = props.getter
    }

    build(){
        return () => {
           if(this.ed_inst_get() === null){
               return null
           }else{
               return this.ed_inst_get().getPearltreesURL()
           }
        }
    }
}

module.exports.getPearltreesURL = getPearltreesURL