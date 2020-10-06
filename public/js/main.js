function mainTest() {
    console.log("Main test speaking!");
}
function generatePasswd(){
    //console.log("Generating password...");
    var length = 22;
    var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    document.getElementById("password").value=retVal;
}
