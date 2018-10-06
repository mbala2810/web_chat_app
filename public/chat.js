var send_user;
var send_user_image;
var send_name;
var isgroup;
function clickfunc(file){
	console.log("hello");
		if(file == 'avatar.jpg')
			$('#clickImage').attr('src', file);
		else
			$('#clickImage').attr('src', 'image/' + file);
		$(".popup-overlay-image, .popup-content-image").addClass('active');
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
	console.log(document.getElementById(id).style.backgroundColor);
	if(document.getElementById(id).style.backgroundColor == "rgb(36, 242, 36)"){
		var chatbar = document.getElementsByClassName('user');
		for(var i = 1; i < chatbar.length; i++){
			if(chatbar[i].id == id){
				if(i % 2 == 0)
					chatbar[i].style.backgroundColor = "#81BEF7";
				else {
					chatbar[i].style.backgroundColor = "#81DAF5" ;
				}
				break;
			}
		}
	}
	var a = id.split('_');
	send_user = a[0];
	send_user_image = a[1];
	send_name = a[2];
	isgroup = a[3];
	document.getElementById('send_user').innerHTML = '<b>' + send_name + '</b>';
	if(send_user_image == "")
		$('#sendUserImage').attr('src', 'avatar.jpg');
	else
		$('#sendUserImage').attr('src', 'image/' + send_user_image);

	var getChatsObject = {};
	getChatsObject.senderId = username;
	getChatsObject.receiverId = send_user;
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
			var msg = document.getElementById("chatroom");
			msg.scrollTop = msg.scrollHeight;
        },
        error: function (xhr, status, error) {
            console.log('Error: ' + error.message);
        },
    });


}
function addUserToDiv(div, username, filename, name, isGroup){
	var id = username + "_" + filename + "_" + name + "_" + isGroup;
	var d = document.createElement("div");
	d.setAttribute("id", id);
	d.setAttribute("class", "user");
	d.setAttribute('onclick', 'openChat('+'\"' + id + '\"' +')');
	var img = document.createElement("img");
	img.setAttribute('class', 'avatar1');
	var fname;
	if(filename == ""){
		img.setAttribute('src', './avatar.jpg');
		fname = 'avatar.jpg';
	}
	else {
		img.setAttribute('src', 'image/' + filename);
		fname = filename;
	}
	img.setAttribute('onclick', 'clickfunc('+ '\"'+ fname + '\"' +')');
	d.append(img);
	var s1 = document.createElement("span");
	var feedback = "feedback_" + username;
	s1.setAttribute('id', feedback);
	s1.setAttribute('class', 'feedback');
	var span = document.createElement("span");
	span.setAttribute('class', 'username');
	span.innerHTML = '<b>' + name + '</b>';
	d.append(span);
	d.append(s1);
	div.append(d);
}
function createGroup(){
	var groupName = $('#groupName').val();
	if(groupName == ""){
		alert("Please Enter group name");
		return;
	}
	var selected = [username];
	$('input:checked').each(function() {
	    selected.push($(this).attr('id'));
	});
	console.log(selected);
	var createGroup = {};
	createGroup.groupName = groupName;
	createGroup.users = selected;
	console.log(createGroup);
	$.ajax({
        url: 'http://localhost:4000/createGroup',
        data: createGroup,
        type: 'POST',
        success: function (data) {
			if(data == "Success"){
            	console.log('Success: ');
				var div = $("#user");
				createGroup.filename = "";
				groupData.push(createGroup);
				addUserToDiv(div, groupData.length - 1, "", groupName, 1);
				closeGroupPopup();
			}
			else{
				alert("Group Name already exists! Please choose a new one");
			}
        },
        error: function (xhr, status, error) {
            console.log('Error: ' + error.message);
        },
    });
}
function closeGroupPopup(){
	document.getElementById("groupPopup").style.display = "none";
	$('input:checkbox').removeAttr('checked');
}
function closePopupOverlay(){
	$(".popup-overlay, .popup-content").removeClass('active');
}
function closePopupOverlayImage(){
	$(".popup-overlay-image, .popup-content-image").removeClass('active');
}
function openGroupCreate(id){
	document.getElementById("groupPopup").style.display = "block";

}
$(function() {
	var socket = io.connect('http://localhost:4000');
	var message = $("#message");
	var chatroom = $("#chatroom");
	var send_message = $("#send_message");
	var div = $("#user");
	console.log(groupData);
	$('#OpenImgUpload').click(function(){
			$(".popup-overlay, .popup-content").addClass('active');
			if(profilename == "avatar.jpg"){
				$('#currImage').attr('src', 'avatar.jpg');
			}
			else
				$('#currImage').attr('src', 'image/' + profilename);

	});
	var c = 0;
	for(var i = -1; i < data.length; i++){
		if(i == -1){
			var d = document.createElement("div");
			d.setAttribute("class", "user");
			d.setAttribute('onclick', 'openGroupCreate()');
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
			addUserToDiv(div, data[i].username, data[i].filename, data[i].name , 0);
		}
	}
	for(var i = 0; i < groupData.length; i++){
		addUserToDiv(div, i, groupData[i].filename, groupData[i].username, 1);
	}
	//Emit message
	send_message.click(function(){
		console.log("button clicked");
		var timeStamp = new Date();
		var contents1 = message.val();
		var contents = cutAndJoinContent(message.val());
		chatroom.append("<p class='senderMessage' style = 'float : right' ><b>" + username + "</b><br>" + contents + "<br>" + "<span style = 'float : right; font-size : 0.8vw'>" + timeStamp.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'}) + "</span>" + "<br>" + "</p>" + "<br>");
		var msg = document.getElementById("chatroom");
		msg.scrollTop = msg.scrollHeight;
		document.getElementById("message").value = "";
		console.log(contents1);
		socket.emit('new_message', {"senderId": username,"receiverId": send_user,"contents": contents1,"timeStamp": timeStamp});
		// var feedback = "feedback_" + send_user;
		// document.getElementById(feedback).innerHTML = "";

	});

	//Listen on new_message
	socket.on("newMessage", (params) => {
		const senderId = params.senderId;
		const receiverId = params.receiverId;
		var contents = params.contents;
		var chatTimeStamp = new Date(params.timeStamp);
		var otherId = senderId;
		console.log(chatTimeStamp);
		console.log(params);
		//Get otherId
		if(senderId != username && receiverId != username){
			otherId = receiverId;
		}
		//Get current chatroom
		var currentChatRoom = false;
		if(otherId == send_user){
			currentChatRoom = true;
		}
		console.log(currentChatRoom);
		console.log(contents);
		//Inflate or show popup correspondingly
		if(currentChatRoom){
			var contents = cutAndJoinContent(contents);
			chatroom.append("<p class='receiverMessage' style = 'float:left'><b>" + senderId + "</b><br>" + contents + "<br>" + "<span style = 'float : right; font-size : 0.8vw'>" + chatTimeStamp.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'}) + "</span>" + "<br>" + "</p>" + "<br>");
			var msg = document.getElementById("chatroom");
			msg.scrollTop = msg.scrollHeight;
			console.log("hi");
		} else{
			// TODO:  Show new Message with differnet color pop-up
			var chatbar = document.getElementsByClassName('user');
			console.log(chatbar);
			for(var i = 1; i < chatbar.length; i++){
				var id = chatbar[i].id;
				var id1 = id.split('_');
				if(id1[0] == senderId){
					chatbar[i].style.backgroundColor = "#24f224";
					console.log(id);
					break;
				}
			}
		}
	});

	//Emit typing
	message.bind("keypress", () => {
		socket.emit('typing');
	});

	//Listen on typing
	socket.on('typing', (data) => {
		// var feedback = "feedback_" + data.username;
		// document.getElementById(feedback).innerHTML = "<i>typing...</i>";
		return;
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
