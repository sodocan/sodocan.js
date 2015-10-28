angular.module('sodone')
.directive('sodocanEntry', function(){
  return{
    restrict: 'A',
    replace: true,
    templateUrl: 'angular-sodone/entry/entryTpl.html'
  };
})
.controller('sodocanEntryCtrl',['$scope', 'sodocanAPI', 'sodocanRouter',
  function($scope, sodocanAPI, sodocanRouter){
    console.log($scope);
}]);