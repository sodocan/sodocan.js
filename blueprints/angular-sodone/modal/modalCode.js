angular.module('sodocan')
.directive('sodocanModal',function(){
  return {
    replace: true,
    templateUrl: 'angular-sodone/modal/modalTpl.html'
  };
})

.controller('sodocanModalCtrl',['$scope','sodocanAPI','sodocanRouter',
  function($scope, sodocanAPI, sodocanRouter){
    $scope.show = false; 
    $scope.hideModal = function(){
      $scope.show = false; 
      console.log('hiding modal');
    };
    $scope.$on('displayModal', function(){
      console.log('showing modal');
      $scope.show = true; 
    });
    $scope.innerTemplate="local-entries-modal"; 
}]);