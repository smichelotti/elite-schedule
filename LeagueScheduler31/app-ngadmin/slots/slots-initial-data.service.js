(function () {
    'use strict';

    angular.module('eliteApp').factory('slotsInitialDataService', slotsInitialDataService);

    slotsInitialDataService.$inject = ['$q', 'eliteApi'];

    /* @ngInject */
    function slotsInitialDataService($q, eliteApi) {
        var service = {
            getData: getData
        };

        return service;

        ////////////////

        function getData(leagueId) {

            return $q.all([
                eliteApi.getSlots(leagueId),
                eliteApi.getLocations()
            ]).then(function (results) {
                //console.log('***slots initial data results', results);
                return {
                    slots: results[0],
                    locations: results[1]
                };
            });
        }
    }
})();