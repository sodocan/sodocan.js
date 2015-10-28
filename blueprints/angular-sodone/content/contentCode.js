angular.module('sodone')
.directive('sodocanContent', function() {
  return {
    restrict: 'A',
    replace: 'true',
    templateUrl: 'angular-sodone/content/contentTpl.html'
  };
})
.controller('sodocanContentCtrl',
            ['$scope','sodocanAPI','sodocanRouter',
              function($scope,sodocanAPI,sodocanRouter) {
  var update = function(path) {
    console.log('path', path); 
    $scope.contentDisp = path;
  };
  $scope.docs = sodocanAPI;
  console.log('sodocan api', $scope.docs); 
  $scope.$watch('sodocanRoute()',update);
}]);