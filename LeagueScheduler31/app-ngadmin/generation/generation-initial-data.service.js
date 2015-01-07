(function () {
    'use strict';

    angular.module('eliteApp').factory('generationInitialDataService', generationInitialDataService);

    generationInitialDataService.$inject = ['$q', 'eliteApi'];

    function generationInitialDataService($q, eliteApi) {
        var service = {
            getData: getData
        };

        return service;

        function getData(leagueId) {
            // Show spinner
            return $q.all([
                eliteApi.getTeams(leagueId),
                eliteApi.getSlots(leagueId),
                eliteApi.getLocations(),
                eliteApi.getSpecialRequestsFull(leagueId)
            ]).then(function (results) {
                // Hide spinner
                return {
                    teams: results[0],
                    slotRanges: results[1],
                    locations: results[2],
                    scheduleRequests: results[3]
                };
            });
        }
    }
})();