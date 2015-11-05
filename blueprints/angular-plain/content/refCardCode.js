/*
 * Display widget for an function/method entry
 */

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

  // default type view, used lots below
  $scope.EntryType = 'descriptions';

  // Background colors for entry type
  $scope.refCardBg = {
    'descriptions':'#eaa',
    'examples':'#aea',
    'tips':'#aae'
  };

  // update refCard view
  $scope.changeCard = function(type,item) {
    if (type==='desc') {
      $scope.EntryType = 'descriptions';
    }
    if (type==='exam') {
      $scope.EntryType = 'examples';
    }
    if (type==='tips') {
      $scope.EntryType = 'tips';
    }
    loadEntryData(type,item);
  };

  // helper func, loads data for given type & functionName
  // Text updates due to Angular binding, could also add watching function
  // eg: $scope.updateOnChange = function() { return sodocanAPI.docs.thingToWatch; };
  // Though that could get expensive
  // 
  // Note: As of now, requesting specific entry for a type replaces that func's data
  //       Leaning towards this being desired behavior, but please give feedback
  //       if you have a different opinion!
  //
  // The callback functions log data to the console, as you can see
  // they actually request varying amounts of data.
  var loadEntryData = function(type,func) {
    // reset comment var, used for visual & convenience checks
    $scope.comment = '';
    if (type==='desc') {
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
    if (type==='exam') {
      sodocanAPI.getExamples(func,-1,3,function(err,data) {
        if (err) console.log('___ERROR: '+err);
        console.log('EXAMPLE_ARR: ');
        console.log(data);
      });
    }
    // working only with top entries means we only need functionName
    if (type==='comments') {
      sodocanAPI.getComments(func,
                             $scope.EntryType,
                             sodocanAPI.docs[func].explanations[$scope.EntryType][0].entryID,
                             -1,
                             function(err,data) {
        if (err) {
          console.log('___ERROR:');
          console.log(err);
          return;
        }
        console.log(data);
      });
    }
  };

  // helper for logging reponses
  function postResp(err,data) {
    if (err) {
      console.log('___ERROR: ');
      console.log(err);
      console.log('Errors return non-CORS 404 page');
      return;
    }
    console.log('POST_RESP: '+data);
  }

  // object is for the new reference entry forms,
  // function below submits the data
  // This shows helper functions, also possible to use getReference() with
  // reference object as first argument
  $scope.NewEntry = {};
  $scope.addEntry = function(item) {
    console.log('Adding '+$scope.NewEntry[item]+' as '+$scope.EntryType);
    // hack for working generically, comments is set for text display
    // when user clicks 'Add Comment', so allows us to check that var
    // and still keep EntryType context
    if ($scope.comment!=='comments') {
      if ($scope.EntryType==='descriptions') {
        sodocanAPI.newDescription(item,$scope.NewEntry[item],postResp);
      }
      if ($scope.EntryType==='examples') {
        sodocanAPI.newExample(item,$scope.NewEntry[item],postResp);
      }
      if ($scope.EntryType==='tips') {
        sodocanAPI.newTip(item,$scope.NewEntry[item],postResp);
      }
    } else {
      sodocanAPI.newComment(sodocanAPI.docs[item].explanations[$scope.EntryType][0].entryID,
                            item,
                            $scope.EntryType,
                            $scope.NewEntry[item],
                            postResp);
    }
  };

  // Edits! confusing, but you get the idea, right??
  $scope.editEntry = function(item,comment) {
    if (comment) {
      sodocanAPI.editComment(sodocanAPI.docs[item].explanations[$scope.EntryType][0].entryID,
                             item,
                             $scope.EntryType,
                             $scope.NewEntry[item],
                             comment.commentID,
                             function(err,data) {
                               if (!err) {
                                 comment.text = $scope.NewEntry[item];
                               }
                               postResp(err,data);
                             });
    } else {
      sodocanAPI.editDescription(item,
                                 $scope.NewEntry[item],
                                 sodocanAPI.docs[item].explanations[$scope.EntryType][0].entryID,
                                 function(err,data) {
                                   if (!err) {
                                     sodocanAPI.docs[item].explanations[$scope.EntryType][0].text = $scope.NewEntry[item];
                                   }
                                   postResp(err,data);
                                 });
    }
  };

  // we only work with top entries, so only need the functionName
  $scope.upvote = function(item,comment) {
    if (!comment) {
      sodocanAPI.upvote(sodocanAPI.docs[item].explanations[$scope.EntryType][0].entryID,
                        item,
                        $scope.EntryType,
                        function(err,data) {
                          if (!err) {
                            // err doesn't trigger for dup/self-vote atm <-- FYI
                            sodocanAPI.docs[item].explanations[$scope.EntryType][0].upvotes++;
                          }
                          postResp(err,data);
                        });
    } else {
      sodocanAPI.upvote(sodocanAPI.docs[item].explanations[$scope.EntryType][0].entryID,
                        item,
                        $scope.EntryType,
                        comment.commentID,
                        function(err,data) {
                          if (!err) {
                            // err doesn't trigger for dup/self-vote atm <-- FYI
                            comment.upvotes++;
                          }
                          postResp(err,data);
                        });
    }
  };

}]);
