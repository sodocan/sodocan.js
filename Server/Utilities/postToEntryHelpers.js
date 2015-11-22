var dbHelpers = require('./methodsDatabaseHelpers');

var fieldsCheck = {

  commonFields: ['username', 'project', 'functionName', 'context'],

  additional: {
    upvote: ['entryID'],
    add: ['text'],
    edit: ['text', 'entryID'],
    delete: ['entryID']
  },

  fieldIsInvalid: function(field, value) {
    if (field === 'entryID' || field === 'commentID') {
      if (typeof value === 'number' && value > 0 && Number.isInteger(value)) {
        return false;
      }
    } else {
      if (typeof value === 'string' && value.trim()) {
        return false;
      }
    }
    return true;
  },

  findInvalidFields: function(reqBody, action) {
    var requiredFields = this.commonFields.concat(this.additional[action]);
    var invalidFields = requiredFields.filter(function(field) {
      return this.fieldIsInvalid(field, reqBody[field]);
    }.bind(this));
    if (invalidFields.length) {
      return 'Required fields missing or invalid: ' + invalidFields.join(', ');
    } else {
      return null;
    }
  }
};

var addNewPost = function(entries, username, newText, isComment) {
  var idType = isComment ? 'commentID' : 'entryID';
  var newPostID = dbHelpers.hashCode(newText);
  var existingIDs = {};
  for (var i = 0; i < entries.length; i++) {
    if (entries[i].text === newText) {
      return 'cannot submit duplicate entry';
    }
    existingIDs[entries[i][idType]] = true;
  }
  while (existingIDs[newPostID]) {
    newPostID++;
  }
  var newEntry = {
    username: username,
    timestamp: new Date(),
    text: newText,
    upvotes: 0,
    upvoters: {},
  };
  newEntry[idType] = newPostID;
  if (!isComment) {
    newEntry.comments = [];
  }
  entries.push(newEntry);
  return null;
};

var postToExistng = {

  upvote: function(entries, ind, username) {
    var entry = entries[ind];
    if (!entry.upvoters.hasOwnProperty(username) && username !== entry.username) {
      entry.upvotes++;
      // 1 is arbitrarily selected to indicate that a
      // user has upvoted this entry
      entry.upvoters[username] = 1;
      while (ind > 0 && entry.upvotes > entries[ind -1].upvotes) {
        entries[ind] = entries[ind - 1];
        entries[ind - 1] = entry;
        ind--;
      }
      return null;
    }
    return 'cannot vote more than once or for your own entry';
  },

  edit: function(entries, ind, username, text) {
    var entry = entries[ind];
    if (username === entry.username) {
      if (entry.text === text) {
        return 'no change in content found';
      }
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].text === text) {
          return 'cannot submit duplicate entry';
        }
      }
      entry.text = text;
      return null;
    }
    return 'not authorized to edit this entry';
  },

  delete: function(entries, ind, username) {
    if (username === entries[ind].username) {
      entries.splice(ind, 1);
      return null;
    }
    return 'not authorized to delete this entry';
  }
};

var indexOfID = function(entries, ID, isComment) {
  var idType = isComment ? 'commentID' : 'entryID';
  for (var ind = 0; ind < entries.length; ind++) {
    if (entries[ind][idType] === ID) {
      return ind;
    }
  }
  return -1;
};

var postToEntry = exports.postToEntry = function(reqBody, action, res) {

  var fieldsError = fieldsCheck.findInvalidFields(reqBody, action);
  if (fieldsError) {
    sendErr(res, 400, fieldsError);
    return;
  }

  var searchObject = {
    project: reqBody.project,
    functionName: reqBody.functionName
  };

  // Parameters res, searchObj, sortObj, successC, notFoundC, errorC
  dbHelpers.methodsFind(res, searchObject, null, function(reference) {
    var explanations = JSON.parse(JSON.stringify(reference.explanations));
    var entries = explanations[reqBody.context];
    if (!entries) {
      sendErr(res, 404, 'context not found for this function');
      return;
    }

    var username = reqBody.username;
    var text = reqBody.text; // may be undefined for upvote, delete
    var entryID = reqBody.entryID; // may be undefined for add
    var commentID = reqBody.commentID; // may be undefined

    var newPost = (action === 'add');

    if (newPost) {
      if (fieldsCheck.fieldIsInvalid('entryID', entryID)) {
        entryID = null;
      }
      commentID = null;
    } else { // if !newPost
      if (fieldsCheck.fieldIsInvalid('commentID', commentID)) {
        commentID = null;
      }
    }

    var postErr;

    if (entryID) { // always true when !newPost
      var entInd = indexOfID(entries, entryID);
      if (entInd === -1) {
        sendErr(res, 404, 'entry not found');
        return;
      }
      var entry = entries[entInd];
      var comments = entry.comments;
      if (newPost) {
        postErr = addNewPost(comments, username, text, true);
      } else if (commentID) { // && !newPost
        var comInd = indexOfID(comments, commentID, true);
        if (comInd === -1) {
          sendErr(res, 404, 'comment not found');
          return;
        }
        postErr = postToExistng[action](comments, comInd, username, text);
      } else { // if !newPost && !commentID
        postErr = postToExistng[action](entries, entInd, username, text);
      }
    } else { // if !entryID
      postErr = addNewPost(entries, username, text);
    }

    if (postErr) {
      sendErr(res, 400, postErr);
      return;
    }

    // Mongoose will not save the modifications to the explanations object
    // unless you reassign its value to a different object
    reference.explanations = explanations;

    reference.save(function(err) {
      if (err) {
        sendErr(res, 500, err);
      } else {
        res.sendStatus(201);
      }
    });
  });
};
