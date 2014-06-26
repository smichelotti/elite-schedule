(function () {
    'use strict';

    angular.module('leagueApp').controller('locations', ['$scope', 'leagueApi', locations]);

    function locations($scope, leagueApi) {
        var vm = this;

        vm.locations = leagueApi.locations;
        vm.leagueName = leagueApi.league.name;
    }
})();
