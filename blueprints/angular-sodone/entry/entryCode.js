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
    $scope.upvote = function(){
      $scope.entry.upvotes++;
    };

    $scope.tempComments = []; 
    $scope.pushLocalComment = function(){
      var theComment = {
        text: $scope.commentText,
        upvotes: 0
      };
      console.log($scope);
      console.log($scope.commentText);
      $scope.tempComments.push(theComment);  
    };

    $scope.hideTextArea = true; 
    $scope.toggleTextArea = function(){
      $scope.hideTextArea = !$scope.hideTextArea; 
    };

    $scope.submitComment = function(){
      if($scope.commentText){
        // sodocanAPI.newComment($scope.entry.entryID, $scope.methodName,
        //  $scope.explanationType, $scope.commentText);
        $scope.pushLocalComment(); 
        $scope.commentText = ''; 
        $scope.toggleTextArea();
      }  
    };
}]);