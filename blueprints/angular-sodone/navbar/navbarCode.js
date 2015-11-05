angular.module('sodocan')
.directive('sodocanNavbar', function(){
  return{
    restrict: 'A',
    replace: true,
    templateUrl: '../angular-sodone/navbar/navbarTpl.html'
  };
})
.controller('sodocanNavbarController', ['$scope', 'sodocanAPI', 'sodocanRouter', '$window',
  function($scope, sodocanAPI, sodocanRouter, $window){
    $scope.projectName = sodocanAPI.projectName;
    $scope.authToken = sodocanAPI.authToken;
    $scope.signOut = function(){
      sodocanAPI.logout(function(){
        $window.location.reload();
      });
    };

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
        top:0,
        left:0,
        right:0,
        bottom:0,
        margin:'auto',
        width: '600px',
        height: '440px'
      },
      bgStyle: {
        opacity: 0.2
      },
      templateUrl: '../angular-sodone/expGlobalModal/expGlobalModalTpl.html'
    };
    $scope.$emit('clickedShowModal', modalSettings); 
  };

  $scope.showLoginModal = function(event){
    //The modal takes in this json as properties for the window
    //there is an example of a centered modal in modalCode
    var width = 600; 
    var modalSettings = {
      windowStyle: {
        top:0,
        left:0,
        right:0,
        bottom:0,
        margin:'auto',
        width: '350px',
        height: '250px'
      },
      bgStyle: {
        opacity: 0.9
      },
      templateUrl: '../angular-sodone/authModal/loginModalTpl.html'
    };
    $scope.$emit('clickedShowModal', modalSettings); 
  };

  $scope.showSignupModal = function(event){
    //The modal takes in this json as properties for the window
    //there is an example of a centered modal in modalCode
    var width = 600; 
    var modalSettings = {
      windowStyle: {
        top:0,
        left:0,
        right:0,
        bottom:0,
        margin:'auto',
        width: '350px',
        height: '250px'
      },
      bgStyle: {
        opacity: 0.9
      },
      templateUrl: '../angular-sodone/authModal/signupModalTpl.html'
    };
    $scope.$emit('clickedShowModal', modalSettings); 
  };

}]);