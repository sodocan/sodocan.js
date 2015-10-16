var Handlebars = require('handlebars');
var fs = require('fs');

var parsedToHTML = function(jsonString) {
  var elements = JSON.parse(jsonString);
  var source = fs.readFileSync('./parserHTMLTemplate.html').toString();
  var template = Handlebars.compile(source);
  var middleHTMLString = '';
  console.log('length of elements array: ', elements.length);
  for (var i = 0; i < elements.length; i++) {
    middleHTMLString += '\n';
    middleHTMLString += template(elements[i]);
  }

  var startHTMLString = '<!DOCTYPE html>' +
  '\n<html>' +
    '\n  <head>' +
      '\n    <title>docs</title>' +
      '\n    <meta content="text/html"; charset="UTF-8">' + 
      '\n  </head>' +
    '\n  <body>';
  var endHTMLString = '\n  </body>\n</html>';
  var total = startHTMLString + '\n' + middleHTMLString + '\n' + endHTMLString;
  fs.writeFile('./spec/htmlResult.html', total, function(err) {
    console.log('written to file.');
  }); 
  return total;

};

module.exports = parsedToHTML;

// var source   = $("#entry-template").html();
// var template = Handlebars.compile(source);
// var context = {title: "My New Post", body: "This is my first post!"};
// var html    = template(context);