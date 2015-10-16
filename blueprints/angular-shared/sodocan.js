angular.module( 'sodocan', [
/*  'sodocan.header',
  'sodocan.sidebar',
  'sodocan.content',
  'sodocan.footer',
  'sodocan.router' */
])

.config(function(){
})

// use Q? pull in external?
.factory('sodocanData', ['$http', function($http) {
  var url = 'api/';

  var obj = {};
  obj.ready = false;
  obj.getReference = function(ref,cb) {
    $http.get(url+ref).success(cb);
  };

  obj.getAll = function(cb) {
    $http.get(url).success(function(data) {
      obj.docs = data;
      cb(true);
    });
  }

  return obj;
}])

.controller('sodocanCtrl', ['$scope','sodocanData', function ($scope,sodocanData) {
  sodocanData.getAll(function(ready) {
    //maybe do something?
  });
}])

.controller('sodocanHeaderCtrl', function($scope) {
  $scope.display='Testing';
});
