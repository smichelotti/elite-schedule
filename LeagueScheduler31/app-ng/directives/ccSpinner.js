(function() {
    'use strict';

    angular.module('leagueApp').directive('ccSpinner', ['$window', ccSpinner]);
    
    function ccSpinner ($window) {
        // Usage:
        //  <div data-cc-spinner="vm.spinnerOptions"></div>
        // Creates:
        //  New spinner and sets its options.

        var directive = {
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            scope.spinner = null;
            scope.$watch(attrs.ccSpinner, function (options) {
                if (scope.spinner) {
                    scope.spinner.stop();
                }
                scope.spinner = new $window.Spinner(options);
                scope.spinner.spin(element[0]);
            }, true);
        }
    }
})();