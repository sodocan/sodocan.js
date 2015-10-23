var expect = require('chai').expect;
var request = require('request');
var helpers = require('./../Utilities/helpers.js');
var testCases = require('./testCases.js');

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
