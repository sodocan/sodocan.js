angular.module('sodocan')
.directive('sodocanNavbar', function(){
  return{
    restrict: 'A',
    replace: true,
    templateUrl: 'angular-sodone/navbar/navbarTpl.html'
  };
})
.controller('sodocanNavbarController', ['$scope', 'sodocanAPI', 'sodocanRouter',
  function($scope, sodocanAPI, sodocanRouter){
    $scope.projectName = sodocanAPI.projectName;
}]);