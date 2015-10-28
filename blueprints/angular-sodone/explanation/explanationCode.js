angular.module('sodone')
.directive('sodocanExplanation',function(){
  return{
    restrict: 'A',
    replace: true,
    templateUrl: 'angular-sodone/explanation/explanationTpl.html'
  };
})
.controller('sodocanExplanationCtrl',
            ['$scope','sodocanAPI','sodocanRouter',
              function($scope,sodocanAPI,sodocanRouter) {
}]);