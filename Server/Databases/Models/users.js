var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

// Define schema of for each user object in database.
// username is required when new user is inserted, or will throw error
// If karma and session are not defined when new user is inserted,
// their values will default to 0
var UserSchema = new mongoose.Schema({
  username: {type: String, required: true},
  karma: {type: Number, default: 0},
  session: {type: Number, default: 0},
});

// Allows authentication via Passport to be integrated with
// the users database
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
