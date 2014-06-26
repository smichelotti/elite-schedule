(function () {
    'use strict';

    angular.module('leagueApp').filter('spaceToPlus', ['common', spaceToPlus]);

    function spaceToPlus(common) {
        return function (text) {
            return common.replaceAll(' ', '+', text);
        };
    }

    angular.module('leagueApp').filter('plusToSpace', ['common', plusToSpace]);

    function plusToSpace(common) {
        return function (text) {
            return common.replaceAll('+', ' ', text);
        };
    }
})();