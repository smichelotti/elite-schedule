(function () {
    'use strict';

    angular.module('eliteApp').directive('automaticfocus', automaticfocus);

    automaticfocus.$inject = ['$timeout'];

    function automaticfocus($timeout) {
        return function (scope, element, attr) {
            $timeout(function () {
                element[0].focus();
            }, 100, false);
        }
    }
})();