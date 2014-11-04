(function () {
    'use strict';

    angular.module('eliteApp').factory('eliteApi', eliteApi);

    eliteApi.$inject = ['$http', '$rootScope', 'appSpinner'];

    function eliteApi($http, $rootScope, appSpinner) {
        var service = {
            addLeague: addLeague,
            deleteLeague: deleteLeague,
            deleteSlot: deleteSlot,
            deleteTeam: deleteTeam,
            getLeague: getLeague,
            getLeagues: getLeagues,
            getLocations: getLocations,
            getSlots: getSlots,
            getTeams: getTeams,
            saveLeague: saveLeague,
            saveSlot: saveSlot,
            saveTeam: saveTeam
        };

        return service;


        function addLeague(league) {
            return httpPost('/api/leagues', league);
        }

        function deleteLeague(id) {
            return httpDelete('/api/leagues/' + id);
        }

        function deleteSlot(id) {
            return httpDelete('/api/slots/' + id);
        }

        function deleteTeam(id) {
            return httpDelete('/api/teams/' + id);
        }

        function getLeague(leagueId) {
            return httpGet('/api/leagues/' + leagueId);
        }

        function getLeagues() {
            return httpGet('/api/leagues');
        }

        function getLocations() {
            return httpGet('/api/locations');
        }

        function getSlots(leagueId) {
            return httpGet('/api/slots?leagueId=' + leagueId);
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

        function saveSlot(slot) {
            return saveItem('/api/slots', slot);
        }

        function saveTeam(team) {
            return saveItem('/api/teams', team);
        }

        /// Private Methods

        function httpDelete(url) {
            return httpExecute(url, 'DELETE');
        }

        function httpExecute(requestUrl, method, data) {
            var spinnerMsg = (method === 'GET' ? 'Retrieving Data...' : 'Saving Changes...');
            appSpinner.showSpinner(spinnerMsg);
            return $http({
                url: requestUrl,
                method: method,
                data: data
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