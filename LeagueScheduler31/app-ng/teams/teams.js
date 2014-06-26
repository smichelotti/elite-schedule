(function () {
    'use strict';

    var controllerId = 'teams';
    angular.module('leagueApp').controller(controllerId, ['leagueApi', teams]);

    function teams(leagueApi) {
        var vm = this;
        vm.teams = leagueApi.teams;
        vm.leagueName = leagueApi.league.name;
    }
})();
