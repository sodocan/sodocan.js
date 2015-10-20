var Handlebars = require('handlebars');
var fs = require('fs');

var parsedToHTML = function(jsonString) {
  var jsonData = JSON.parse(jsonString);

  // compile header HTML
  var headerSource = fs.readFileSync(__dirname + '/headerHTMLTemplate.html').toString();
  var headerTemplate = Handlebars.compile(headerSource);
  var headerHTMLString = headerTemplate(jsonData.header);

  // compile body HTML
  var bodySource = fs.readFileSync(__dirname + '/bodyHTMLTemplate.html').toString();
  var bodyTemplate = Handlebars.compile(bodySource);
  var bodyHTMLString = '';
  console.log('length of body array: ', jsonData.body.length);
  for (var i = 0; i < jsonData.body.length; i++) {
    bodyHTMLString += '\n';
    bodyHTMLString += bodyTemplate(jsonData.body[i]);
  }

  var startHTMLString = '<!DOCTYPE html>' +
  '\n<html>' +
    '\n  <head>' +
      '\n    <title>docs</title>' +
      '\n    <meta content="text/html"; charset="UTF-8">' + 
      '\n  </head>' +
    '\n  <body>';
  var endHTMLString = '\n  </body>\n</html>';
  var total = startHTMLString + '\n' + headerHTMLString + '\n' + bodyHTMLString + '\n' + endHTMLString;
  return total;
};

module.exports = parsedToHTML;

// var source   = $("#entry-template").html();
// var template = Handlebars.compile(source);
// var context = {title: "My New Post", body: "This is my first post!"};
// var html    = template(context);