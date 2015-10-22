var expect = require('chai').expect;
var request = require('request');
var helpers = require('../Utilities/helpers.js');
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
var testCases = {
  'api/sodocan': {
    searchObject: {projectName: 'sodocan'},
    contexts: {all:[]}
  },
  'api/sodocan/ref/makeSkele': {
    searchObject: {projectName: 'sodocan'},
    contexts: {all:[]}
  },
  'api/sodocan/examples',
  'api/sodocan/descriptions/all',
  'api/sodocan/descriptions/1/10',
  'api/sodocan/all/all',
  'api/sodocan/tips/descriptions',
  'api/sodocan/all/tips/0',
  'api/sodocan/ref/makeItPretty/descriptions/entryID-128/all',
  'api/sodocan/ref/makeItPretty/descriptions/entryID-128/additionID-14': {
    searchObject: {
      projectName: 'sodocan',
      functionName: 'makeItPretty'
    },
    contexts: {
      descriptions: ['entryID-128', 'additionID-14']
    }
  }
};

describe("Server helper functions", function() {

  beforeEach(function () {

  });

  for (var i = 0; i < testCases.length; i++) {
    var path = testCases[i];
    it("should parse path " + path, function() {
      var returnedObj = helpers.parseApiPath(path);
      expect(returnedObj).to.deep.equal(output)
    });
  }
});