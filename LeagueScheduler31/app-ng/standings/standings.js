(function () {
    'use strict';

    angular.module('leagueApp').controller('standings', ['$scope', 'leagueApi', standings]);

    function standings($scope, leagueApi) {
        var vm = this;
        vm.standings = leagueApi.standings;
        vm.leagueName = leagueApi.league.name;
    }
})();
