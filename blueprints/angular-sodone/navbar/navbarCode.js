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

  $scope.clickedContext = function(context){
    $scope.styles[context].on = !$scope.styles[context].on;
    $scope.$emit('navContextButton', context, $scope.styles[context].on); 
    if(!$scope.styles[context].on){
      $scope.styles[context].style = '';
    }
    else{
      $scope.styles[context].style = 'off';    
    }
  };

  $scope.showModal = function(event){
    //The modal takes in this json as properties for the window
    //there is an example of a centered modal in modalCode
    var width = 600; 
    var modalSettings = {
      windowStyle: {
        left: event.x - (width/2) + 'px',
        top: event.y + 40 + 'px',
        width: width +'px',
        height: 300 + 'px'
      },
      bgStyle: {
        opacity: 0.2
      },
      templateUrl: 'angular-sodone/expGlobalModal/expGlobalModalTpl.html'
    };
    $scope.$emit('clickedShowModal', modalSettings); 
  };

}]);