var expect = require('chai').expect;
var request = require('request');
var helpers = require('./../Utilities/helpers.js');
var testCases = require('./testCases.js');
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

methodsDB.find({project: 'testProj'}).exec(function(){
  log('find was called');
});


//log('remove about to be run');
methodsDB.remove({project: 'testProj'}, function(err) {
  log('callback inside mongoose remove ran');
  if (err) {
    console.error(err)
  } else {

    describe("Server helper functions", function() {

      beforeEach(function () {
      });

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

    describe("Posts from parser", function() {

      beforeEach(function () {
      });

      // var options = {
      //   'method': 'POST',
      //   'uri': 'http://127.0.0.1:4568/signup',
      //   'json': {
      //     'username': 'Svnh',
      //     'password': 'Svnh'
      //   }
      // };

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

      var parserPostCases = testCases.parserPostCases;

      for (var i = 0; i < parserPostCases.length; i++) {
        it("should parse path " + path, function() {
          var options = {
            'method': 'POST',
            'uri': 'http://localhost:3000/create',
            'json': parserPathCases[i]
          };

          request(options, function(error, res, body) {
            expect(res.statusCode).to.equal(202);
          });
        });
      }

      it("should convert parser output objects to the DB form", function() {
        var convertFormCase = testCases.convertFormCase;
        var actualForm = helpers.convertToDBForm.apply(null, convertFormCase.inputs);
        expect(actualForm).to.deep.equal(convertFormCase.expectedOutput);
      });
    });
  }
});

