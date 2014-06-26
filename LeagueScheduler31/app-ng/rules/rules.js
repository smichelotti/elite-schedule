(function () {
    'use strict';

    angular.module('leagueApp').controller('rules', ['$scope', 'leagueApi', rules]);

    function rules($scope, leagueApi) {
        var vm = this;

        vm.leagueName = leagueApi.league.name;
        vm.rulesContent = leagueApi.league.rulesScreen;
    }
})();
