var https = require('https');
var http = require('http');
var fs = require('fs');
var URL = require('url');

var githubAPICallForFile = function(fileInfo, cb) {
  //       github.com/username/repo/(always)/branch/folders.../filename
  //https://github.com/lainjiang/Jupitr/blob/test/index.js
  var options = {
    host: 'api.github.com',
    path: fileInfo[0],
    method: 'GET',
    headers: {
      'User-Agent': fileInfo[1],
      'Accept': 'application/vnd.github.3.raw'
    },
    ref: 'test' 
  };
  var request = https.request(options, function(res){
    var data = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      data += chunk.toString();
    });
    res.on('end', function() {
      cb(data);
    });
  });
  request.end();
};

// parses the github url and returns the path for GET request
var parseUrl = function(url) {
  // GET /repos/:owner/:repo/contents/:path?ref=:branch
  //       github.com/username/repo/(always)/branch/folders.../filename
  //https://github.com/lainjiang/Jupitr/blob/test/index.js
  var parsedUrl = URL.parse(url);
  var host = parsedUrl.host;
  if (host !== 'github.com') {
    console.log('We only support github links right now. Sorry!');
    return;
  }
  var path = parsedUrl.pathname;
  path = path.split('/').slice(1);
  console.log(path);
  console.log(parsedUrl);
  var username = path[0];
  var pathForAPICall = '/repos/' + username + '/' + path[1] + '/contents/' + path.slice(4).join('/') + '?ref=' + path[3];
  console.log('pathForAPICall: ', pathForAPICall);
  return [pathForAPICall, username, path[1]];
};
//parseUrl('https://github.com/lainjiang/Jupitr/blob/test/index.js');

var sendParsedToServer = function(string, tokenQueryString) {
  var options = {
     // host:'localhost',
     // port: '3000',
    host: 'http://sodocan.herokuapp.com',
    headers: {
      "content-type": "application/json",
    },
    //path: '/create/' + tokenQueryString,
    path: '/create',
    method: 'POST'
  };
  var request = http.request(options, function(res) {
    console.log('sent to server.');
    console.log("statusCode: ", res.statusCode);
    console.log("headers: ", res.headers);
  });

  request.on('error', function(err) {
    console.log('POST request error: ', err);
  });
  request.write(string);
  request.end();
};

var makeAuthRequest = function(hasAccount, username, password, cb) {
  var options = {
    host: 'localhost',
    port: '3000',
    headers: {
      'content-type': 'application/json',
    },
    path: hasAccount ? '/auth/login' : '/auth/register',
    method: 'POST'
  };
  var request = http.request(options, function(res) {
    var responseBody = '';
    res.on('data', function(chunk) {
      responseBody += chunk;
    });
    res.on('end', function() {
      cb(responseBody);
      console.log('response body:', responseBody);
    });
  });

  request.write(JSON.stringify({
    username: username,
    password: password
  }));
  request.end();

};


module.exports = {
  githubAPICallForFile: githubAPICallForFile,
  parseUrl: parseUrl,
  sendParsedToServer: sendParsedToServer,
  makeAuthRequest: makeAuthRequest
};  
