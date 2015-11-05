// var db = require('../dbconnection.js');
var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new mongoose.Schema({
  username: {type: String, required: true},
 // password: {type: String},
  karma: {type: Number, default: 0},
  // access_token: {type: String},
  session: {type: Number, default: 0},
  // explanations: {type: Array, default: []},
  // comments: {type: Array, default: []}
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
