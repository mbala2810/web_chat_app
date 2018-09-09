$(function() {
    if(msg == "no error"){
        document.getElementById("error").innerHTML = "";
        window.history.pushState("", "", '/signup');
    }
    else {
        document.getElementById("error").innerHTML = msg;
        window.history.pushState("", "", '/signup');
    }
});
