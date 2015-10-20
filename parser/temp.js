var https = require('https');


var ajaxCall = function() {
  //       github.com/username/repo/(always)/branch/folders.../filename
  //https://github.com/lainjiang/Jupitr/blob/test/index.js
  var options = {
    host: 'api.github.com',
    path: '/repos/lainjiang/Jupitr/contents/index.js?ref=test',
    method: 'GET',
    headers: {
      'User-Agent': 'lainjiang',
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
ajaxCall();