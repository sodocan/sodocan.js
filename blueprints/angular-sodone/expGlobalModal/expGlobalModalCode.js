angular.module('sodocan')
.controller('sodocanExpGlobalModalCtrl',['$scope', 'sodocanAPI', 'sodocanRouter',
  function($scope, sodocanAPI, sodocanRouter){
    $scope.loadEntries = function(num, context){
      console.log('from moda', num, context); 
      $scope.$emit('navLoadEntries', num, context); 
    };
    $scope.loadComments = function(num, context){
      $scope.$emit('navLoadComments', num, context); 
    };
}]);