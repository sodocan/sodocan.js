var db = require('../dbconnection.js');

var MethodSchema = new db.Schema({
  project: {type: String, required: true},
  methodName: {type: String, required: true},
  group: {type: String},
  reference: {type: Array, default: []},
  crowdEntries: Mixed,
});


var model =  mongoose.model('methods', MethodSchema);

var testObjs = [
  {
    project: 'sodocan',
    methodName: 'makeSkele',
    reference:
      [
        {
          params: '(collection, iteratee, callback)', //'(collection,iterattee,callback)'
          output: 'String'
        }
      ],
    crowdEntries: {
      descriptions: [
        {
          text:'efa',
          votes: 10,
          entryID: 123,
          additions: [
            {
              text: 'asdfsds',
              votes: 3,
              additionID: 12
            }
          ]
        },
         {
          text:'asdfds',
          votes: 12,
          entryID: 124,
          additions: [
            {
              text: 'asdf',
              votes: 3,
              additionID: 11
            }
          ]
        }
      ],
      examples: [
        {
          text:'asdfds',
          votes: 12,
          entryID: 125,
          additions: [
            {
              text: 'asdf',
              votes: 3,
              additionID: 10
            }
          ]
        }
      ],
      tips: [
        {
          text:'asgsrdgdrgsdgdfds',
          votes: 12,
          entryID: 104,
          additions: [
            {
              text: 'rere',
              votes: 3,
              additionID: 129
            }
          ]
        }
      ]
    }
  },
  {
    project: 'sodocan',
    methodName: 'makeItPretty',
    reference:
      [
        {
          params: '(ugly)', //'(collection,iterattee,callback)'
          output: 'Object'
        }
      ],
    crowdEntries: {
      descriptions: [
        {
          text:'efa',
          votes: 14,
          entryID: 1223,
          additions: [
            {
              text: 'asdf',
              votes: 3,
              additionID: 13
            }
          ]
        },
         {
          text:'bvb',
          votes: 12,
          entryID: 128,
          additions: [
            {
              text: 'asdf',
              votes: 3,
              additionID: 14
            }
          ]
        }
      ],
      examples: [
        {
          text:'asdfds',
          votes: 12,
          entryID: 115,
          additions: [
            {
              text: 'asdf',
              votes: 3,
              additionID: 11
            }
          ]
        }
      ],
      tips: [
        {
          text:'asgsrdgdrgsdgdfds',
          votes: 12,
          entryID: 154,
          additions: [
            {
              text: 'rere',
              votes: 3,
              additionID: 125
            }
          ]
        }
      ]
    }
  }
];

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
9. api/sodocan/ref/makePretty/descriptions/entryID-128/all
*/

module.exports = model;
