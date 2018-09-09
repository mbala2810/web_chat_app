var express = require('express');
var bodyparser = require('body-parser');
var session = require('express-session');
//Mongoose for connecting to mongodb
var mongoose = require('mongoose');

//For generating md5 hash of password
var crypto = require('crypto');
var app = express();
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
app.use(session({secret: 'ssshhhhh'}));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended : true}));
app.set('view engine', 'ejs');

var Schema = mongoose.Schema({
	name : String,
	college : String,
	username : String,
	password : String
});
var User = mongoose.model("User", Schema);
app.use(express.static('public'));

app.get('/', function(req, res) {
	res.render('login', {msg : "no error"});
});
app.get('/signup', function(req, res) {
	res.render('signup', {msg:"no error"});
});
app.get('/login', function(req, res) {
	res.render('login', {msg: "no error"});
});
var sess;
app.get('/chat', function(req, res) {
	sess = req.session;
	if(sess.username) {
		res.render('index', {username: sess.username});
	}
	else{
		res.render('login', {msg : "Please login to continue"});
	}
});
app.post('/login', function(req, res){
	req.body.password = crypto.createHash('md5').update(req.body.password).digest('hex');
	User.find({username:req.body.username}, function(err, data){
		if(err){
			res.send(err);
			return;
		}
		if(data.length >= 1) {
			res.render('signup', {
				msg : "Username already taken!"
			});
		}
		else {
			console.log(req.body);
			var myData = new User(req.body);
		    myData.save()
		        .then(item => {
		            res.render('login', {msg : "no error"});
		        })
		        .catch(err => {
		            res.status(400).send("Unable to save to database");
				});
		}
	});
});
app.post('/chat', function(req, res){
	req.body.password = crypto.createHash('md5').update(req.body.password).digest('hex');
	User.find({username:req.body.username, password:req.body.password}, function(err, data){
		if(err){
			res.send(err);
			return;
		}
		if(data.length >= 1) {
			sess = req.session;
			sess.username = req.body.username;
			User.find({}, function(err, data){
				res.render('index', {username: sess.username, data: data});
			});
		}
		else {
			req.url = '/login';
			res.render('login', {msg : "Username or Password maybe incorrect!"});
		}
	});
});
app.post('/logout', function(req, res){
	req.session.destroy(function(err) {
		if(err) {
		    console.log(err);
		} else {
		    res.redirect('/');
		}
	});
});
server = app.listen(3000);

var io = require('socket.io')(server);

io.on('connection', (socket) => {
	console.log('New user connected')

		//default username
		if(sess) {
			socket.username = sess.username;
		}
		// listen on change_username
		// socket.on('change_username', (data) => {
		// 	console.log(data);
		// 	socket.username = data.username;
		// });

	//listen on new_message
	socket.on('new_message', (data) => {
		//broadcast the new message
		io.sockets.emit('new_message', {message : data.message, username : socket.username});
	});

	//listen on typing
	socket.on('typing', (data) => {
		socket.broadcast.emit('typing', {username : socket.username});
	});
});
