(function () {
    'use strict';

    var controllerId = 'fullschedule';
    angular.module('leagueApp').controller(controllerId, ['leagueApi', '$route', fullschedule]);

    function fullschedule(leagueApi, $route) {
        console.log("****in fullschedule controller");
        console.log($route.current.locals);

        /*jshint validthis: true */
        var vm = this;
        vm.games = leagueApi.games;
        vm.leagueName = leagueApi.league.name;
    }
})();
