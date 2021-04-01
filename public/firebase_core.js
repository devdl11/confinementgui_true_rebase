/* eslint-disable no-undef */
window.onload = function(){
    init()
}
 
async function init(){
    let result = await window.api.getConfig()
    firebase.initializeApp(result)

    firebase.auth().signInWithEmailAndPassword("customguiapp@internal.dl", "ASuperCustomguiapp@4321").then(function(callbck){
        console.log("[MAIN INFO] Logged!")
        window.api.send("firebase_inited", true)
      }).catch(function(e){
        console.log("[MAIN INFO] Error login!")
        window.api.send("firebase_inited",false)
      })
    
}

window.api.on("get-license", function(prenom, nom){
    prenom = prenom[0].toUpperCase() + prenom.toLowerCase().substr(1)
    nom = nom[0].toUpperCase() + nom.toLowerCase().substr(1)

    const payload = prenom + " " + nom
    let ref = firebase.database().ref("licenses")
    
    ref.child(payload).get().then(function(snap){
        if(!snap.exists()){
            window.api.send("license_result", -2)
        }else{
            window.api.send("license_result", snap.val())
        }
    })
    .catch(function(error){
        window.api.send("license_result", -2)
    });
})

window.api.on("set-used", function(p,n,v){
    let prenom = p[0].toUpperCase() + p.toLowerCase().substr(1)
    let nom = n[0].toUpperCase() + n.toLowerCase().substr(1)

    const payload = prenom + " " + nom
    let ref = firebase.database().ref("licenses/" + payload)
    
    ref.update({
        actif: true
    })
})

window.api.on("get-status", function(){
    firebase.database().ref("status").get().then(function(snap){
        if(!snap.exists()){
            window.api.send("on-status", undefined)
        }else{
            window.api.send("on-status",snap.val())
        }
    })
})