(function () {
    'use strict';

    angular.module('eliteApp').factory('eliteApi', eliteApi);

    eliteApi.$inject = ['$http', '$rootScope', 'appSpinner'];

    function eliteApi($http, $rootScope, appSpinner) {
        var service = {
            addLeague: addLeague,
            deleteLeague: deleteLeague,
            deleteTeam: deleteTeam,
            getLeagues: getLeagues,
            getLocations: getLocations,
            getTeams: getTeams,
            saveLeague: saveLeague,
            saveTeam: saveTeam
        };

        return service;


        function addLeague(league) {
            return httpPost('/api/leagues', league);
        }

        function deleteLeague(id) {
            return httpDelete('/api/leagues/' + id);
        }

        function deleteTeam(id) {
            return httpDelete('/api/teams/' + id);
        }

        function getLeagues() {
            return httpGet('/api/leagues');
        }

        function getLocations() {
            return httpGet('/api/locations');
        }

        function getTeams(leagueId) {
            return httpGet('/api/teams?leagueId=' + leagueId);
        }

        function saveItem(url, item) {
            if (item.id) {
                return httpPut(url + '/' + item.id, item);
            } else {
                return httpPost(url, item);
            }
        }

        function saveLeague(league) {
            return saveItem('/api/leagues', league);
        }

        function saveTeam(team) {
            return saveItem('/api/teams', team);
        }

        /// Private Methods

        function httpDelete(url) {
            return httpExecute(url, 'DELETE');
        }

        function httpExecute(requestUrl, method, data) {
            appSpinner.showSpinner();
            return $http({
                url: requestUrl,
                method: method,
                data: data
                //headers: requestConfig.headers
            }).then(function (response) {

                appSpinner.hideSpinner();
                console.log('**response from EXECUTE', response);
                return response.data;
            }, function (err) {
                console.log('***Error executing HTTP request:', err);
            });
        }

        function httpGet(url) {
            return httpExecute(url, 'GET');
        }

        function httpPatch(url, data) {
            return httpExecute(url, 'PATCH', data);
        }

        function httpPost(url, data) {
            return httpExecute(url, 'POST', data);
        }

        function httpPut(url, data) {
            return httpExecute(url, 'PUT', data);
        }
    }
})();