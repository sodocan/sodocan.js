var db = require('../dbconnection.js');

var MethodSchema = new db.Schema({
  project: {type: String, required: true},
  methodName: {type: String, required: true},
  group: {type: String, required: true},
  reference: {type: Array, default: []},
  explanation: {type: Array, default: []},
  example: {type: Array, default: []},
  tips: {type: Array, default: []},
});


module.exports = mongoose.model('methods', MethodSchema);
