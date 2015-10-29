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
    console.log('comments',$scope);
    $scope.upvote = function(){
      $scope.comment.upvotes++;
    };
}]);