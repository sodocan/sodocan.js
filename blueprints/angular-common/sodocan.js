angular.module( 'sodocan', [
/*  'sodocan.header',
  'sodocan.sidebar',
  'sodocan.content',
  'sodocan.footer',
  'sodocan.router' */
])

.config(function($locationProvider){
  //should prob contain most of what's in sodocanCtrl
  $locationProvider.html5Mode(true).hashPrefix('!');
})

.factory('sodocanAPI', ['$http', 'projectName', function($http,projectName) {

  var projectURL = '/api/'+projectName+'/';
  // api/get/{{projectName}}/ref/{{method}}
  var obj = {};
  obj.projectName = projectName;
  obj.getReference = function(ref,cb) {
    return $http.get(projectURL+ref);
  };

  obj.refreshTop = function() {
    return $http.get(projectURL).success(function(data) {
      obj.docs = data;
    });
  };

  return obj;
}])

.factory('sodocanRouter', ['$location', '$http','$rootScope','sodocanAPI',
                           function($location,$http,$rootScope,sodocanAPI) {
  var contexts = {
    'description':true,
    'tips':true,
    'examples':true
  };
  var obj = {};
  obj.update = function() {
    obj.route = {};
    obj.route.numbers = [];
    var path = $location.path().split('/').filter(function(val) {
      return !(val==='');
    });
    // path[ 0 -> # or method
    //       1 -> # or context
    //       2 -> # for context or ID ]
    var piece;
    while (path.length>0) {
      piece = path.shift();
      if (contexts[piece]) {
        obj.route.context = piece;
      } else if (isFinite(piece) || piece==='all') {
        obj.route.numbers.push(piece);
      } else {
        obj.route.ref = piece;
      }
    }
  };
  
  obj.update();
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

    var project = window.location.pathname.split('/')[1];

    $http.get('/api/'+project).then(
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
        angular.bootstrap(document,['sodocan']);
      });
});
