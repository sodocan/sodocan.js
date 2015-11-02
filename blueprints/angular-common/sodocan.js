//temporary config var here
var API_HOME = 'http://localhost:3000/api/';
angular.module( 'sodocan', [])

.config(function($locationProvider){
  //should prob contain most of what's in sodocanCtrl
  $locationProvider.html5Mode(true).hashPrefix('!');
})

.factory('sodocanAPI', ['$http', 'projectName', function($http,projectName) {

  /* Private members
   *
   */

  var projectURL = API_HOME+projectName+'/';
  
  // Takes context data from functions, either as arguments (array) or ref obj
  // and returns parsed object (URL, ref, and callback)
  // Slight misnomer, also accepts arguments array in the format:
  // [ref,entry#,add#,cb]
  var parseRefObj = function(toConvert) {

    var built;
    // arguments
    if (Array.isArray(toConvert)) {
      var ref,entryNum,commentNum,cb;
      if (typeof toConvert[0] === 'function' || !toConvert[0]) {
        ref = '';
        entryNum = -1;
        commentNum = -1;
        cb = toConvert[0] || function(){};
      } else if (typeof toConvert[1] === 'function') {
        ref = 'ref/'+toConvert[0]+'/';
        entryNum = false;
        commentNum = false;
        cb = toConvert[1];
      } else if (typeof toConvert[2] === 'function') {
        ref = 'ref/'+toConvert[0]+'/';
        entryNum = toConvert[1];
        commentNum = false;
        cb = toConvert[2];
      } else if (toConvert.length===4) {
        ref = 'ref/'+toConvert[0]+'/';
        entryNum = toConvert[1];
        commentNum = toConvert[2];
        cb = toConvert[3];
      } else {
        // TODO: WARNING: this error isn't helpful
        throw new Error('Bad input to getContext');
      }
      if (entryNum===-1) entryNum = 'all';
      if (commentNum===-1) commentNum = 'all';
      built = ref;
      built += (entryNum!==false)?entryNum+'/':'';
      built += (commentNum!==false)?commentNum:'';

    // reference object
    } else {
      if (toConvert['ref']) {
        var ref = 'ref/'+toConvert['ref']+'/';
      } else {
        var ref = '';
      }
      built = '';
      if (toConvert.context && !toConvert.context.ref) {
        var contexts = Object.keys(toConvert.context);
        for (var i=0; i<contexts.length;i++) {
          built += toConvert.context[contexts[i]].reduce(function(a,c) {
            c = (c===-1)?'all':c;
            return a+'/'+c;
          },contexts[i]);
          built += '/';
        }
      } else {
        if (toConvert.context && toConvert.context.ref) {
          built += toConvert.context.ref.reduce(function(a,c) {
            c = (c===-1)?'all':c;
            return a+'/'+c;
          },'');
        }
      }
    }    

    // must pass reference updating all is what refreshTop is for
    var reference = ref.match(/\/(\w+)\//) || false;
    if (reference) reference = reference[1];

    return {
      url: built,
      ref: reference,
      cb: cb
    };
  };

  // Handle HTTP request to API here; requests project if not passed
  // API URL string
  var getFromAPI = function(url,cb) {
    url = projectURL+url;
    var success = function(data) { cb(null,data.data); };
    $http.get(url).then(success,cb);
  };

  // Handle HTTP POST to API here; needs URL string and body JSON
  var sendToAPI = function(url,json,cb) {
    var success = function(data) { cb(null,data.data); };
    $http.post(API_HOME.slice(0,-4)+url,json,{headers:{'Content-Type':'application/json'}}).then(success,cb);
  };

  /* Object to expose
   *
   */

  var obj = {};
  obj.projectName = projectName;

  /* Request methods
   *
   */

  // Shorthand to allow one query for multiple, varying context data
  obj.getReference = function(refObj,cb) {
    
    var parsed;

    // Making convenience functions more, well, convenient means you can pass parsed
    // object in as well. ES6 version will hopefully be neater
    var preParsed = false;
    if (refObj.hasOwnProperty('url') && refObj.hasOwnProperty('cb') && refObj.hasOwnProperty('ref')) {
      preParsed = true;
      parsed = refObj;
    }

    if (!preParsed) {
      parsed = parseRefObj(refObj);
    }
    
    getFromAPI(parsed.url,function(err,data) {
      if (err) {
        cb(err);
        return;
      }
      if (parsed.ref) {
        ret = obj.docs[parsed.ref].explanations = data[0].explanations;
      } else {
        data.map(function(method) {
          obj.docs[method.functionName] = method;
        });
        ret = obj.docs;
      }

      cb(null,ret);
    });

  };

  obj.getDescriptions = function() {
    var parsed = parseRefObj(Array.prototype.slice.call(arguments));
    // see Tips for specific query
    obj.getReference(parsed,function(err,data) {
      if (err) {
        parsed.cb(err);
        return;
      }
      if (parsed.ref) {
        parsed.cb(null,data.descriptions);
      } else {
        parsed.cb(null,data);
      }
    });
  };

  obj.getExamples = function() {
    var parsed = parseRefObj(Array.prototype.slice.call(arguments));
    // see Tips for specific query
    obj.getReference(parsed,function(err,data) {
      if (err) {
        parsed.cb(err);
        return;
      }
      if (parsed.ref) {
        parsed.cb(null,data.examples);
      } else {
        parsed.cb(null,data);
      }
    });
  };

  obj.getTips = function() {
    var parsed = parseRefObj(Array.prototype.slice.call(arguments));
    // Optional: minimizes network data,
    //           TODO: benchmark and see if it matters
    parsed.url = parsed.url.split('/');
    parsed.url.splice(2,0,'tips');
    parsed.url=parsed.url.join('/');
    // </optional>
    obj.getReference(parsed,function(err,data) {
      if (err) {
        parsed.cb(err);
        return;
      }
      if (parsed.ref) {
        parsed.cb(null,data.tips);
      } else {
        parsed.cb(null,data);
      }
    });
  };

  // additions TODO: needs everything passed, this format needs to be rethought
  // no easy way to update larger docs object from an entryID
  obj.getComments = function(ref,context,entryID,commentNum,cb) {
    
    if (commentNum===-1) commentNum='all';
    getFromAPI('ref/'+ref+'/'+context+'/'+entryID+'/'+commentNum,function(err,data) {
      if (err) {
        cb(err);
        return;
      }

      obj.docs[ref] = data[0];
      cb(null,obj.docs[ref]);
    });

  };

  // API.refreshTop requeries initial load, replaces existing docs object
  // Inefficiently allows for top-level settings changes
  // FUNCTION_UNDER_REVIEW TODO WARNING
  obj.refreshTop = function(refObj,cb) {
    if (refObj['ref']) {
      var ref = 'ref/'+refObj['ref']+'/';
    } else {
      var ref = '';
    }
    var contextURL = '';
    if (refObj.context && !refObj.context.ref) {
      var contexts = Object.keys(refObj.context);
      for (var i=0; i<contexts.length;i++) {
        contextURL += refObj.context[contexts[i]].reduce(function(a,c) {
          c = (c===-1)?'all':c;
          return a+'/'+c;
        },contexts[i]);
        contextURL += '/';
      }
    } else {
      if (refObj.context && refObj.context.ref) {
        contextURL += refObj.context.ref.reduce(function(a,c) {
          c = (c===-1)?'all':c;
          return a+'/'+c;
        },'');
      }
    }

    getFromAPI(ref+contextURL,function(err,data) {
      if (err) cb(err);
      obj.docs[ref] = data[0];
      cb(null,obj.docs[ref]);
    });
  };

  /* Send methods
   *
   * All edit methods are placeholders, do not use
   */

  obj.editReference = function() {

  };

  // No support for multiple context updates at once,
  // currently only generic alias for helper functions below
  obj.newReference = function() {

  };

  obj.editDescription = function() {

  };

  obj.newDescription = function(ref,text,cb) {
    cb = cb || function(){};
    sendToAPI('addEntry',
              {
                project: projectName,
                functionName:ref,
                context:'descriptions',
                text:text
              },
              function(err,data) {
                if (err) {
                  cb(err);
                  return;
                }
                cb(null,data);
              }
             );
  };

  obj.editTip = function() {

  };

  obj.newTip = function(ref,text,cb) {
    cb = cb || function(){};
    sendToAPI('addEntry',
              {
                project: projectName,
                functionName:ref,
                context:'tips',
                text:text
              },
              function(err,data) {
                if (err) {
                  cb(err);
                  return;
                }
                cb(null,data);
              }
             );
  };

  obj.editExample = function() {

  };

  obj.newExample = function(ref,text,cb) {
    cb = cb || function(){};
    sendToAPI('addEntry',
              {
                project: projectName,
                functionName:ref,
                context:'examples',
                text:text
              },
              function(err,data) {
                if (err) {
                  cb(err);
                  return;
                }
                cb(null,data);
              }
             );
  };

  obj.editComment = function() {

  };

  // TODO: does this really need proj,funcName, context, and ID?
  obj.newComment = function(entryID,ref,context,text,cb) {
    cb = cb || function(){};
    sendToAPI('addEntry',
              {
                entryID:entryID,
                project: projectName,
                functionName:ref,
                context:context,
                text:text
              },
              function(err,data) {
                if (err) {
                  cb(err);
                  return;
                }
                cb(null,data);
              }
             );
  };

  obj.upvote = function(entryID,ref,context,addID,cb) {
    if (typeof addID === 'function') {
      cb = addID;
      sendToAPI('upvote',
                {
                  entryID:entryID,
                  project:projectName,
                  functionName:ref,
                  context:context
                },
                function(err,data) {
                  if (err) {
                    cb(err);
                    return;
                  }
                  cb(null,data);
                }
               );
    } else {
      sendToAPI('upvote',
                {
                  entryID:entryID,
                  project:projectName,
                  functionName:ref,
                  context:context,
                  additionID:addID
                },
                function(err,data) {
                  if (err) {
                    cb(err);
                    return;
                  }
                  cb(null,data);
                }
               );
    }
  };

  return obj;
}])

// TODO: provider
.factory('sodocanRouter', ['$location', '$http','$rootScope','sodocanAPI',
                           function($location,$http,$rootScope,sodocanAPI) {
  var contexts = {
    'descriptions':true,
    'tips':true,
    'examples':true
  };
  var obj = {};
  obj.update = function() {
    obj.route = {};
    obj.route.context = {};
    var path = $location.path().split('/').filter(function(val) {
      return !(val==='');
    });

    /* format to read changed object:
     * context: { descriptions : [ref#|all,add#|all],
     *            tips         : [ref#|all,add#|all] },
     * ref    : method_or_function
     */

    var piece,context;
    while (path.length>0) {
      piece = path.shift();
      if (contexts[piece]) {
        obj.route.context[piece] = [];
        context = piece;
      } else if (isFinite(piece)) {
        // only numbers in actual URL to avoid ambiguity
        if (piece==='-1') piece='all';
        if (context!==undefined) {
          if (obj.route.context[context]<2) obj.route.context[context].push(piece);
        } else {
          if(!obj.route.context['ref']) obj.route.context['ref']=[];
          if (obj.route.context['ref'].length<2) obj.route.context['ref'].push(piece);
        }
      } else {
        obj.route.ref = piece;
      }
    }
  };
  
  //obj.update();
  return obj;
}])

.controller('sodocanCtrl',
            ['$location','$scope','sodocanAPI', 'sodocanInit','sodocanRouter',
              function ($location,$scope,sodocanAPI,sodocanInit,sodocanRouter) {
  // possibly best moved to config
  sodocanAPI.docs = sodocanInit.docs;
  sodocanAPI.path = sodocanInit['sodocan-path'];
  $scope.projectName = sodocanAPI.projectName;
  $scope.pageTitle = sodocanAPI.projectName;
  $scope.$on('$locationChangeStart', sodocanRouter.update);
  $scope.sodocanRoute = function() { return sodocanRouter.route; };
}]);

angular.element(document).ready(function() {
    var $initInjector = angular.injector(['ng']);
    var $http = $initInjector.get('$http');

    // 99% of this can be eaten by a RouteProvider
    var path = window.location.pathname.split('/').filter(function(val) {
      return !(val==='');
    });
    var project = path.shift();
    var piece,context,route = {};
    route.context = {};
    var contexts = {
      'descriptions':true,
      'tips':true,
      'examples':true
    };
    while (path.length>0) {
      piece = path.shift();
      if (contexts[piece]) {
        route.context[piece] = [];
        context = piece;
      } else if (isFinite(piece)) {
        // only numbers in actual URL to avoid ambiguity
        if (piece==='-1') piece='all';
        if (context!==undefined) {
          if (route.context[context]<2) route.context[context].push(piece);
        } else {
          if(!route.context['ref']) route.context['ref']=[];
          if (route.context['ref'].length<2) route.context['ref'].push(piece);
        }
      } else {
        route.ref = piece;
      }
    }

    var entryadds ='';
    if (route.context['ref'] && route.context['ref'].length) {
      entryadds = route.context['ref'].reduce(function(a,c) {
        return a+'/'+c;
      },'');
    }
    $http.get(API_HOME+project+entryadds).then(
      function(resp) {
        var ret = {docs:{}};
        var projName;
        resp.data.map(function(method) {
          ret.docs[method.functionName] = method;
          projName = method.project;
        });
        ret['sodocan-path'] = window.location.pathname.split('/').filter(function(val) {
          return !(val==='');
        });
        angular.module('sodocan').constant('projectName',projName);
        angular.module('sodocan').constant('sodocanInit',ret);
        var app = window.sodocanApp || 'sodocan';
        angular.bootstrap(document,[app]);
      });
});
