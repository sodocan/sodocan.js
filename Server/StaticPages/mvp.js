function getData() {
  $.ajax({
    url: "http://localhost:3000/api/underscore",
    method: "GET",
    error: function(err) {
      console.log(err);
    },
    success: function(data) {
      populate(data);
    }
  });
}

var docs = {};
function populate(arr) {
  $('#header').text(arr[0].project);
  document.title = arr[0].project+' Example Documentation';
  arr.map(function(v) {
    docs[v.functionName] = v;
    $('#funcList').append('<li><a href="#'+v.functionName+'">'+v.functionName+'</a></li>');
    $('#content').append(buildRef(v));
  });
}

function buildRef(item) {
  if (typeof item==='string') {
    var text = arguments[1];
    item = docs[item];
  } else {
    var text = item.explanations.descriptions[0];
  }

  var ret = '<div id="'+item.functionName+'">';
  ret += '<h3>'+item.functionName+'</h3>';
  ret += '<p id="'+item.functionName+'_desc">';
  if (text!==undefined) {
    text = (typeof text==='string')?text:text.text;
    ret+='<a class="upvote" onClick="upvote(\''+item.functionName+'\')"></a>';
    ret+=text;
  } else {
    ret += 'Be the first to add a description!';
  }
  ret +='</p>';
  ret += '<button id="'+item.functionName+'_but" onClick="edit(\''+item.functionName+'\')">Add Entry</button>';
  ret += '</div>';
  return ret;
}

function edit(func) {
  var id = func+'_desc';
  var text = $('#'+id).text();
  var $button = $('#'+func+'_but');
  $('#'+id).replaceWith('<textarea class="editbox" id="'+id+'">'+text+'</textarea>');
  $button.replaceWith('<button id="'+func+'_but" onClick="save(\''+func+'\')">Save</button>');
}

function save(func) {
  var text = $('#'+func+'_desc').val();
  $.ajax({
    url: "http://localhost:3000/addEntry",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      project:docs[func].project,
      functionName:func,
      context:'descriptions',
      text:text
    }),
    error: function(err) {
      console.log(err);
    },
    success: function(data) {
      $('#'+func).replaceWith(buildRef(func,text));
    }
  });
}

function upvote(func) {
  $.ajax({
    url: "http://localhost:3000/upvote",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      project: docs[func].project,
      functionName:func,
      context:'descriptions',
      entryID:docs[func].explanations.descriptions[0].entryID
    }),
    error: function(err) {
      console.log(err);
    },
    success: function(data) {
      $('#'+func).css('backgroundColor','#0f0')
      .animate({backgroundColor:'#fff'},800,function(){$(this).css('backgroundColor','#fff')});
      console.log(data);
    }
  });
}

getData();
