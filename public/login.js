$(function() {
    if(msg == "no error"){
        document.getElementById("error").innerHTML = "";
        window.history.pushState("", "", '/login');
    }
    else {
        document.getElementById("error").innerHTML = msg;
        window.history.pushState("", "", '/login');
    }
});
