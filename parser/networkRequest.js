var https = require('https');
var URL = require('url');

var githubAPICallforFile = function(path, username) {
  //       github.com/username/repo/(always)/branch/folders.../filename
  //https://github.com/lainjiang/Jupitr/blob/test/index.js
  var options = {
    host: 'api.github.com',
    path: path,
    method: 'GET',
    headers: {
      'User-Agent': username,
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
      console.log(data);
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
  var path = parsedUrl.pathname;
  path = path.split('/').slice(1);
  console.log(path);
  console.log(parsedUrl);
  var pathForAPICall = '/repos/' + path[0] + '/' + path[1] + '/contents/' + path.slice(4).join('/') + '?ref=' + path[3];
  console.log('pathForAPICall: ', pathForAPICall);
};

parseUrl('https://github.com/lainjiang/Jupitr/blob/test/index.js');
