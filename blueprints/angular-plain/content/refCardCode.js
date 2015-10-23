angular.module('sodocan')
.directive('refCard', function() {
  return {
    restrict: 'AE',
    replace: 'true',
    templateUrl: 'angular-plain/content/refCardTpl.html'
  };
})
.controller('refCardCtrl',
            ['$scope','sodocanAPI','sodocanRouter',
              function($scope,sodocanAPI,sodocanRouter) {
  $scope.loadEntryData = function(type,func) {
    if (type==='descriptions') {
      sodocanAPI.getDescriptions(func,-1,function(err,data) {
        if (err) console.log('____ERROR: '+err);
        console.log('DESC_ARR: '+data);
      });
    }
    if (type==='tips') {
      sodocanAPI.getTips(func,'all',2,function(err,data) {
        if (err) console.log('____ERROR: '+err);
        console.log('TIPS_ARR: '+data);
      });
    }
    if (type==='examples') {
      sodocanAPI.getExamples(func,-1,0,function(err,data) {
        if (err) console.log('___ERROR: '+err);
        console.log('EXAMPLE_ARR: '+data);
      });
    }
  };

  $scope.NewEntry = {};
  $scope.NewEntryType = {};
  $scope.addEntry = function(item) {
    var textID = item+'NewEntry';
    var type = item+'EntryType';
    console.log(textID+ ' ____ ' + type);
    console.log($scope.NewEntry[item]+ ' ____ ' +$scope.NewEntryType[item]);
  };
}]);
