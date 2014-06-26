(function () {
    'use strict';

    var controllerId = 'home';
    angular.module('leagueApp').controller(controllerId, ['leagueApi', home]);

    function home(leagueApi) {
        var vm = this;
        vm.leagueName = leagueApi.league.name;
        vm.homeContent = leagueApi.league.homeScreen;
    }
})();
