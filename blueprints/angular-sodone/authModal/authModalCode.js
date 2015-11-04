angular.module('sodocan')

.controller('authCtrl', ['$scope','sodocanAPI','sodocanRouter',
  function ($scope, sodocanAPI, sodocanRouter) {
    $scope.invalidLogin = false;
    $scope.login = function() {
      $scope.invalidLogin = false;
      sodocanAPI.login($scope.username, $scope.password, function(err){
        if (err) {
          $scope.invalidLogin = true;
        }
        else {
          $scope.hideModal();
        }
      });
    };
    $scope.signup = function() {
      console.log($scope.password);
      console.log($scope.username);
      sodocanAPI.register($scope.username, $scope.password, function(err){
        console.log(err);
      });
    };
  }]);
