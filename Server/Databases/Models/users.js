// var db = require('../dbconnection.js');
var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new mongoose.Schema({
  username: {type: String, required: true},
 // password: {type: String},
  karma: {type: Number, default: 0},
  access_token: {type: String}
  // explanations: {type: Array, default: []},
  // additions: {type: Array, default: []}
});

UserSchema.plugin(passportLocalMongoose);


/* explanations: [
  {
    entryID, timestamp?, project, functionName, context, additions, upvotes
  }
]

additions: [{
  additionID, timestamp?, project, functionName, context, entryID, upvotes
}]
*/

/*

NOTE: ADD THIS BACK IN WHEN IMPLEMENTING USERS FOR REALZ

UserSchema.methods.comparePasswords = function (candidatePassword) {
  var defer = Q.defer();
  var savedPassword = this.password;
  bcrypt.compare(candidatePassword, savedPassword, function (err, isMatch) {
    if (err) {
      defer.reject(err);
    } else {
      defer.resolve(isMatch);
    }
  });
  return defer.promise;
};

UserSchema.pre('save', function (next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return next();
  }

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) {
      return next(err);
    }

    // hash the password along with our new salt
    // Fix: added null as the 3rd argument
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) {
        return next(err);
      }

      // override the cleartext password with the hashed one
      user.password = hash;
      user.salt = salt;
      next();
    });
  });
});
*/
module.exports = mongoose.model('User', UserSchema);
