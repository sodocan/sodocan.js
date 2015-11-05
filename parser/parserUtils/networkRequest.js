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

var sendParsedToServer = function(string, tokenQueryString, cb) {
  var options = {
    host:'localhost',
    //host: 'http://sodocan.herokuapp.com',
    port: '3000',
    headers: {
      "content-type": "application/json",
    },
    path: '/create/' + tokenQueryString,
    method: 'POST'
  };
  var request = http.request(options, function(res) {
    console.log('sending to server.');
    console.log("statusCode after sending: ", res.statusCode);
    //console.log("headers: ", res.headers);
    cb();  
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
    //host: 'http://sodocan.herokuapp.com',
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
      console.log('response body:', responseBody);
      cb(responseBody);  
    });
  });

  request.write(JSON.stringify({
    username: username,
    password: password
  }));
  request.end();

};

var logout = function(tokenQueryString, cb) {
  var options = {
    host: 'localhost',
    //host: 'http://sodocan.herokuapp.com',
    port: '3000',
    headers: {
      'content-type': 'application/json',
    },
    path: '/auth/logout/' + tokenQueryString,
    method: 'POST'
  };

  var request = http.request(options, function(res) {
    console.log('status code response from logout: ', res.statusCode);
    cb();  
  });

  request.end();
};


module.exports = {
  githubAPICallForFile: githubAPICallForFile,
  parseUrl: parseUrl,
  sendParsedToServer: sendParsedToServer,
  makeAuthRequest: makeAuthRequest,
  logout: logout
};  
