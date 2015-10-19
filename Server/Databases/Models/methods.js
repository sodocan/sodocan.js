var db = require('../dbconnection.js');
var testObjs = require('./dummyData').methodsData;

var MethodSchema = new db.Schema({
  project: {type: String, required: true, index: true},
  functionName: {type: String, required: true},
  group: {type: String},
  reference: db.Schema.Types.Mixed,
  explanations: db.Schema.Types.Mixed,
});

MethodSchema.index({project: 1, functionName: 1});
var methodsModel =  db.model('methods', MethodSchema);


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
