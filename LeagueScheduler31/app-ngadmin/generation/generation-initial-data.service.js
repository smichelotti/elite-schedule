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
            var teams = eliteApi.getTeams(leagueId);

            var promisesList = [teams];
            return $q.all(promisesList).then(function (results) {
                // Hide spinner
                return {
                    teams: results[0].data,
                    slotRanges: getSlotRanges(leagueId)
                };
            });
        }

        function getSlotRanges(leagueId) {
            var slotRanges = [];
            var ranges = window.localStorage.getItem('slotRanges-' + leagueId);
            if (ranges) {
                ranges = JSON.parse(ranges);
                _.each(ranges, function (range) {
                    range.startTime = new Date(range.startTime);
                    range.endTime = new Date(range.endTime);
                });
                slotRanges = ranges;
            }
            return slotRanges;
        }
    }
})();