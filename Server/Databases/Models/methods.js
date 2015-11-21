var mongoose = require('mongoose');

// Define the schema for each method object in the methods database.
// project and functionName are required to be defined when a new
// object is inserted, or will throw error
var MethodSchema = new mongoose.Schema({
  // project is indexed, so lookups for a particular project
  // are in constant time, rather than linear time
  project: {type: String, required: true, index: true},
  functionName: {type: String, required: true},
  group: {type: String},
  username: {type: String},
  timestamp: mongoose.Schema.Types.Mixed,
  reference: mongoose.Schema.Types.Mixed,
  explanations: mongoose.Schema.Types.Mixed,
});
// Defines complex index, so lookups for any combination of
// project and functionName is constant time
MethodSchema.index({project: 1, functionName: 1});

var methodsModel =  mongoose.model('Method', MethodSchema);

module.exports = methodsModel;
