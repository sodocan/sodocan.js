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
  
  // Takes context objects, such as from router or controllers,
  // and returns it as API URL string
  // Slight misnomer, also accepts arguments array in the format:
  // [ref,entry#,add#,cb]
  var objToUrl = function(toConvert) {

    // arguments
    if (Array.isArray(toConvert)) {
      var ref,entryNum,commentNum,cb;
      if (typeof toConvert[0] === 'function' || !toConvert[0]) {
        ref = '';
        entryNum = -1;
        commentNum = -1;
        cb = toConvert[0] || function(){};
      } else if (typeof toConvert[1] === 'function') {
        entryNum = 1;
        commentNum = 1;
        cb = toConvert[1];
      } else if (typeof toConvert[2] === 'function') {
        entryNum = toConvert[1];
        commentNum = 1;
        cb = toConvert[2];
      } else if (toConvert.length===4) {
        entryNum = toConvert[1];
        commentNum = toConvert[2];
        cb = toConvert[3];
      } else {
        // TODO: WARNING: Fails silently on malformed input
        return 'ERROR';
      }
      if (entryNum===-1) entryNum = 'all';
      if (commentNum===-1) commentNum = 'all';
    }

      return built;
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
    // TODO: getRef shorthand
  };

  obj.getDescriptions = function(ref) {
    var entryNum,commentNum,cb;
    if (typeof arguments[1] === 'function') {
      entryNum = 1;
      commentNum = 1;
      cb = arguments[1];
    } else if (typeof arguments[2] === 'function') {
      entryNum = arguments[1];
      commentNum = 1;
      cb = arguments[2];
    } else if (arguments.length===4) {
      entryNum = arguments[1];
      commentNum = arguments[2];
      cb = arguments[3];
    } else {
      // TODO: WARNING: fails silently on bad input
      return;
    }
    if (entryNum===-1) entryNum = 'all';

    getFromAPI('ref/'+ref+'/'+entryNum+'/'+commentNum,function(err,data) {
      
      if (err) cb(err);
      
      obj.docs[ref].explanations.descriptions = data[0].explanations.descriptions;
      cb(null,obj.docs[ref].explanations.descriptions);

    });
  };

  obj.getExamples = function(ref) {
    var entryNum,commentNum,cb;
    if (typeof arguments[1] === 'function') {
      entryNum = 1;
      commentNum = 1;
      cb = arguments[1];
    } else if (typeof arguments[2] === 'function') {
      entryNum = arguments[1];
      commentNum = 1;
      cb = arguments[2];
    } else if (arguments.length===4) {
      entryNum = arguments[1];
      commentNum = arguments[2];
      cb = arguments[3];
    } else {
      // TODO: WARNING: fails silently on bad input
      return;
    }
    if (entryNum===-1) entryNum = 'all';

    getFromAPI('ref/'+ref+'/examples/'+entryNum+'/'+commentNum,function(err,data) {
      
      if (err) cb(err);
      
      obj.docs[ref].explanations.examples = data[0].explanations.examples;
      cb(null,obj.docs[ref].explanations.examples);

    });
  };

  obj.getTips = function() {

    var ref,entryNum,commentNum,cb;

    if (typeof arguments[0] === 'function' || !arguments[0]) {
      ref = '';
      entryNum = -1;
      commentNum = -1;
      cb = arguments[0] || function(){};
    } else if (typeof arguments[1] === 'function') {
      ref = arguments[0];
      entryNum = 1;
      commentNum = 1;
      cb = arguments[1];
    } else if (typeof arguments[2] === 'function') {
      ref = arguments[0];
      entryNum = arguments[1];
      commentNum = 1;
      cb = arguments[2];
    } else if (arguments.length===4) {
      ref = arguments[0];
      entryNum = arguments[1];
      commentNum = arguments[2];
      cb = arguments[3];
    } else {
      // TODO: WARNING: fails silently on bad input
      return;
    }
    if (entryNum===-1) entryNum = 'all';
    if (commentNum===-1) commentNum = 'all';

    getFromAPI('ref/'+ref+'/tips/'+entryNum+'/'+commentNum,function(err,data) {
      
      if (err) cb(err);
      
      obj.docs[ref].explanations.tips = data[0].explanations.tips;
      cb(null,obj.docs[ref].explanations.tips);

    });
  };

  // additions TODO: needs everything passed, this format needs to be rethought
  // no easy way to update larger docs object from an entryID
  obj.getComments = function(context,entryID,commentNum,cb) {
    
    getFromAPI(context+'/'+entryID+'/'+commentNum,function(err,data) {
      if (err) cb(err);

      cb(null,data[0]);
    });

  };

  // API.refreshTop requeries initial load, replaces existing docs object
  // Inefficiently allows for top-level settings changes
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

  // Shorthand that lacks UI support, update all of below in one query
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
                if (err) cb(err);
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
                if (err) cb(err);
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
                if (err) cb(err);
                cb(null,data);
              }
             );
  };

  obj.editComment = function() {

  };

  // untested, does this really need proj,funcName, context, and ID?
  obj.newComment = function(entryID,ref,text,cb) {
    cb = cb || function(){};
    sendToAPI('addEntry',
              {
                entryID:entryID,
                project: projectName,
                functionName:ref,
                context:'examples',
                text:text
              },
              function(err,data) {
                if (err) cb(err);
                cb(null,data);
              }
             );
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
        console.log(ret);
        angular.bootstrap(document,['sodocan']);
      });
});
