$(function() {
	var socket = io.connect('http://localhost:3000');
	console.log(data);
	var message = $("#message");
	var chatroom = $("#chatroom");
	var feedback = $("#feedback");
	var div = $("#user");
	for(var i = 0; i < data.length; i++){
		if(data[i].username != username) {
			var d = document.createElement("div");
			d.setAttribute("class", "user");
			var span = document.createElement("span");
			span.innerHTML = data[i].name;
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
// window.onbeforeunload = function (e) {
//   var e = e || window.event;
//   //IE & Firefox
//   if (e) {
//     e.returnValue = 'Are you sure?';
//   }
// };
