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
        if (typeof i === 'string') {
          // this is an intentionally failing test
          // because if this if statement got triggered
          // the test should fail
          expect(i).to.equal('should send 404');
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
          promise.then(function() {
            log('Successfully got 404 errors for each invalid path');
            done();
          });
        }
      };

      getNextInvalidCase(0);
    });

    var postOptions = {
      method: 'POST',
      resolveWithFullResponse: true
    };

    var addEntryCases = testCases.addEntryCases;

    var postAndGetAnEntry = function(ind) {
      it(addEntryCases[ind].should, function(done) {
        var addEntryCase = addEntryCases[ind];
        postOptions.uri = 'http://localhost:3000/addEntry';
        postOptions.json = addEntryCase.postJson;
        getOptions.resolveWithFullResponse = false;
        getOptions.uri = addEntryCase.getUri;
        reqprom(postOptions)
          .then(function(res) {
            expect(res.statusCode).to.equal(202);
            return reqprom(getOptions);
          })
          .then(function(body) {
            body = JSON.parse(body);
            var ref = body[0];
            delete ref['_id'];
            var tips = ref.explanations.tips;
            var additions;
            for (var i = 0; i < tips.length; i++) {
              delete tips[i].timestamp;
              additions = tips[i].additions;
              for (var j = 0; j < additions.length; j++) {
                delete additions[j].timestamp;
              }
            }
            expect(ref).to.deep.equal(addEntryCase.expectedRef);
          })
          .then(done)
          .catch(function(err) {
            console.error(err);
          });
      });
    };

    for (var ind = 0; ind < addEntryCases.length; ind++) {
      postAndGetAnEntry(ind);
    }

    var upvoteCases = testCases.upvoteCases;

    var postEntryAndUpvote = function(ind) {
      it(upvoteCases[ind].should, function(done) {
        var upvoteCase = upvoteCases[ind];
        postOptions.uri = 'http://localhost:3000/addEntry';
        postOptions.json = upvoteCase.addEntryJson;
        getOptions.resolveWithFullResponse = false;
        getOptions.uri = upvoteCase.getUri;
        reqprom(postOptions)
          .then(function(res) {
            expect(res.statusCode).to.equal(202);
            postOptions.uri = 'http://localhost:3000/upvote'
            postOptions.json = upvoteCase.upvoteJson;
            return reqprom(postOptions);
          })
          .then(function(res) {
            expect(res.statusCode).to.equal(202);
            return reqprom(getOptions);
          })
          .then(function(body) {
            body = JSON.parse(body);
            var ref = body[0];
            delete ref['_id'];
            var tips = ref.explanations.tips;
            var additions;
            for (var i = 0; i < tips.length; i++) {
              delete tips[i].timestamp;
              additions = tips[i].additions;
              for (var j = 0; j < additions.length; j++) {
                delete additions[j].timestamp;
              }
            }
            log('ref', JSON.stringify(ref));
            expect(ref).to.deep.equal(upvoteCase.expectedRef);
          })
          .then(done)
          .catch(function(err) {
            console.error(err);
          });
      });
    };

    for (var ind = 0; ind < upvoteCases.length; ind++) {
      postEntryAndUpvote(ind);
    }

    var duplicateEntryCases = testCases.duplicateEntryCases;

    var postADuplicateEntry = function(ind) {
      it('should not allow duplicate ' + duplicateEntryCases[ind].type, function(done) {
        var duplicateEntryCase = duplicateEntryCases[ind];
        postOptions.uri = 'http://localhost:3000/addEntry';
        postOptions.json = duplicateEntryCase.postJson;
        reqprom(postOptions)
          .then(function() {
            log('Test Fail', 'Did not send 404 for duplicate ' + duplicateEntryCase.type);
          })
          .catch(function(res) {
            expect(res.statusCode).to.equal(404);
            done();
          })
      });
    };

    for (var ind = 0; ind < duplicateEntryCases.length; ind++) {
      postADuplicateEntry(ind);
    }

  });
});
