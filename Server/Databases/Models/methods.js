var db = require('../dbconnection.js');
console.log('methodsDB getting created');
var mongoose = require('mongoose');
var testObjs = require('./dummyData').methodsData;

var MethodSchema = new mongoose.Schema({
  project: {type: String, required: true, index: true},
  functionName: {type: String, required: true},
  group: {type: String},
  reference: mongoose.Schema.Types.Mixed,
  explanations: mongoose.Schema.Types.Mixed,
});
console.log('schema got created');
MethodSchema.index({project: 1, functionName: 1});
var methodsModel =  mongoose.model('methods', MethodSchema);


var insertObjs = function(objs){ //inserts dummy data
  for(var i = 0; i < objs.length; i++){
    methodsModel.findOneAndUpdate({
      project: objs[i].project,
      functionName: objs[i].functionName
    }, objs[i], {upsert: true},
    function(){
    });
  }
};
insertObjs(testObjs);

/*
Test cases:
1. api/sodocan
2. api/sodocan/ref/makeSkele
3. api/sodocan/examples
4. api/sodocan/descriptions/all
5. api/sodocan/descriptions/1/10
6. api/sodocan/all/all
7. api/sodocan/tips/descriptions
8. api/sodocan/all/tips/0
9. api/sodocan/ref/makeItPretty/descriptions/entryID-128/all
*/

module.exports = methodsModel;
