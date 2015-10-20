angular.module('sodocan')
.directive('sodocanFooter', function() {
  return {
    restrict: 'A',
    replace: 'true',
    templateUrl: 'angular-plain/footer/footerTpl.html'
  };
});
