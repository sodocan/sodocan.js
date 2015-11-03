angular.module('sodocan')
.directive('sodocanComment',function(){
  return{
    retrict: 'A',
    replace: true,
    templateUrl: 'angular-sodone/comment/commentTpl.html'
  };
})
.controller('sodocanCommentCtrl',['$scope','sodocanAPI','sodocanRouter',
  function($scope, sodocanAPI, sodocanRouter){
    $scope.upvote = function(){
      $scope.comment.upvotes++;
      $scope.sendUpvote($scope.comment.commentID); 
    };
}]);