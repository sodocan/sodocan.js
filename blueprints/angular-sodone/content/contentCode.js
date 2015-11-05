angular.module('sodocan')
.directive('sodocanContent', function() {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: '../angular-sodone/content/contentTpl.html'
  };
})
.controller('sodocanContentCtrl',
            ['$scope','sodocanAPI','sodocanRouter',
              function($scope,sodocanAPI,sodocanRouter) {
  var update = function(path) {
    $scope.contentDisp = path;
  };
  $scope.docs = sodocanAPI;
  $scope.$watch('sodocanRoute()',update);
}]);