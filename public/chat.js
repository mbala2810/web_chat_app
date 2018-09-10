var c = 1;
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
function openChat(id){
	document.getElementById('chatbox').style.display = "block";
	console.log(id);
	var a = id.split('_');
	var send_user = a[0];
	var send_user_image = a[1];
	var send_name = a[2];
	document.getElementById('send_user').innerHTML = '<b>' + send_name + '</b>';
	if(send_user_image == "")
		$('#sendUserImage').attr('src', 'avatar.jpg');
	else {
		console.log('helo');
		$('#sendUserImage').attr('src', 'image/' + send_user_image);
	}
}
$(function() {
	var socket = io.connect('http://localhost:3000');
	var message = $("#message");
	var chatroom = $("#chatroom");
	var feedback = $("#feedback");
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
				img.setAttribute('src', 'avatar.jpg');
				fname = 'avatar.jpg';
			}
			else {
				img.setAttribute('src', 'image/' + data[i].filename);
				fname = data[i].filename;
			}
			img.setAttribute('onclick', 'clickfunc('+ '\"'+ fname + '\"' +')');
			d.append(img);
			var span = document.createElement("span");
			span.setAttribute('class', 'username');
			span.innerHTML = '<b>' + data[i].name + '</b>';
			d.append(span);
			div.append(d);
		}
	}
	//Emit message
	send_message.click(function(){
		socket.emit('new_message', {message : message.val()});
	});

	//Listen on new_message
	socket.on("new_message", (data) => {
		feedback.html('');
		message.val('');
		chatroom.append("<p class='message'>" + data.username + ": " + data.message + "</p>");
	});

	//Emit typing
	message.bind("keypress", () => {
		socket.emit('typing');
	});

	//Listen on typing
	socket.on('typing', (data) => {
		feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>");
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
