
// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/";

// MongoClient.connect(url, { useNewUrlParser: true },function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("samplenodedb");
//   var myobj = { name: "sample collection", age : "20" };
//   dbo.collection("persons").insertOne(myobj, function(err, res) {
//     if (err) throw err;
//     console.log("1 document inserted"+res.insertedCount);
//     db.close();
//   });
// });

// mongoose working -----------------------------
var mongoose = require('mongoose');
var Promise = require("bluebird");
// var bcrypt = require('bcrypt');

var url = "mongodb://localhost:27017/User";
var uniqueValidator = require('mongoose-unique-validator');

mongoose.connect(url,{
    useCreateIndex: true,
    useNewUrlParser: true
  });

  let UserSchema = new mongoose.Schema({
    fullname:{
      type : String,
      required: true, 
      // unique: true
    },
    username:{
  type : String,
  required: true,
   unique: true
    },
    password:{
      type : String,
      required: true 
    //   unique: true
    },
    email:{
      type : String,
      required: true, 
      unique: true
    },
    gender:{
      type : String,
      // required: true, 
      // unique: true
    },
    category:{
      type : String,
      // required: true, 
      // unique: true
    },
    dob:{
      type : String,
      // required: true, 
      // unique: true
    },
    about:{
      type : String,
      // required: true, 
      // unique: true
    },

    friends:{
        names : [{usernames : String}]
    },
    online : Boolean
  
  })
  UserSchema.plugin(uniqueValidator);

// var User = mongoose.model('User',UserSchema);

  Promise.promisifyAll(require("mongoose"));
mongoose.Promise = require('bluebird');

function comparepassword(pass1,pass2,callback){
    if(pass1 === pass2){
      return callback(true);
    }
    else{
      return callback(false);
    }
  }

  
//   UserSchema.statics.authenticate = function (username, password, callback) {
//     User.findOne({ username: username })
//       .exec(function (err, user) {
//         if (err) {
//           return callback(err)
//         } else if (!user) {
//           var err = new Error('User not found.');
//           err.status = 401;
//           return callback(err);
//         }
//         comparepassword(password, user.password, function (result) {
//           if (result === true) {
//             return callback(null, user);
//           } else {
//             return callback();
//           }
//         })
//       });
//   }

UserSchema.statics.authenticate = function (username, password, callback) {
    User.findOne({ username: username })
      .exec(function (err, user) {
        if (err) {
          return callback(err)
        } else if (!user) {
          var err = new Error('User not found.');
          err.status = 401;
          console.log('user not found');
          return callback(err);
        }
        console.log('already pass',password);
        console.log('incoming pass',user.password)

        comparepassword(password, user.password, function (result) {
          if (result === true) {
          console.log('user  found 1');

            return callback(null, user);
          } else {
          console.log('user found 2',result);

            return callback();
          }
        })
      });
  }


//console.log('first');

// module.exports.savetodatabase = function(data,callback){
//     var result = 'false';
//     var newgame = new User(data);
//     newgame.save().then((doc) => {
//         console.log('document saved'+doc);
//         result = 'true'
//         callback(true); 
//     }, (err) => {
          
//         console.log('unable to save some error occured!!!')
//         callback(false); 
//     })

     
// }
var User = mongoose.model('User', UserSchema);
module.exports = User;
// ------mongose working till 59 line
// User.findById('someId')
//     .execAsync()
//     .then(function(){
//         // do stuff
//     })
//     .catch(function(err){
//         // handle error
//     })