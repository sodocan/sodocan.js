var app = app || {};

var Docs = Backbone.Collection.extend({

  // url: api/project,

  model: app.reference

});

// Docs.fetch();

app.docs = Docs;

