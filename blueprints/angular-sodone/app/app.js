/*
  Top level controller
  Handles watching the router for changes
  Hub for most emit / broadcast functions
*/

var app = angular.module('sodocan')
.directive('sodocanApp', function() {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: '../angular-sodone/app/appTpl.html'
  };
})
.controller('sodocanAppCtrl',
            ['$scope','sodocanAPI','sodocanRouter',
              function($scope,sodocanAPI,sodocanRouter) {
  var update = function(path) {
    $scope.contentDisp = path;
  };
  $scope.$on('navContextButton', function(event, context,state){
    $scope.$broadcast('localContextButton', context, state); 
  });
  $scope.$on('clickedShowModal',function(event, settings){
    $scope.$broadcast('displayModal', event, settings); 
  }); 
  $scope.$on('navLoadEntries', function(event, num, context){
    console.log('in app', arguments);
    $scope.$broadcast('loadEntries', num, context);
  });
  $scope.$on('navLoadComments', function(event, num, context){
    $scope.$broadcast('loadComments', num, context); 
  });
  $scope.$watch('sodocanRoute()',update);
}]);