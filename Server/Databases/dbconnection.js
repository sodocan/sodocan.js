var mongoose = require('mongoose');

// The production and staging servers each have their own database URI
// defined in the server's environmental variable MONGOLAB_URI. For
// testing on the local computer, the database stored at the localhost
// is used instead.
var dbURI = process.env.MONGOLAB_URI || 'mongodb://localhost/sodocandb';
mongoose.connect(dbURI);
var db = mongoose.connection;

// Will keep re-trying every 5 seconds until it successfully connects
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
