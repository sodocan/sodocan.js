angular.module('sodocan')
.directive('sodocanContent', function() {
  return {
    restrict: 'A',
    replace: 'true',
    templateUrl: 'angular-plain/content/contentTpl.html'
  };
})
.controller('sodocanContentCtrl',
            ['$scope','sodocanAPI','sodocanRouter',
              function($scope,sodocanAPI,sodocanRouter) {
  var update = function(path) {
    if (!displayed[path.ref] && path.ref!==undefined) {
      $scope.contentRefs.unshift(path.ref);
      displayed[path.ref]=true;
    }
  };
  var displayed = {};
  $scope.contentRefs=[];
  $scope.$watch('sodocanRoute()',update);

  $scope.docs = sodocanAPI.docs;
}]);
