/* 
 * Replace the sidebar DIV with the template,
 * load the functionNames into an array on scope,
 * add a function to load a new method (by changing the URL)
 */

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

  // this may not be necessary (due to angular intercepting A-HREFs),
  // but could be useful for more complex widgets
  $scope.load = function(method) {
    $location.path(method);
  };
}]);
