/*
 * Sets up the content block,
 * which is just reference card inserts
 */

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
  // update function tracks viewed methods and adds them
  // to be displayed. Simple, for illustrative purposes
  var update = function(path) {
    if (!displayed[path.ref] && path.ref!==undefined) {
      $scope.contentRefs.unshift(path.ref);
      displayed[path.ref]=true;
    }
  };
  // initialize vars
  var displayed = {};
  $scope.contentRefs=[];
  // watch function created by router to see URL changes
  $scope.$watch('sodocanRoute()',update);

  // init documentation data in scope
  $scope.docs = sodocanAPI.docs;
}]);
