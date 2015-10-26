// Original package.json line
//"test": "node Server/index.js & ./node_modules/.bin/mocha --bail --reporter nyan Server/Tests/ServerDataSpec.js; pkill -n node;"

var mongoose = require('mongoose');
var expect = require('chai').expect;
var request = require('request');
var reqprom = require('request-promise');
var helpers = require('./../Utilities/helpers.js');
var testCases = require('./testCases.js');
var db = require('../Databases/dbconnection.js');
var methodsDB = require('../Databases/Models/methods.js');

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

// Begin tests
describe("Server", function() {

  // removes test data
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

    // must put 'it' in wrapper function because of asynchonicity
    var parseAPath = function(path) {
      it("should parse path " + path, function(done) {
        var expectedObj = parsePathCases[path];
        var returnedObj = helpers.parseApiPath(path);
        expect(returnedObj).to.deep.equal(expectedObj);
        done();
      });
    };

    for (var path in parsePathCases) {
      parseAPath(path);
    }

    it("should convert parser output objects to the DB form", function(done) {
      var convertFormCase = testCases.convertFormCase;
      var actualForm = helpers.convertToDBForm.apply(null, convertFormCase.inputs);
      expect(actualForm).to.deep.equal(convertFormCase.expectedOutput);
      done();
    });

  });

  describe("Server Post Skeleton", function() {

    var parserPostCases = testCases.parserPostCases;
    var parserPostExpectedReturns = testCases.parserPostExpectedReturns;

    // must put 'it' in wrapper function because of asynchonicity
    var postACase = function(i) {
      it("should post skeleton json #" + i, function(done) {
        //log('parserPostCase ' + i, parserPostCases[i]);
        var options = {
          'method': 'POST',
          'uri': 'http://localhost:3000/create',
          'json': parserPostCases[i]
        };

        request(options, function(error, res, body) {
          expect(res.statusCode).to.equal(202);

          methodsDB.find({project: 'testProj'}).sort({functionName: 1}).lean().exec(function(err, references) {
            if (err) {
              console.error(err);
            } else {
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

  });

  describe("Server API for Client", function() {

    var getValidCases = testCases.getValidCases;
    var getOptions = {
      'method': 'GET'
    };

    // must put 'it' in wrapper function because of asynchonicity
    var getACase = function(path) {
      it('should get data for ' + path, function(done) {
        getOptions.uri = 'http://localhost:3000' + path;
        request(getOptions, function(error, response, body) {
          if (error) {
            console.error(error);
          }
          body = JSON.parse(body);
          expect(Array.isArray(body)).to.be.true;
          for (var j = 0; j < body.length; j++) {
            delete body[j]['_id'];
          }
          expect(body).to.deep.equal(getValidCases[path]);
          done();
        });

      });
    };

    for (var path in getValidCases) {
      getACase(path);
    }

    it('should send 404 when path is invalid', function(done) {
      var getInvalidCases = testCases.getInvalidCases;
      getOptions.resolveWithFullResponse = true;

      // Recursion with promises
      var getNextInvalidCase = function(i) {
        if (typeof path === 'string') {
          expect(false).to.be.true;
          expect(path).to.equal('should send 404');
          return;
        }
        //log('i', i);
        var path = getInvalidCases[i];
        //log('path', path);
        getOptions.uri = 'http://localhost:3000' + path;
        var promise = reqprom(getOptions)
          .then(function(res) {
            log('Did not get 404', path);
            expect(res.statusCode).to.equal(404);
          })
          .catch(function(res) {
            if (res.statusCode) {
              //log('successfully errored');
              expect(res.statusCode).to.equal(404);
              return i + 1;
            }
              return path;
          });


        if (i < getInvalidCases.length) {
          promise.then(getNextInvalidCase)
        } else {
          promise.then(function() {done();});
        }
      };

      getNextInvalidCase(0);
    });

    var postOptions = {
      method: 'POST',
      resolveWithFullResponse: true
    };

    it('should add an entry and get it', function(done) {
      postOptions.uri = 'http://localhost:3000/addEntry';
      postOptions.json =   {
        project: 'testProj',
        functionName: 'method1',
        context: 'tips',
        text: 'Adding a test entry'
      };
      //getOptions.resolveWithFullResponse = true;
      getOptions.uri = 'http://localhost:3000/api/testProj/ref/method1/tips/entryID-346578302';

      reqprom(postOptions)
        .then(function(res) {
          expect(res.statusCode).to.equal(202);
          return reqprom(getOptions);
        })
        .then(function(body) {
          //body = JSON.parse(body);
          //
        })
        .then(done)
        .catch(function(err) {
          log('error');
          console.error(err);
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

