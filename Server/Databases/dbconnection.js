console.log('dbconnection has run');
var mongoose = require('mongoose');

var dbURI = process.env.MONGOLAB_URI || 'mongodb://localhost/sodocandb';
mongoose.connect(dbURI);
var db = mongoose.connection;

db.on('error', function(err) {
  console.error('Mongoose connection error, retrying in 5 seconds.');
  setTimeout(function() {
    mongoose.connect(dbURI);
  }, 5000);
});

db.on('connected', function() {
  console.log('Mongoose connection open to ' + dbURI);
});
db.on('disconnected', function() {
  console.log('Mongoose connection disconnected.');
});

module.exports = mongoose;