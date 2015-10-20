angular.module( 'sodocan', [
/*  'sodocan.header',
  'sodocan.sidebar',
  'sodocan.content',
  'sodocan.footer',
  'sodocan.router' */
])

.config(function($locationProvider){
  //should prob contain most of what's in sodocanCtrl
  $locationProvider.html5Mode(true);
})

.factory('sodocanAPI', ['$http', 'projectName', function($http,projectName) {

  var projectURL = '/api/get/'+projectName+'/';
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

.controller('sodocanCtrl',
            ['$location','$scope','sodocanAPI', 'sodocanInit',
              function ($location,$scope,sodocanAPI,sodocanInit) {
  // possibly best moved to config
  // TODO: sodocan router
  sodocanAPI.docs = sodocanInit;
  $scope.projectName = sodocanAPI.projectName;
  $scope.pageTitle = sodocanAPI.projectName;
}]);

angular.element(document).ready(function() {
    var $initInjector = angular.injector(['ng']);
    var $http = $initInjector.get('$http');

    var project = window.location.pathname.split('/')[1];

    $http.get('/api/get/'+project).then(
      function(resp) {
        var ret = {};
        var projName;
        resp.data.map(function(method) {
          ret[method.functionName] = method;
          projName = method.project;
        });
        angular.module('sodocan').constant('projectName',projName);
        angular.module('sodocan').constant('sodocanInit',ret);
        angular.bootstrap(document,['sodocan']);
      });
});
