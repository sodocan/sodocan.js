angular.module('sodocan')
.controller('sodocanExpLocalModalCtrl',['$scope','sodocanAPI','sodocanRouter',
  function($scope, sodocanAPI, sodocanRouter){
    $scope.loadEntries = function(num){
      // console.log('targetScope', $scope.event);
      $scope.event.targetScope.loadEntries(num); 
    };
    $scope.loadComments = function(num){
      $scope.event.targetScope.loadComments(num); 
    };
}]);