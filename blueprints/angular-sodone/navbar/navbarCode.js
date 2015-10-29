angular.module('sodocan')
.directive('sodocanNavbar', function(){
  return{
    restrict: 'A',
    replace: true,
    templateUrl: 'angular-sodone/navbar/navbarTpl.html'
  };
})
.controller('sodocanNavbarController', ['$scope', 'sodocanAPI', 'sodocanRouter',
  function($scope, sodocanAPI, sodocanRouter){
    $scope.projectName = sodocanAPI.projectName;
    

    $scope.styles = {
    'descriptions':{
      'on': false,
      'style': ''
    },
    'tips':{
      'on': false,
      'style': ''
    },
    'examples':{
      'on': false,
      'style': ''
    }
  };

  $scope.entriesNum = 1;
  $scope.commentsNum = 1; 

  $scope.clickedContext = function(context){
    $scope.styles[context].on = !$scope.styles[context].on;
    $scope.$emit('globalContextButton', context, $scope.styles[context].on); 
    if(!$scope.styles[context].on){
      $scope.styles[context].style = '';
    }
    else{
      $scope.styles[context].style = 'off';    
    }
  };

}]);