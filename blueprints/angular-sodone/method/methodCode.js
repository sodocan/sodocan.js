angular.module('sodocan')
.directive('sodocanMethod', function(){
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'angular-sodone/method/methodTpl.html'
  };
})
.controller('sodocanMethodCtrl',
            ['$scope','sodocanAPI','sodocanRouter',
              function($scope,sodocanAPI,sodocanRouter) {
  $scope.printReference = function(refType){
    var result = ''; 
    if(refType === 'returns' && $scope.method.reference.returns.length > 0){
      result+= ' => ';
    }
    for(var i = 0; i < $scope.method.reference[refType].length; i++){
      var name = $scope.method.reference[refType][i].name;
      var type = $scope.method.reference[refType][i].type;
      if(type){
        result+= type;
      }
      if(type && name){
        result+= ':'; 
      }
      if(name){
        result+= name;
      } 
      if(i !== $scope.method.reference[refType].length - 1){
        result+=', ';
      }  
    }
    return result; 
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

  $scope.entriesNum = 1;
  $scope.commentsNum = 1; 

  $scope.$on('localContextButton', function(event, context, state){
    $scope.clickedContext(context, state);
  });

  $scope.clickedContext = function(context, state){
    if(state){
      console.log("state");
      $scope.styles[context].on = state;
    }else{
      console.log('non state');
      $scope.styles[context].on = !$scope.styles[context].on;
    }
    if(!$scope.styles[context].on){
      $scope.styles[context].style = '';
    }
    else{
      $scope.styles[context].style = 'off';    
    }
  };

  $scope.entryOptions = [
    {text: "Top Entry", number: 1},
    {text: "Top 2 Entries", number: 2},
    {text: "Top 3 Entries", number: 3},
    {text: "Top 5 Entries", number: 5},
    {text: "Top 10 Entries", number: 10},
    {text: "All Entries", number: -1},
  ];
  $scope.selectedEntryOption = $scope.entryOptions[0];
  $scope.entriesDownloaded = 1; 

  $scope.changedEntrySelection = function(){
    if($scope.entriesDownloaded !== -1){ //all are already dl'd
      if($scope.selectedEntryOption === -1){ //NOTE: refactor to ASYNC for improved UX
        $scope.entriesDownloaded = -1; 
      }
      if($scope.selectedEntryOption > $scope.entriesDownloaded){
        $scope.entriesDownloaded = $scope.selectedEntryOption; 
      }
    } 
  };
  // console.log('methods:',$scope.method);
  // console.log('$scope:',$scope);
  // sodocanAPI.getDescriptions($scope.method.functionName,5,5, function(err,data){
  //   console.log('descriptions',err,data); 
  // });
  // sodocanAPI.getExamples($scope.method.functionName,5,5, function(err,data){
  //   console.log('examples',err,data); 
  // });
  sodocanAPI.getDescriptions($scope.method.functionName,5,5, function(err,data){
    // console.log('tips',sodocanAPI.docs,data); 
  });
}]);