
var app = angular.module('sodocan')
.directive('sodocanApp', function() {
  return {
    restrict: 'A',
    replace: 'true',
    templateUrl: 'angular-sodone/app/appTpl.html'
  };
})
.controller('sodocanAppCtrl',
            ['$scope','sodocanAPI','sodocanRouter',
              function($scope,sodocanAPI,sodocanRouter) {
  var update = function(path) {
    console.log('path', path); 
    $scope.contentDisp = path;
  };
  $scope.$on('globalContextButton', function(event, context,state){
    $scope.$broadcast('localContextButton', context, state); 
    console.log('app listened');
  });
  $scope.$watch('sodocanRoute()',update);
}]);