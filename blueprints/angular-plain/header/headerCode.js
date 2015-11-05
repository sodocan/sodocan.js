/*
 * Sets the heading display to the project name
 */

angular.module('sodocan')
.directive('sodocanHeader', function() {
  return {
    restrict: 'A',
    replace: 'true',
    templateUrl: 'angular-plain/header/headerTpl.html'
  };
})
.controller('sodocanHeaderCtrl', ['$scope', 'sodocanAPI', function($scope,sodocanAPI) {
  $scope.display = sodocanAPI.projectName;

  $scope.test = function() {
    
    /* also H4rold for testing
    sodocanAPI.register('Harold','lept0n',function(err,resp) {
      if (!err) console.log('registered');
    });
    */

    if (window.localStorage.getItem('sodocanToken')) {
      sodocanAPI.logout(function(err,resp) {
        if (err) console.log('__ERR');
        console.log(err);
        console.log(resp);
      });
    } else {
      sodocanAPI.login('Harold','lept0n',function(err,resp) {
        if (err) {
          console.log('___ERROR:');
          console.log(err);
          return;
        }

        console.log('___LOGGED IN:');
        console.log(resp);
      });
    }
    /*
     * register example:
     *
     * sodocanAPI.register('Harold','lept0n',function(err,resp) {});
     */

    /* upvoting test
     *

    var upvoter,addID;
    var refObj = {
      //ref: 'Ctor',
      context: {
        descriptions:[2,2],
        examples:[3,1],
        tips:[1,2]
      }
    };
    sodocanAPI.getTips(function(err,data) {
      if (err) console.log(err);
      console.log('__RESP:');
      console.log(data);
      console.log(sodocanAPI.docs);
      return;
      upvoter = data[0].entryID;
      addID = data[0].additions[1].additionID;
      sodocanAPI.upvote(upvoter,'clone','tips',addID,function(err,data) {
        console.log(data);
        sodocanAPI.getReference(refObj,function(e,d) {
          console.log('>>upvote');
          console.log(d.clone.explanations.tips[0]);
        });
      });
    });
    */
  };
}]);
