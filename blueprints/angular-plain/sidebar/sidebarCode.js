angular.module('sodocan')
.directive('sodocanSidebar', function() {
  return {
    restrict: 'A',
    replace: 'true',
    templateUrl: 'angular-plain/sidebar/sidebarTpl.html'
  };
})
.controller('sodocanSidebarCtrl',
            ['$location','$scope','sodocanAPI', function($location,$scope,sodocanAPI) {
  $scope.methods = Object.keys(sodocanAPI.docs);
  $scope.load = function(method) {
    $location.path(method);
  };
}]);
