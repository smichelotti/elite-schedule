(function() {
    'use strict';

    angular.module('leagueApp').directive('markdown', ['$window', markdown]);
    
    function markdown ($window) {
        // Usage:
        // <div data-markdown="{{vm.content}}"></div>
        // Creates:
        // 
        var converter = new Showdown.converter();

        var directive = {
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            console.info("**** inside directive****");
            attrs.$observe('markdown', function (value) {
                var markup = converter.makeHtml(value);
                element.html(markup);
            });
        }
    }
})();