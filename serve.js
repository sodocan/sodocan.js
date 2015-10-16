var http = require('http');
var fs = require('fs');

var PORT=3000;
var DIR=__dirname+'/blueprints';
var TEMPLATE = 'angular-plain';
var headers = {'Access-Control-Allow-Origin':'*'};

var countfor = {};
countfor['thing2:method0'] = 1;
countfor['thing2:method1'] = -1;

function handleRequest(req,res) {
  if (req.url.match(/api/)) {
    var ret = {'thing1':{'something':'somethingElse'},'thing2':{'something2':'moreElse'}};

    res.writeHead(200,headers);
    res.end(JSON.stringify(ret));
  }
  var filePath = DIR+req.url;
  if (filePath===DIR+'/') {
    filePath+=TEMPLATE+'/index.html';
  };

  fs.readFile(filePath, function(err, data) {
    if (err) {
      console.log(filePath);
      // every error returns 500 - oh well
      res.writeHead(500);
      return res.end('Error loading');
    }

    res.writeHead(200);
    res.end(data);
  });
}


var server = http.createServer(handleRequest);

server.listen(PORT,function() {
  console.log('Server listening...');
});

