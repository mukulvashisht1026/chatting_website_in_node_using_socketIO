
const express = require('express');
var bodyParser = require('body-parser')
const socketIO = require('socket.io');
const http = require('http');
var ios = require('socket.io-express-session');
const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');

// var io = require("socket.io")(server);
const app = express();
const path = require('path');
const session = require('express-session')
const publicPath = path.join(__dirname, '../public');
const dbpath = path.join(__dirname,'../databaseoperations/');
console.log(dbpath);
  // console.log(__dirname);
var User = require('../databaseoperations/mongoop.js');
var rooms = [];
const router = express.Router();
const port = process.env.PORT || 3000;
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();
// app.use(express.static(publicPath));
app.use('/login', express.static(path.join(__dirname, '../public/static')));
app.use('/signup', express.static(path.join(__dirname, '../public/static')));
app.use('/profile', express.static(path.join(__dirname, '../public/static')));
app.use('/joinchat', express.static(path.join(__dirname, '../public/static')));
app.use('/chatroom', express.static(path.join(__dirname, '../public/static')));

app.use('/', express.static(path.join(__dirname, '../public/static')));

var cors = require('cors');
// var app = express();
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false
}));

app.set('view engine', 'html');
app.engine('html', require('hbs').__express);

function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    var err = new Error('You must be logged in to view this page.');
    err.status = 401;
    console.log('no session for login')
    return next('you must be logged in to view this page');
  }
}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('join', (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and room name are required.');
    }

    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);

    io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));
    callback();
  });

  socket.on('createMessage', (message, callback) => {
    var user = users.getUser(socket.id);

    if (user && isRealString(message.text)) {
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    }

    callback();
  });

  socket.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id);

    if (user) {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));  
    }
  });

  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
    }
  });
});
// -----------------------------------------------------------


app.get('/', function(req, res) {
  console.log('hello login kro');
  res.redirect('login');
});

app.use('/profile',requiresLogin);
app.get('/profile', function(req, res) {
  console.log('profile page');
  User.find({ _id : req.session.userId },function (err, docs){
    if( err || !docs) {
      console.log("No user found");
  } else {
      // I want to use the foo variable here
      // console.log(docs[0].username)
  res.render('Profileindex.html',{name:docs[0].fullname,category:docs[0].category,email:docs[0].email});
      
  };  
  })
  // console.log(data.schema );
  // console.log(data.username,data.email,data.category);
});


// app.use('/loginafter',requiresLogin);
// app.get('/loginafter',function (req,res){
//   res.status('200').send('logged in');
// });

// router.get('/profile', mid.requiresLogin, function(req, res, next) {
//   req.sendFile('profile.html');
// });
app.use('/logout',requiresLogin);
app.get('/logout', function(req, res, next) {
  console.log('logout is running')
  if (req.session) {
    // delete session object
    console.log('destroying session');
    req.session.destroy(function(err) {
      if(err) {
    console.log('error destroying session')

        return next(err);
      } else {
        console.log('successfull in destroying session')

        return res.redirect('/');
      }
    });
  }

});


// console.log('hello world ',result);
app.post('/createuser',function(req,res){
  console.log('params  : ',req.params);
console.log('body : ',req.body.username);
console.log('query',req.query);
var name = req.params || 'Somebody';
var isCreated = false;
// console.log(name);
User.create({
  username : req.body.username,
  password : req.body.password,
  email : req.body.email,
  fullname : req.body.fullname,
  gender : req.body.gender,
  dob :req.body.dob,
  category : req.body.category,
  about : req.body.aboutuser
}, function (error, user) {
 var isCreated = false;
  console.log(req.body);
  if (error) {
    console.log('error creating');
  // isCreated = false;
    // return next(error);
    return res.send('username  or email already used try another');
  } else {
  // isCreated = true;
  console.log('created user',user);

    console.log(user._id,'--user id')

    req.session.userId = user._id;
    // return res.redirect('/profile');
  }
   res.redirect('profile')
// ,{name:req.body.username,category:req.body.category,email:req.body.email}
});
//===================
// User.savetodatabase(req.body,function (result){
  // console.log(result,'hey brother');
    
// });
});
// app.use('/login1', express.static(__dirname + '../public'));
// app.all(/^\/login$/, function(req, res) { res.redirect('/login'); });

app.get('/signup',function (req,res){
  res.sendFile(path.join(__dirname,'../public/Signupindex.html'));
});
// app.enable('strict routing');

app.get('/login', function(req, res) {
  console.log('hello login kro');
  res.sendFile(path.join(__dirname,'../public/Loginindex.html'));
});

app.get('/joinchat', function(req, res) {
  console.log('hello login kro');
  res.sendFile(path.join(__dirname,'../public/joinchat.html'));
});
app.get('/chatroom', function(req, res) {
  console.log('hello login kro');
  res.sendFile(path.join(__dirname,'../public/chat.html'));
});
// app.get('/template1',function (req,res){
//   res.render('mytemplate.html',{title: 'my title',body : 'mukul body'});
// });

app.post('/login',function (req,res){
  
  //---------------------------
   if (req.body.username && req.body.password) {
    console.log("login is working ");
    User.authenticate(req.body.username, req.body.password, function (error, user) {
      console.log('authentication starts');
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
      console.log('authentication error',error,user);

        return res.status(err.status).send('username or password incorrect!!');
      } else {
        console.log('authentication success');

        req.session.userId = user._id;
        return res.redirect('profile');
      }
    });
  }
  //====++++++++++++++++++++++++  
  
 
});

// app.post('/myaction', function(req, res) {
//   // console.log(req.method)
//   var post_data = req.body;
//   // console.log(post_data);
//   var username = post_data.name;
//   var password = post_data.password;
//   console.log(username+password);
//   res.sendFile(publicPath+'/chat.html');

// });
// io.on('connection', (socket) => {
//   console.log('new user connected');

//   function roomcreated(data){
//     io.sockets.emit('room_created',data.roomname);
// console.log('hjkslfjsdfl')
// }

// socket.on('createroom', (data) => {
//   socket.join(data.roomname);
// console.log(data.roomname,'roomcreated')
// roomcreated(data);
// });
// socket.on('joinroom', (data) => {
//   console.log(io.sockets.adapter.rooms);
//   if(rooms[data.roomname].wieght <= 1){

//     socket.join(data.roomname);
//     console.log(data.roomname,'roomjoined');
//     var obj = {name : data.roomname , wieght : 1}
//     rooms.push(obj);
//     io.to(data.roomname).emit('roomjoined',data.roomname);
    
//   }
//   else {
//     socket.emit('nospace');
//   }
// });
//   socket.on('disconnect',() => {
//     console.log('user was disconnected');
//   });
// });





server.listen(port , () => {
console.log(`server is on ${port}`);
});
