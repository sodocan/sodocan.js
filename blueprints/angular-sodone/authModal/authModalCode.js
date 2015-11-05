angular.module('sodocan')

.controller('authCtrl', ['$scope','sodocanAPI','sodocanRouter','$window',
  function ($scope, sodocanAPI, sodocanRouter, $window) {
    $scope.invalidLogin = false;
    $scope.login = function() {
      $scope.invalidLogin = false;
      sodocanAPI.login($scope.username, $scope.password, function(err){
        if (err) {
          $scope.invalidLogin = true;
        }
        else {
          $window.location.reload();
          $scope.hideModal();
        }
      });
    };
    $scope.signup = function() {
      console.log($scope.password);
      console.log($scope.username);
      sodocanAPI.register($scope.username, $scope.password, function(err){
        $window.location.reload();
        console.log(err);
      });
    };
  }]);
