(function () {
    'use strict';

    angular.module('eliteApp').factory('gamesInitialDataService', gamesInitialDataService);

    gamesInitialDataService.$inject = ['$q', 'eliteApi'];

    /* @ngInject */
    function gamesInitialDataService($q, eliteApi) {
        var service = {
            getData: getData
        };

        return service;

        ////////////////

        function getData(leagueId) {

            return $q.all([
                eliteApi.getTeams(leagueId),
                eliteApi.getGames(leagueId),
                eliteApi.getSpecialRequests(leagueId),
                eliteApi.getLocations()
            ]).then(function(results){
                //console.log('***initial data results', results);
                return {
                    teams: results[0],
                    games: results[1],
                    specialRequests: results[2],
                    locations: results[3]
                };
            });
        }
    }
})();