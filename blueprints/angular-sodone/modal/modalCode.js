angular.module('sodocan')
.directive('sodocanModal',function(){
  return {
    replace: true,
    templateUrl: '../angular-sodone/modal/modalTpl.html'
  };
})
.factory('modalSettings', function(){
  return {
    bgStyle: {},
    windowStyle: {},
    innerTemplate: '',
    event: null
  };
})
.controller('sodocanModalCtrl',['$scope','sodocanAPI','sodocanRouter','$timeout',
  function($scope, sodocanAPI, sodocanRouter, $timeout){
    $scope.show = false; 
    $scope.hideModal = function(){
      $scope.show = false; 
    };
    $scope.$on('displayModal', function(event, originalEvent, settings){
      $scope.show = true; 
      $scope.bgStyle = settings.bgStyle; 
      $scope.windowStyle = settings.windowStyle; 
      $scope.event = originalEvent; 
      $scope.innerTemplate = settings.templateUrl;
    });
    $scope.event = null; 
    $scope.bgStyle = {};

    //This will always be overwritten, but this shows a centered, modal.
    $scope.windowStyle = {
      top:0,
      left:0,
      right:0,
      bottom:0,
      margin:'auto',
    }; 
    $scope.innerTemplate = ''; 
}]);