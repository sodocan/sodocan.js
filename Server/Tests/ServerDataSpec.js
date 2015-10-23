// Original package.json line
//"test": "node Server/index.js & ./node_modules/.bin/mocha --bail --reporter nyan Server/Tests/ServerDataSpec.js; pkill -n node;"

var mongoose = require('mongoose');
var expect = require('chai').expect;
var request = require('request');
var helpers = require('./../Utilities/helpers.js');
var testCases = require('./testCases.js');
var db = require('../Databases/dbconnection.js');
var db = require('../Databases/dbconnection.js');
var methodsDB = require('../Databases/Models/methods.js');

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

// Need this log function because test environment has different
// global scope as the one the server is running on
global.log = function() {
  var start;
  if (arguments.length > 1 && typeof arguments[0] === 'string') {
    var header = arguments[0];
    var addToFront = false;
    while (header.length < 25) {
      if (addToFront) {
        header = '*' + header;
      } else {
        header += '*';
      }
      addToFront = !addToFront;
    }
    console.log(header);
    start = 1;
  } else {
    console.log('***********LOG***********');
    start = 0;
  }
  for (var i = start; i < arguments.length; i++) {
    console.log(arguments[i]);
  }
  console.log('*************************');
};


/*
methodsDB.find({project: 'testProj'}).exec(function(){
  log('find was called');
});

//log('remove about to be run');
methodsDB.remove({project: 'testProj'}, function(err) {
  log('callback inside mongoose remove ran');
  if (err) {
    console.error(err)
  } else { */

// before(function(done) {

// });


describe("Server", function() {

  before(function (done) {

    var removeTestData = function() {
      methodsDB.remove({project: 'testProj'}, function(err) {
        if (err) {
          log('Mongo remove testProj error', err);
        } else {
          done();
        }
      });
    };

    if (!mongoose.connection.db) {
      db.on('connected', function() {
        removeTestData();
      });
    } else {
      removeTestData();
    }
  });

  describe("Server helper functions", function() {

    var parsePathCases = testCases.parsePathCases;

    for (var path in parsePathCases) {
      var expectedObj = parsePathCases[path];
      it("should parse path " + path, function() {
        var returnedObj = helpers.parseApiPath(path);
        expect(returnedObj).to.deep.equal(expectedObj);
      });
    }

    it("should convert parser output objects to the DB form", function() {
      var convertFormCase = testCases.convertFormCase;
      var actualForm = helpers.convertToDBForm.apply(null, convertFormCase.inputs);
      expect(actualForm).to.deep.equal(convertFormCase.expectedOutput);
    });

  });

  describe("Server API", function() {

    var parserPostCases = testCases.parserPostCases;
    var parserPostExpectedReturns = testCases.parserPostExpectedReturns;

    var postACase = function(i) {
      it("should post skeleton json #" + i, function(done) {
        log('parserPostCase ' + i, parserPostCases[i]);
        var options = {
          'method': 'POST',
          'uri': 'http://localhost:3000/create',
          'json': parserPostCases[i]
        };

        request(options, function(error, res, body) {
          console.log('case ' + i);
          expect(res.statusCode).to.equal(202);

          methodsDB.find({project: 'testProj'}).sort({functionName: 1}).lean().exec(function(err, references) {
            if (err) {
              console.error(err);
            } else {
              log('object type', typeof references[0]);
              var references = JSON.parse(JSON.stringify(referencesOriginal));
              for (var j = 0; j < references.length; j++) {
                delete references[j]['_id'];
              }

              expect(references).to.deep.equal(parserPostExpectedReturns[i]);
              done();
            }
          });

        });
      });
    };

    for (var i = 0; i < parserPostCases.length; i++) {
      postACase(i);
    }

    it ('stuff', function(done) {
      var options = {
        'method': 'GET',
        'uri': 'http://localhost:3000/api/sodocan',
      };

      request(options, function(error, response, body) {
        if (error) {
          console.error(error);
        }
        log('response body', body);
        done();
      });

    });
  });
});

// describe("Posts from parser", function() {

//   beforeEach(function () {
//   });


    // request(options, function(error, res, body) {
    //   db.knex('users')
    //     .where('username', '=', 'Svnh')
    //     .then(function(res) {
    //       if (res[0] && res[0]['username']) {
    //         var user = res[0]['username'];
    //       }
    //       expect(user).to.equal('Svnh');
    //       done();
    //     }).catch(function(err) {
    //       throw {
    //         type: 'DatabaseError',
    //         message: 'Failed to create test setup data'
    //       };
    //     });
    // });

    //   var parserPostCases = testCases.parserPostCases;

    //   for (var i = 0; i < parserPostCases.length; i++) {
    //     it("should parse path " + path, function() {
    //       var options = {
    //         'method': 'POST',
    //         'uri': 'http://localhost:3000/create',
    //         'json': parserPathCases[i]
    //       };

    //       request(options, function(error, res, body) {
    //         expect(res.statusCode).to.equal(202);
    //       });
    //     });
    //   }

    //   it("should convert parser output objects to the DB form", function() {
    //     var convertFormCase = testCases.convertFormCase;
    //     var actualForm = helpers.convertToDBForm.apply(null, convertFormCase.inputs);
    //     expect(actualForm).to.deep.equal(convertFormCase.expectedOutput);
    //   });
    // });
  // }
// });

