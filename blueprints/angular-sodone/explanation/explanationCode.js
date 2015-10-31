angular.module('sodocan')
.directive('sodocanExplanation',function(){
  return{
    restrict: 'A',
    replace: true,
    templateUrl: 'angular-sodone/explanation/explanationTpl.html'
  };
})
.controller('sodocanExplanationCtrl',
            ['$scope','sodocanAPI','sodocanRouter',
              function($scope,sodocanAPI,sodocanRouter) {

  $scope.hideTextArea = true; 
  $scope.toggleTextArea = function(){
    $scope.hideTextArea = !$scope.hideTextArea;
  };

  //This is about posting your rentires immediately, without talking to server
  $scope.localEntries = []; 
  var pushLocalEntry = function(){
    var entry = {
      text: $scope.entryText,
      upvotes: 0,
      additions: []
    };
    $scope.localEntries.push(entry); 
  };


  $scope.submitEntry = function(){
    console.log('submitted:',$scope.entryText);
    console.log($scope.explanationType); 
    if($scope.entryText){
      submitType[$scope.explanationType]($scope.methodName, $scope.entryText);
      pushLocalEntry(); 
      $scope.entryText = ''; 
      $scope.toggleTextArea();
    }
  };
  //routing for actions
  var submitType = {
    examples: sodocanAPI.newExample,
    descriptions: sodocanAPI.newDescription, 
    tips:sodocanAPI.newTip 
  };
  //Icons display / hide with mouse over
  $scope.iconCSS = 'hide-icon'; 
  $scope.mouseEnter = function(){
    $scope.iconCSS = 'icon';
  };
  $scope.mouseLeave = function(){
    $scope.iconCSS = 'hide-icon';
  };
  $scope.showModal = function(){
    $scope.$emit('clickedShowModal'); 
  };

}]);