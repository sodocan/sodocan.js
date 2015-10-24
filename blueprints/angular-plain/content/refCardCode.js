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
        console.log('DESC_ARR: ');
        console.log(data);
      });
    }
    if (type==='tips') {
      sodocanAPI.getTips(func,'all',2,function(err,data) {
        if (err) console.log('____ERROR: '+err);
        console.log('TIPS_ARR: ');
        console.log(data);
      });
    }
    if (type==='examples') {
      sodocanAPI.getExamples(func,-1,0,function(err,data) {
        if (err) console.log('___ERROR: '+err);
        console.log('EXAMPLE_ARR: ');
        console.log(data);
      });
    }
  };

  function postResp(err,data) {
    if (err) console.log('___ERROR: '+err);
    console.log('POST_RESP: '+data);
  }

  $scope.NewEntry = {};
  $scope.NewEntryType = {};
  $scope.addEntry = function(item) {
    console.log($scope.NewEntry[item]+ ' ____ ' +$scope.NewEntryType[item]);
    if ($scope.NewEntryType[item]==='description') {
      sodocanAPI.newDescription(item,$scope.NewEntry[item],postResp);
    }
    if ($scope.NewEntryType[item]==='example') {
      sodocanAPI.newExample(item,$scope.NewEntry[item],postResp);
    }
    if ($scope.NewEntryType[item]==='tip') {
      sodocanAPI.newTip(item,$scope.NewEntry[item],postResp);
    }

  };
}]);
