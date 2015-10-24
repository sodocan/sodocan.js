var http = require('http');
var fs = require('fs');

var PORT=4000;
var DIR=__dirname+'/blueprints';
var TEMPLATE = 'angular-sodone';
var headers = {'Access-Control-Allow-Origin':'*'};

var countfor = {};
countfor['thing2:method0'] = 1;
countfor['thing2:method1'] = -1;

var exampleJSON = [
  {
    "_id": "5625376402941ab4141fa4cb",
    "project": "testProj",
    "functionName": "method1",
    "group": "testGroup",
    "reference": {
      "params": [],
      "returns": []
    },
    "explanations": {
      "descriptions": [
        {
          "text": "descriptionblahblah",
          "upvotes": 0,
          "additions": [],
          "entryID": 1294058334
        }
      ],
      "examples": [
        {
          "text": "examplesblahblah",
          "upvotes": 0,
          "additions": [],
          "entryID": 719765163
        }
      ],
      "tips": [
        {
          "text": "tipsblahblah",
          "upvotes": 0,
          "additions": [],
          "entryID": 907176294
        }
      ]
    },
    "__v": 0
  },
  {
    "_id": "23487u928323",
    "project": "testProj",
    "functionName": "method2",
    "group": "testGroup",
    "reference": {
      "params": [],
      "returns": []
    },
    "explanations": {
      "descriptions": [
        {
          "text": "descriptionblahblah",
          "upvotes": 0,
          "additions": [],
          "entryID": 1294058334
        }
      ],
      "examples": [
        {
          "text": "examplesblahblah",
          "upvotes": 0,
          "additions": [],
          "entryID": 719765163
        }
      ],
      "tips": [
        {
          "text": "tipsblahblah",
          "upvotes": 0,
          "additions": [],
          "entryID": 907176294
        }
      ]
    },
    "__v": 0
  },
];

function handleRequest(req,res) {
  if (req.url.match(/^\/api\/testProj/)) {
    if (req.url.match(/testProj$/)) {
      var ret = JSON.stringify(exampleJSON);
    }
    res.writeHead(200,headers);
    res.end(ret);
  }
  var filePath = DIR+req.url;
  if (req.url.match(/[^html|^js|^css]$/)) {
    filePath = DIR+'/'+TEMPLATE+'/index.html';
  }
  
  var pos = filePath.search(/underscore/);
  if (pos>-1) {
    var path = filePath.substr(pos+10);
    filePath = DIR+'/'+path;
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

