angular.module('sodocan')
.directive('sodocanExplanation',function(){
  return{
    restrict: 'A',
    replace: true,
    templateUrl: '../angular-sodone/explanation/explanationTpl.html'
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
      comments: []
    };
    $scope.localEntries.push(entry); 
  };


  $scope.submitEntry = function(){ 
    if($scope.entryText){
      //the actual server request
      submitType[$scope.explanationType]($scope.methodName, $scope.entryText, function(){console.log('posted');});
      //display it locally
      pushLocalEntry(); 
      //clear and close
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
  $scope.showModal = function(event){
    //The modal takes in this json as properties for the window
    //there is an example of a centered modal in modalCode
    var width = 450; 
    var modalSettings = {
      windowStyle: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        margin: 'auto',
        width: '600px',
        height: '130px'
        // left: event.x - (width/2) + 'px',
        // top: event.y + 'px',
        // width: width +'px',
        // height: 100 + 'px'
      },
      bgStyle: {
        opacity: 0.2
      },
      templateUrl: '../angular-sodone/expLocalModal/expLocalModalTpl.html'
    };
    $scope.$emit('clickedShowModal', modalSettings); 
  };

  $scope.dldEntries = 1;
  $scope.dldComments = 0; 
  $scope.displayedEntries = 1; 
  $scope.displayedComments = 0;

  //Maybe the comments should be on a per entry basis, as opposed to
  //by explanation. 
  $scope.loadEntries = function(num){
    if(num === -1){
      $scope.displayedEntries = undefined; 
    }else{
      $scope.displayedEntries = num; 
    }
    if($scope.dldEntries !== -1){
      if(num > $scope.dldEntries || num === -1){
        $scope.dldEntries = num; 
        getType[$scope.explanationType]($scope.method.functionName, num, function(err,data){});
      }
    }
  };
  $scope.loadOneMore = function(){
    if($scope.displayedEntries !== -1){
      $scope.loadEntries($scope.displayedEntries + 1); 
    }
  };
  $scope.loadOneLess = function(){
    //consider having it so if they unload the only entry, turn off that context.
    if($scope.displayedEntries !== 1){
      if($scope.displayedEntries !== undefined){
        $scope.loadEntries($scope.displayedEntries - 1); 
      }
      else{
        $scope.loadEntries($scope.entryArray.length - 1);
      }
    }
  };

  $scope.loadComments = function(num){
    console.log('broadcasting load comments'); 
    $scope.$broadcast('loadComments',num); 
  };

  //not currently used, but thought it might be useful
  $scope.hideComments = function(){
    $scope.displayedComments = 0; 
  };

  //routing for GET requests
  var getType = {
    examples: sodocanAPI.getExamples,
    tips: sodocanAPI.getTips,
    descriptions: sodocanAPI.getDescriptions
  };

  $scope.$on('loadEntries', function(event, num, context){
    console.log('on explanation', context, $scope.explanationType);  
    if(context === $scope.explanationType){
      console.log('loading entires starting');
      $scope.loadEntries(num);
    }
  });

}]);