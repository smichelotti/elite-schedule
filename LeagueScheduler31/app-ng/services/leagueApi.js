(function () {
    'use strict';

    var serviceId = 'leagueApi';
    angular.module('leagueApp').factory(serviceId, ['$http', '$q', leagueApi]);

    function leagueApi($http, $q) {
        var primePromise;
        var $q = $q;

        var service = {
            primeData: primeData,
        };

        return service;

        function primeData(leagueId, isPreview) {
            //var defer = $q.defer();
            console.log("***inside primeData");
            if (primePromise) return primePromise;

            console.log("***about to retrieve data");

            //var url = "/data/leagueData.json";
            var url = "/api/leaguedata/" + leagueId;
            if (isPreview) {
                url += "/preview";
            }

            primePromise = $http.get(url).success(function (response) {
                console.log("***response", response);
                service.teams = response.teams;
                service.games = response.games;
                service.locations = response.locations;
                service.league = response.league;
                service.standings = response.standings;
            });
            return primePromise;
        }

        //function primeData(leagueId, isPreview) {
        //    if (primePromise) return primePromise;

        //    primePromise = $q.all([getLeagueData()]).then(success);
        //    return primePromise;

        //    function success() {
        //        console.log("***in success()");
        //    }
        //}

        function getLeagueData() {
            var url = "/data/leagueData.json";

            return $http.get(url).then(function (response) {
                service.teams = response.data.teams;
                service.games = response.data.games;
                service.locations = response.data.locations;
                service.league = response.data.league;
                service.standings = response.data.standings;
            });
        }

        //function primeData(leagueId, isPreview) {
        //    var url = "/data/leagueData.json";

        //    return $http.get(url).then(function (response) {
        //        service.teams = response.data.teams;
        //        service.games = response.data.games;
        //        service.locations = response.data.locations;
        //        service.league = response.data.league;
        //        service.standings = response.data.standings;
        //    });
        //}

        //#region Internal Methods        

        //#endregion
    }
})();