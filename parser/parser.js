#! /usr/bin/env node
var fs = require('fs');
var parsedToHTML = require('./parserUtils/parsedToHTML.js');
var networkRequest = require('./parserUtils/networkRequest.js');
var helper = require('./parserUtils/parserHelper.js');
var parseAndCombine = require('./parserUtils/parseAndCombine.js');

var parseMain = parseAndCombine.parseMain;
var constructGroupClassAndIndex = helper.constructGroupClassAndIndex;
var githubAPICallForFile = networkRequest.githubAPICallForFile;
var parseUrl = networkRequest.githubAPICallForFile;

//consider including more specific types of description: params description, returns description
//maybe we don't need 'name' for the 'returns' array

var fileOperations = function(paths) {

  var outputObj = {
    header: {
      project: '',
      version: '',
      author: ''
    },
    body: []
  };
  var outputPath = paths.pop();
  //if the user is parsing local files
  if (!isNetworkRequest(paths[0])) {
    var defaultProjectName = paths[0];
    //last path in array is the output file; earlier ones are js files to parse
    //outputPath is a directory
    //var outputArray = [];
  
    paths = getAllFilePaths(paths);
   
    for (var i = 0; i < paths.length; i++) {
      var parsedFileContents = parseMain('\n' + fs.readFileSync(paths[i]).toString());
      if (parsedFileContents.header.project !== '') {
        outputObj.header = parsedFileContents.header;
      }
      outputObj.body = outputObj.body.concat(parsedFileContents.body);
    }
    if (outputObj.header.project === '') {
      outputObj.header.project = defaultProjectName;
    }
    //duplicated
    // constructGroupClassAndIndex(outputObj);
    // writeIntoLocalFiles(outputObj, outputPath);
    // // make POST request to our server to send over the processed json file
    // sendParsedToServer(JSON.stringify(outputObj));
  } else {
    // for github API call - going to exist in some if block
    // check if https:// or http://
    // githugAPICallInfo is an array with [API call path, username, repo name]
    var githubAPICallInfo = networkRequest.parseUrl(paths[0]);
    if (githubAPICallInfo) {
      networkRequest.githubAPICallForFile(githubAPICallInfo, function(data) {
        var parsedFileContents = parseMain(data);
        if (parsedFileContents.header.project === '') {
          outputObj.header.project = githubAPICallInfo[2];
        }
        outputObj.body = parsedFileContents.body;
        //duplicated
        // constructGroupClassAndIndex(outputObj);
        // writeIntoLocalFiles(outputObj, outputPath);
        // // make POST request to our server to send over the processed json file
        // sendParsedToServer(JSON.stringify(outputObj));
      }); 
    }
  }
  //all of these will be executed for either condition (local files or github files)
  constructGroupClassAndIndex(outputObj);
  // to write JSON and HTML files
  //will create the specified directory if is does not exist
  writeIntoLocalFiles(outputObj, outputPath);

  cliAskQuestion('do you want to upload this doc to the server?', function(userInput) {
    if (userInput) {
      authAndSend(outputObj);
    } else {
      process.stdout.write('Doc has not been sent.  Enjoy your local copy!\n');
      process.exit();
    }
  });
};

var authAndSend = function(outputObjToSend) {
  cliAskQuestion('do you have a sodocan.js account?', function(userInput) {
    var usernameSentence = userInput ? 'Enter username:' : 'Registering now. Enter desired username:';
    var passwordSentence = userInput ? 'Enter password:' : 'Enter desired password:';
    process.stdout.write(usernameSentence);
    process.stdin.once('data', function(username) {
      username = username.trim();
      process.stdout.write(passwordSentence);
      process.stdin.once('data', function(password) {
        password = password.trim();
        //get the auth token, to use to create a new library in the DB
        //TODO: enable Github OAuth login to get this token
        networkRequest.makeAuthRequest(userInput, username, password, function(responseBody) {
          var token = JSON.parse(responseBody).access_token;
          //use token to create a query string we will add to our /create and /logout routes
          var tokenQueryString = '?access_token=' + token;
          console.log('successfully ' + (userInput ? 'logged in' : 'registered'));
          console.log('about to send parsed JSON to server');
          //actually send it to the server (/create route)
          networkRequest.sendParsedToServer(JSON.stringify(outputObjToSend), tokenQueryString, function() {
            //logout immediately after creating
            networkRequest.logout(tokenQueryString, function() {
              console.log('logged out');
              process.exit();
            });  
          });
        });
      });
    });
  }); 
};

var cliAskQuestion = function(message, callback) {
  var yesValues = ['y', 'yes'];
  var noValues = ['n', 'no'];
  process.stdout.write(message + ' (y/n)');
  process.stdin.setEncoding('utf8');
  process.stdin.once('data', function(answer) {
    answer = answer.trim().toLowerCase();
    if (yesValues.indexOf(answer) > - 1) {
      callback(true);
    } else if (noValues.indexOf(answer) > - 1) {
      callback(false);
    } else {
      process.stdout.write('invalid response.\n');
      cliAskQuestion(message, callback);
    }
  });
};

var getAllFilePaths = function(paths, pathStart) {
  console.log('paths: ', paths);
  pathStart = pathStart || '';
  var results = [];
  for (var i = 0; i < paths.length; i++) {
    var current;
    if (pathStart !== '') {
      current = pathStart + paths[i];
    }  
    else {
      current = paths[i];
    }
    if (fs.statSync(current).isDirectory()) {
      var filenameArray = fs.readdirSync(current);
      results = results.concat(getAllFilePaths(filenameArray, current + '/'));
    } else {
      if (paths[i].substring(paths[i].length - 3) === '.js') {
        results.push(current);
      }  
    }
  }
  console.log('results of current level are: ', results);
  return results;
};

var isNetworkRequest = function(path) {
  return (path.match('http://') || path.match('https://'));
};

var writeIntoLocalFiles = function(outputObj, outputPath) {
  // to write JSON and HTML files
  //create the specified directory if is does not exist
  if (!fs.existsSync(outputPath)){
    fs.mkdirSync(outputPath);
  }
  // to write JSON file
  fs.writeFile(outputPath + '/parsedJSON.json', JSON.stringify(outputObj), function(err, data) {
    if (err) {
      console.log(err + '(will be triggered by mocha tests)');
    }
    else {
      //console.log('Successfully parsed into JSON file.');
    }
  });

  // to write HTML file
  fs.writeFile(outputPath + '/parsedHTML.html', parsedToHTML(JSON.stringify(outputObj)), function(err, data) {
    if (err) {
      console.log(err + '(will be triggered by mocha tests)');
    }
    else {
      //console.log('Successfully generated HTML file.');
    }
  });
};

// module.exports = {
//   parseComments: parseComments,
//   findCommentBlocks: findCommentBlocks,
//   splitEntries: splitEntries,
//   processEntry: processEntry,
//   convertToJS: convertToJS,
//   parseMain: parseMain,
//   buildExplanations: buildExplanations,
//   combineInfo: combineInfo,
//   constructGroupClassAndIndex: constructGroupClassAndIndex,
//   parseCommentBlock: parseCommentBlock,
// };

//for command line use
var executingProgram = process.argv[1];
var userArgs = process.argv.slice(2);
console.log(process.argv);
console.log(userArgs);
if (executingProgram.substring(executingProgram.length - 6) === '/parse') {
  fileOperations(userArgs);
} 
// console.log('arg: ', userArgs);
// console.log('END RESULT: ', getAllFilePaths(userArgs));


//TODO: allow a way to edit results
//TODO: class inheritance 

//DONE: add @class functionality
//separate name of class from name of constructor function.  entry example:
//class: Dog
//constructor: makeDog
//methods: Dog.bark()
//DONE: only count functions that are not commented out
//DONE: allow a way to omit things
//DONE: start blocks with ** to distinguish from normal comments (possibly eliminate
 // @doc)
//DONE: grab functionName from next function after a comment block (no need for
 //@functionName property anymore.)

// @functionName
// @params
  // @name: name of param
  // @type
  // @default: default value of param (optional)
// @returns
  // @name: name of return value
  // @type
// @description
// @group: heading for a group of functions

// extra: @special (user-defined keyword)
// extra: cross-referencing {@link BABYLON.Vector3|Vector3} i 