angular.module('sodocan')
.directive('sodocanEntry', function(){
  return{
    restrict: 'A',
    replace: true,
    templateUrl: 'angular-sodone/entry/entryTpl.html'
  };
})
.controller('sodocanEntryCtrl',['$scope', 'sodocanAPI', 'sodocanRouter', 'projectName',
  function($scope, sodocanAPI, sodocanRouter, projectName){
    $scope.upvote = function(){
      $scope.entry.upvotes++;
      $scope.sendUpvote(); 
    };
    $scope.sendUpvote = function(commentID){
      var upvoteJSON = {
        project: projectName,
        functionName:$scope.method.functionName,
        context: $scope.explanationType,
        entryID: $scope.entry.entryID
      };
      if(commentID){
        upvoteJSON.commentID = commentID; 
      }
      sodocanAPI.sendToAPI('upvote', upvoteJSON, function(){});
    };

    //When a new entry is added, we fake it on the front end, while also sending 
    //it to the server
    $scope.tempComments = []; 
    $scope.pushLocalComment = function(){
      var theComment = {
        text: $scope.commentText,
        upvotes: 0
      };
      $scope.tempComments.push(theComment);  
    };

    $scope.hideTextArea = true; 
    $scope.toggleTextArea = function(){
      $scope.hideTextArea = !$scope.hideTextArea; 
    };

    $scope.submitComment = function(){
      if($scope.commentText){
        $scope.newComment($scope.entry.entryID, $scope.methodName,
          $scope.commentText, $scope.explanationType);
        $scope.pushLocalComment(); 
        $scope.commentText = ''; 
        $scope.toggleTextArea();
      }  
    };
    $scope.newComment = function(entryID,ref,text,context,cb) {
    cb = cb || function(){};
    sodocanAPI.sendToAPI('addEntry',
              {
                entryID:entryID,
                project: projectName,
                functionName:ref,
                context: context,
                text:text
              },
              function(err,data) {
                if (err) cb(err);
                cb(null,data);
              }
             );
  };
    //Changes the number to be displayed
    //WIll also dl new ones, if the displayed number is increased above previous max
    $scope.loadComments = function(event, num, context){
      if(!context || $scope.explanationType === context){
        if(num === -1){ // -1 means all
          //for limitTo, undefined means 'all' or do not restrict
          $scope.displayedComments = undefined; 
        }else{
          $scope.displayedComments = num; 
        }
        if($scope.dldComments !== -1){ //if you haven't downloaded all the comments already
          if(num > $scope.dldComments || num === -1){
            $scope.dldComments = num; 
            //For efficiency, eventually this should be moved to an async version
            //Currently we up the dldComments number before they actually get dl'd
            $scope.getComments($scope.method.functionName,$scope.explanationType,
             $scope.entry.entryID, num, $scope.$index, function(err,data){});
          }
        }
      }
    };

    //this should eventually be moved to sodocanAPI
    //Makes the request, then updates the model
    $scope.getComments = function(ref, context, entryID, numComments, index){
      var url = 'ref/'+ref+'/'+context+'/'+'entryID-'+entryID+'/'+numComments;
      sodocanAPI.getFromAPI(url,function(err,data){
      if(err){
        console.error(err);
      }
        else{
          sodocanAPI.docs[ref].explanations[context][index].comments = data[0].explanations[context][0].comments; 
          console.log('loaded data',data); 
        }
      });
    };
    $scope.$on('loadComments', $scope.loadComments); 

    //Icons display / hide with mouse over
    $scope.iconCSS = 'hide-icon'; 
    $scope.mouseEnter = function(){
      $scope.iconCSS = 'icon';
    };
    $scope.mouseLeave = function(){
      $scope.iconCSS = 'hide-icon';
    };
}]);