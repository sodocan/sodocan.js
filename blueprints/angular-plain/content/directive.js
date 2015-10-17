angular.module('sodocan')
.directive('sodocanContent', function() {
  return {
    restrict: 'A',
    replace: 'true',
    templateUrl: 'angular-plain/content/template.html'
  };
})
.controller('sodocanContentCtrl', ['$scope','sodocanData', function($scope,sodocanData) {
    $scope.contentDisp = sodocanData.docs.thing1;
}]);
