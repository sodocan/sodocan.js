//var project = window.location.pathname.split('/')[1];
var project = 'underscore';
function getData() {
  $.ajax({
    url: "/api/"+project+"/all",
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
    item = docs[item];
  }
  var end = item.explanations.descriptions.length;
  end = (end>5)?5:(end===0)?1:end;

  var ret = '<div id="'+item.functionName+'">';
  ret += '<h3>'+item.functionName+'</h3>';
  ret += '<div id="'+item.functionName+'_desc">';
  
  for (var i=0;i<end;i++) {
    var eid = (item.explanations.descriptions[i]!==undefined)?item.explanations.descriptions[i].entryID:'new_entry_'+item.functionName;

    ret+='<div id="'+eid+'" style="border: 1px solid #000;margin-top:10px;">';
    var text = (item.explanations.descriptions[i]!==undefined)?item.explanations.descriptions[i].text:undefined;
    if (text!==undefined) {
      text = (typeof text==='string')?text:text.text;
      ret+='<a class="upvote" onClick="upvote(\''+item.functionName+'\','+item.explanations.descriptions[i].entryID+')"></a>';
      ret+='<span class="upvotes">'+item.explanations.descriptions[i].upvotes+'</span>';
      ret+='<p>'+text+'</p>';
    } else {
      ret += '<p>Be the first to add a description!</p>';
    }
    ret+='</div>';
  }

  ret +='</div>';
  ret += '<button id="'+item.functionName+'_but" onClick="edit(\''+item.functionName+'\')">Add Entry</button>';
  ret += '</div>';
  return ret;
}

function edit(func) {
  var id = func+'_desc';
  var text = $('#'+id).text();
  var $button = $('#'+func+'_but');
  $('#'+id).replaceWith('<textarea class="editbox" id="'+id+'">Your entry here</textarea>');
  $button.replaceWith('<button id="'+func+'_but" onClick="save(\''+func+'\')">Save</button>');
}

function save(func) {
  var text = $('#'+func+'_desc').val();
  $.ajax({
    url: "/addEntry",
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
      $.ajax({
        url: "/api/"+project+"/ref/"+func+"/all",
        method: "GET",
        error: function(err) {
          console.log(err);
        },
        success: function(data) {
          docs[func] = data[0];
          $('#'+func).replaceWith(buildRef(func));
        }
      });
    }
  });
}

function upvote(func,entryID) {
  $.ajax({
    url: "/upvote",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      project: docs[func].project,
      functionName:func,
      context:'descriptions',
      entryID:entryID
    }),
    error: function(err) {
      console.log(err);
    },
    success: function(data) {
      $('#'+entryID).css('backgroundColor','#0f0')
      .animate({backgroundColor:'#fff'},800,function(){$(this).css('backgroundColor','#fff')});
      var votes = parseInt($('#'+entryID+' .upvotes').text());
      $('#'+entryID+' .upvotes').text(votes+1);
      console.log(data);
    }
  });
}

getData();
