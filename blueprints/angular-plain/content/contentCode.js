angular.module('sodocan')
.directive('sodocanContent', function() {
  return {
    restrict: 'A',
    replace: 'true',
    templateUrl: 'angular-plain/content/contentTpl.html'
  };
})
.controller('sodocanContentCtrl',
            ['$location','$scope','sodocanAPI', function($location,$scope,sodocanAPI) {
  
  // TODO: abstract this out to sodocan topLevel
  var update = function(path) {
    $scope.contentDisp = $location.path();
    if (typeof path!=='array') {
      path = $location.path().split('/').filter(function(val) {
        return !(val==='');
      });
    }
    if (path.length>0) {
      if (isFinite(path[0])) {
        // numbers to API
        $scope.contentDisp = 'Number returns: '+path[0];
      } else {
        // start stacking ref call
        $scope.contentDisp = 'Search for reference: '+path[0];
      }
    } else {
      $scope.contentDisp = 'Default';
    }
  };
  $scope.$on('$locationChangeStart', update);

  // on first load
  update(sodocanAPI.path);
}]);
