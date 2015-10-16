angular.module('sodocan')
.directive('sodocanHeader', function() {
  return {
    restrict: 'A',
    replace: 'true',
    templateUrl: 'angular-plain/header.html'
  };
})
.controller('sodocanHeaderCtrl', ['$scope', 'sodocanData', function($scope,sodocanData) {
  $scope.display = 'Working';
}]);
