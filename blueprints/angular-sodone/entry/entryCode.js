angular.module('sodocan')
.directive('sodocanEntry', function(){
  return{
    restrict: 'A',
    replace: true,
    templateUrl: 'angular-sodone/entry/entryTpl.html'
  };
})
.controller('sodocanEntryCtrl',['$scope', 'sodocanAPI', 'sodocanRouter',
  function($scope, sodocanAPI, sodocanRouter){
    console.log($scope);
    $scope.upvote = function(){
      $scope.entry.upvotes++;
    };

    $scope.tempComments = []; 
    pushLocalComment = function(){
      var theComment = {
        text: $scope.commentText,
        upvotes: 0
      };
      $scope.$apply(function(){
        tempComments.push(theComment);
      });  
    };

    $scope.hideTextArea = true; 
    $scope.toggleTextArea = function(){
      $scope.hideTextArea = !$scope.hideTextArea; 
    };

    $scope.submitComment = function(){
      if($scope.commentText){
        console.log("submitting");
        // sodocanAPI.newComment($scope.entry.entryID, $scope.methodName,
        //  $scope.explanationType, $scope.commentText);
        pushLocalComment(); 
        //$scope.commentText = ''; 
        //$scope.toggleTextArea();
      }  
    };
}]);