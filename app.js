var express = require('express');
var bodyparser = require('body-parser');
var session = require('express-session');
var cors = require('cors');
//Mongoose for connecting to mongodb
var mongoose = require('mongoose');
var path = require('path');
var multer = require('multer');
var GridFsStorage = require('multer-gridfs-storage');
var Grid = require('gridfs-stream');
var methodOverride = require('method-override');
//For generating md5 hash of password
var crypto = require('crypto');
var app = express();
var mongoURI = 'mongodb://localhost/test';
mongoose.connect(mongoURI);
var db = mongoose.connection;
var fileuploaded;
app.use(session({secret: 'ssshhhhh'}));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended : true}));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(cors());
const conn = mongoose.createConnection(mongoURI);
var sess;
// Init gfs
let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
		fileuploaded = filename;
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });
var Schema = mongoose.Schema({
	name : String,
	college : String,
	username : String,
	password : String,
	filename : String
});

var MessageSchema = mongoose.Schema ({
	sender : String,
	receiver : String,
	contents : String,
	timeStamp : String
});

var GroupSchema = mongoose.Schema({
  username : String,
  members : [String],
  filename : String
});

var User = mongoose.model("User", Schema);
var Message = mongoose.model("Message",MessageSchema);
var Group = mongoose.model("Group",GroupSchema);

const sockets = {};

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
app.get('/image/:filename', function(req, res){
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
    });
});
app.post('/imgUpload', upload.single('file'),function(req, res){
    console.log(sess);
	User.find({username:sess.username}, function(err, data){
		if(err){
			res.send(err);
			return;
		}
		var dbname = 'uploads.files';
		let uploads = mongoose.connection.db.collection(dbname);
		uploads.deleteOne({filename:data[0].filename}, function(err, offer){
			if(err){
				res.send(err);
				return;
			}
        //    console.log(sess.username);
			User.findOneAndUpdate({username:sess.username},{filename:fileuploaded},{upsert:true}, function(err, user){
				if(err){
					res.send(err);
					return;
				}
				else{
					res.redirect('/chat');
				}
			});
		});
	});
});
app.get('/chat', function(req, res) {
	sess = req.session;
	//console.log('hello');

	if(sess.username) {
		currusername = sess.username + "";
		User.find({}, function(err, data){
			if(err){
				console.log(err);
				return;
			}
            Group.find({members:data[0].username}, function(err, data1){
                if(err){
                    console.log(err);
                    return;
                }
                res.render('index', {username: sess.username, data: data, group: data1});
            });
		});
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
		//	console.log(req.body);
			var myData = new User({
				name : req.body.name,
				college : req.body.college,
				username : req.body.username,
				password : req.body.password,
				filename : ""
			});
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
            //console.log("HELLLLAAAAA");
            // console.log(sess);
			currusername = sess.username + "";
			sess.username = req.body.username;
            console.log(sess);
            var data1;
			User.find({}, function(err, data){
				if(err){
					console.log(err);
					return;
				}
                Group.find({members: data[0].username}, function(err, data1){
                    if(err){
                        console.log(err);
                        return;
                    }
                    //console.log(data1);
                    res.render('index', {username: sess.username, data: data, filename : data[0].filename, group : data1});
                });
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
app.get('/allChats',function(req,res){
    var senderId, receiverId;
    var x = req.url.split('=');
    var y = x[1].split('&');
    senderId = y[0];
    receiverId = x[2];
    // console.log(senderId);
    // console.log(receiverId);
    // query here , {"sort" : ['timeStamp', 'asc']}
    Message.find({ $or: [ { sender: senderId, receiver: receiverId } , { sender: receiverId, receiver: senderId} ]}).sort({timeStamp : 1}).exec(function(err,data) {
        if(err){
          res.send(err);
          return;
        }
        else{
        //  console.log(data);
          res.send(data);
          return;
        }
    });
  //Message.find({ $or: [ { senderId: senderId } , { senderId: receiverId } ] }).sort({ timeStamp : 1 })
});
app.post('/createGroup', function(req, res){
    //console.log(req.body);
    var group = new Group({
        username : req.body.groupName,
        members : req.body.users,
        filename : ""
    });
    Group.find({username:req.body.groupName}, function(err, data){
        if(err){
            console.log(err);
            return;
        }
        if(data.length >= 1){
            res.send("Failed");
        }
        else{
            group.save();
            res.send("Success");
        }
    });
    return;
});
server = app.listen(4000);

var io = require('socket.io')(server);

io.on('connection', (socket) => {
	console.log('New user connected')

		//default username
		if(sess) {
			socket.username = sess.username;
            //console.log(sess.username);
		}
    sockets[socket.username] = socket;
    //console.log(sess.username);
		// listen on change_username
		// socket.on('change_username', (data) => {
		// 	console.log(data);
		// 	socket.username = data.username;
		// });

	//listen on new_message
	socket.on('new_message', (params) => {
        //console.log("Inside listener");
    //const params = JSON.parse(_params);
		const senderId = params.senderId;
		const receiverId = params.receiverId;
		const contents = params.contents;
		const chatTimeStamp = params.timeStamp;

		// Have to insert the message into the database.
        var tempMessage = new Message({
          sender : senderId,
          receiver : receiverId,
          contents : contents,
          timeStamp : chatTimeStamp
        });
        tempMessage.save();
		if(sockets[receiverId]){
			const toSocket = sockets[receiverId];
            //console.log("received");
			toSocket.emit('newMessage', params);
		} else{
			console.log("User not connected to socket");
		}
  });

	//listen on typing
	socket.on('typing', (data) => {
		socket.broadcast.emit('typing', {username : socket.username});
	});
});

/*
db.Message.find(
  { $or: [ { senderId: senderId } , { senderId: receiverId } ] }
).sort({ timeStamp : 1 })
*/
