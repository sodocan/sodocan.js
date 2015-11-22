var mongoose = require('mongoose');
var expect = require('chai').expect;
var request = require('request');
var reqprom = require('request-promise');
var helpers = require('./../Utilities/helpers.js');
var testCases = require('./testCases.js');
var db = require('../Databases/dbconnection.js');
var methodsDB = require('../Databases/Models/methods.js');
var User = require('../Databases/Models/users.js');

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

var access_token, access_token2;

// Begin tests
describe("Server", function() {

  // removes test data
  before(function (done) {
    this.timeout(5000);

    var reinitiateTestData = function() {
      methodsDB.remove({project: 'testProj'}, function(err) {
        if (err) {
          log('Mongo remove testProj error', err);
        } else {
          User.remove({username: {$in: ['testUser','testUser2']}}, function(err) {
            if (err) {
              log('Mongo remove testUser error', err);
            } else {
              reqprom({
                method: 'POST',
                uri: 'http://localhost:3000/auth/register',
                json: {
                  username: 'testUser',
                  password: 'test'
                }
              })
              .then(function(data) {
                access_token = data.access_token;
                return reqprom({
                  method: 'POST',
                  uri: 'http://localhost:3000/auth/register',
                  json: {
                    username: 'testUser2',
                    password: 'test2'
                  }
                });
              })
              .then(function(data) {
                access_token2 = data.access_token;
                done();
              });
            }
          });
        }
      });
    };

    if (!mongoose.connection.db) {
      db.on('connected', function() {
        reinitiateTestData();
      });
    } else {
      reinitiateTestData();
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
      delete actualForm.timestamp;
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
        var options = {
          'method': 'POST',
          'uri': 'http://localhost:3000/create',
          'json': parserPostCases[i]
        };

        options.json.access_token = access_token;

        request(options, function(error, res, body) {
          expect(res.statusCode).to.equal(202);

          methodsDB.find({project: 'testProj'}).sort({functionName: 1}).lean().exec(function(err, references) {
            if (err) {
              console.error(err);
            } else {
              for (var j = 0; j < references.length; j++) {
                var reference = references[j];
                delete reference._id;
                delete reference.timestamp;
                for (var context in reference.explanations) {
                  var entries = reference.explanations[context];
                  for (var k = 0; k < entries.length; k++) {
                    delete entries[k].timestamp;
                  }
                }
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
            var reference = body[j];
            delete reference._id;
            delete reference.timestamp;
            for (var context in reference.explanations) {
              var entries = reference.explanations[context];
              for (var k = 0; k < entries.length; k++) {
                delete entries[k].timestamp;
              }
            }
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
        var path = getInvalidCases[i];
        getOptions.uri = 'http://localhost:3000' + path;
        var promise = reqprom(getOptions)
          .then(function(res) {
            log('Did not get 404', path);
            expect(res.statusCode).to.equal(404);
          })
          .catch(function(res) {
            if (res.statusCode) {
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
        postOptions.json.access_token = access_token;
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
            delete ref._id;
            delete ref.timestamp;
            var tips = ref.explanations.tips;
            var comments;
            for (var i = 0; i < tips.length; i++) {
              delete tips[i].timestamp;
              comments = tips[i].comments;
              for (var j = 0; j < comments.length; j++) {
                delete comments[j].timestamp;
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
        postOptions.json.access_token = access_token;
        getOptions.resolveWithFullResponse = false;
        getOptions.uri = upvoteCase.getUri;
        reqprom(postOptions)
          .then(function(res) {
            expect(res.statusCode).to.equal(202);
            postOptions.uri = 'http://localhost:3000/upvote'
            postOptions.json = upvoteCase.upvoteJson;
            postOptions.json.access_token = access_token2;
            return reqprom(postOptions);
          })
          .then(function(res) {
            expect(res.statusCode).to.equal(202);
            return reqprom(getOptions);
          })
          .then(function(body) {
            body = JSON.parse(body);
            var ref = body[0];
            delete ref._id;
            delete ref.timestamp;
            var tips = ref.explanations.tips;
            var comments;
            for (var i = 0; i < tips.length; i++) {
              delete tips[i].timestamp;
              comments = tips[i].comments;
              for (var j = 0; j < comments.length; j++) {
                delete comments[j].timestamp;
              }
            }
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
        postOptions.json.access_token = access_token;
        reqprom(postOptions)
          .then(function() {
            log('Test Fail', 'Did not send 404 for duplicate ' + duplicateEntryCase.type);
          })
          .catch(function(res) {
            expect(res.statusCode).to.equal(401);
            done();
          })
      });
    };

    for (var ind = 0; ind < duplicateEntryCases.length; ind++) {
      postADuplicateEntry(ind);
    }

    var editEntryCases = testCases.editEntryCases;

    var editOrDeleteEntry = function(ind) {
      it(editEntryCases[ind].should, function(done) {
        var editEntryCase = editEntryCases[ind];
        postOptions.uri = 'http://localhost:3000/editEntry';
        postOptions.json = editEntryCase.postJson;
        postOptions.json.access_token = access_token;
        getOptions.resolveWithFullResponse = false;
        getOptions.uri = editEntryCase.getUri;
        reqprom(postOptions)
          .then(function(res) {
            expect(res.statusCode).to.equal(202);
            return reqprom(getOptions);
          })
          .then(function(body) {
            body = JSON.parse(body);
            var ref = body[0];
            delete ref._id;
            delete ref.timestamp;
            var tips = ref.explanations.tips;
            var comments;
            for (var i = 0; i < tips.length; i++) {
              delete tips[i].timestamp;
              comments = tips[i].comments;
              for (var j = 0; j < comments.length; j++) {
                delete comments[j].timestamp;
              }
            }
            expect(ref).to.deep.equal(editEntryCase.expectedRef);
          })
          .then(done)
          .catch(function(err) {
            console.error(err);
          });
      });
    }

    for (var ind = 0; ind < editEntryCases.length; ind++) {
      editOrDeleteEntry(ind);
    }

  });
});
