angular.module('sodocan')
.directive('sodocanHeader', function() {
  return {
    restrict: 'A',
    replace: 'true',
    templateUrl: 'angular-plain/header/headerTpl.html'
  };
})
.controller('sodocanHeaderCtrl', ['$scope', 'sodocanAPI', function($scope,sodocanAPI) {
  $scope.display = sodocanAPI.projectName;
}]);
