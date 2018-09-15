var c = 1;
var send_user;
var send_user_image;
var send_name;
function clickfunc(file){
	console.log("hello");
	if(c == 1){
		if(file == 'avatar.jpg')
			$('#clickImage').attr('src', file);
		else
			$('#clickImage').attr('src', 'image/' + file);
		$(".popup-overlay-image, .popup-content-image").addClass('active');
		c = 0;
	}
	else{
		$(".popup-overlay-image, .popup-content-image").removeClass('active');
		c = 1;
	}
}
function cutAndJoinContent(contents){
	var a = "", final = "";
	var l = contents.length;
	if(l < 54){
		return contents;
	}
	for(var i = 0; i < l; i++){
		a += contents[i];
		if(i % 54 == 0 && i != 0){
			final += a + "<br>";
			a = "";
		}
	}
	return final + a;
}
function openChat(id){
	document.getElementById('chatbox').style.display = "block";
	console.log(id);
	var a = id.split('_');
	send_user = a[0];
	send_user_image = a[1];
	send_name = a[2];
	document.getElementById('send_user').innerHTML = '<b>' + send_name + '</b>';
	if(send_user_image == "")
		$('#sendUserImage').attr('src', 'avatar.jpg');
	else
		$('#sendUserImage').attr('src', 'image/' + send_user_image);

	var getChatsObject = {"senderId": "" + username, "receiverId" : "" + send_user};
	// request.get('/allChats').query(getChatsObject).then(res => {
	// 	//inflate all chats here
	// 	console.log("How you doin?")
	// 	console.log(res);
	// })
	var data;
	$.ajax({
        url: 'http://localhost:4000/allChats',
        data: getChatsObject,
        type: 'GET',
        success: function (data) {
            //var allChats = data;
			console.log(data);
            console.log('Success: ');
						//Inflate all chats here
			var numberOfChats = data.length;
			document.getElementById("chatroom").innerHTML = "";
			for(i = 0; i < numberOfChats; i++) {
				var timeStamp = new Date(data[i].timeStamp);
				var contents = cutAndJoinContent(data[i].contents);
				if(data[i].sender == username){
					document.getElementById("chatroom").innerHTML += ("<p class='senderMessage' style = 'float : right' ><b>" + data[i].sender + "</b><br>" + contents + "<br>" + "<span style = 'float : right; font-size : 0.8vw'>" + timeStamp.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'}) + "</span>" + "<br>" + "</p>");
				}else{
					document.getElementById("chatroom").innerHTML += ("<p class='receiverMessage' style = 'float : left' ><b>" + data[i].sender + "</b><br>" + contents + "<br>" + "<span style = 'float : right; font-size : 0.8vw'>" + timeStamp.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'}) + "</span>" + "<br>" + "</p>");
				}
			}
        },
        error: function (xhr, status, error) {
            console.log('Error: ' + error.message);
        },
    });


}
$(function() {
	var socket = io.connect('http://localhost:4000');
	var message = $("#message");
	var chatroom = $("#chatroom");
	var send_message = $("#send_message");
	var div = $("#user");
	var count = 0;
	$('#OpenImgUpload').click(function(){
		if(count == 0) {
			$(".popup-overlay, .popup-content").addClass('active');
			$('#currImage').attr('src', 'image/' + profilename);
			count = 1;
		}
		else {
			$(".popup-overlay, .popup-content").removeClass('active');
			count = 0;
		}
	});
	var c = 0;
	for(var i = -1; i < data.length; i++){
		if(i == -1){
			var d = document.createElement("div");
			d.setAttribute("class", "user");
			var img = document.createElement("img");
			img.setAttribute('class', 'avatar1');
			img.setAttribute('src', 'group.png');
			d.append(img);
			var span = document.createElement("span");
			span.setAttribute('class', 'username');
			span.innerHTML = '<b>' + "Group Conversations" + '</b>';
			d.append(span);
			div.append(d);
			continue;
		}
		if(data[i].username != username) {
			var d = document.createElement("div");
			var id = data[i].username + "_" + data[i].filename + "_" + data[i].name;
			d.setAttribute("id", id);
			d.setAttribute("class", "user");
			d.setAttribute('onclick', 'openChat('+'\"' + id + '\"' +')');
			var img = document.createElement("img");
			img.setAttribute('class', 'avatar1');
			var fname;
			if(data[i].filename == ""){
				img.setAttribute('src', './avatar.jpg');
				fname = 'avatar.jpg';
			}
			else {
				img.setAttribute('src', 'image/' + data[i].filename);
				fname = data[i].filename;
			}
			img.setAttribute('onclick', 'clickfunc('+ '\"'+ fname + '\"' +')');
			d.append(img);
			var s1 = document.createElement("span");
			var feedback = "feedback_" + data[i].username;
			s1.setAttribute('id', feedback);
			s1.setAttribute('class', 'feedback');
			var span = document.createElement("span");
			span.setAttribute('class', 'username');
			span.innerHTML = '<b>' + data[i].name + '</b>';
			d.append(span);
			d.append(s1);
			div.append(d);
		}
	}
	//Emit message
	send_message.click(function(){
		console.log("button clicked");
		var timeStamp = new Date();
		var contents = cutAndJoinContent(message.val());
		chatroom.append("<p class='senderMessage' style = 'float : right' ><b>" + username + "</b><br>" + contents + "<br>" + "<span style = 'float : right; font-size : 0.8vw'>" + timeStamp.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'}) + "</span>" + "<br>" + "</p>" + "<br>");
		socket.emit('new_message', {"senderId": username,"receiverId": send_user,"contents": message.val(),"timeStamp": timeStamp});
		var feedback = "feedback_" + data.username;
		document.getElementById(feedback).innerHTML = "";
		document.getElementById("message").value = "";
	});

	//Listen on new_message
	socket.on("newMessage", (params) => {
		//const params = JSON.parse(_params);
		const senderId = params.senderId;
		const receiverId = params.receiverId;
		var contents = params.contents;
		var chatTimeStamp = new Date(params.timeStamp);
		console.log(chatTimeStamp);
		console.log(params);
		var contents = cutAndJoinContent(contents);
		chatroom.append("<p class='receiverMessage'><b>" + senderId + "</b><br>" + contents + "<br>" + "<span style = 'float : right; font-size : 0.8vw'>" + chatTimeStamp.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'}) + "</span>" + "<br>" + "</p>" + "<br>");
	});

	//Emit typing
	message.bind("keypress", () => {
		socket.emit('typing');
	});

	//Listen on typing
	socket.on('typing', (data) => {
		var feedback = "feedback_" + data.username;
		document.getElementById(feedback).innerHTML = "<i>typing...</i>";
	});

});
var profilename;
function update() {
	for(var i = 0; i < data.length; i++){
		if(data[i].username == username) {
			if(data[i].filename != "") {
				profilename = data[i].filename;
				$('#OpenImgUpload').attr('src', 'image/' + data[i].filename);
				$('#currImage').attr('src', 'image/' + data[i].filename);
			}
			else{
				profilename = "avatar.jpg";
			}
			break;
		}
	}
}

// window.onbeforeunload = function (e) {
//   var e = e || window.event;
//   //IE & Firefox
//   if (e) {
//     e.returnValue = 'Are you sure?';
//   }
// };
