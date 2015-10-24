angular.module('sodocan')
.directive('sodocanMethod', function(){
  return {
    restrict: 'A',
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
}]);