﻿(function () {
    'use strict';

    angular.module('eliteApp').factory('eliteApi', eliteApi);

    eliteApi.$inject = ['$http', '$rootScope', 'appSpinner'];

    function eliteApi($http, $rootScope, appSpinner) {
        var service = {
            addLeague: addLeague,
            addLeagueMember: addLeagueMember,
            deleteGame: deleteGame,
            deleteLeague: deleteLeague,
            deleteSlot: deleteSlot,
            deleteSpecialRequest: deleteSpecialRequest,
            deleteTeam: deleteTeam,
            editLeagueMember: editLeagueMember,
            getGames: getGames,
            getIdentityInfo: getIdentityInfo,
            getLeague: getLeague,
            getLeagueMembers: getLeagueMembers,
            getLeagues: getLeagues,
            getLocations: getLocations,
            getSlots: getSlots,
            getSpecialRequest: getSpecialRequest,
            getSpecialRequests: getSpecialRequests,
            getSpecialRequests2: getSpecialRequests2,
            getSpecialRequestsFull: getSpecialRequestsFull,
            getTeams: getTeams,
            publishLeague: publishLeague,
            removeLeagueMember: removeLeagueMember,
            resetGames: resetGames,
            saveContentScreen: saveContentScreen,
            saveGame: saveGame,
            saveLeague: saveLeague,
            saveSlot: saveSlot,
            saveSpecialRequest: saveSpecialRequest,
            saveSpecialRequest2: saveSpecialRequest2,
            saveTeam: saveTeam
        };

        return service;


        function addLeague(league) {
            return httpPost('/api/leagues', league);
        }

        function addLeagueMember(leagueId, newMember) {
            return httpPost('/api/leagues/' + leagueId + '/members', newMember);
        }

        function deleteGame(id) {
            return httpDelete('/api/games/' + id);
        }

        function deleteLeague(id) {
            return httpDelete('/api/leagues/' + id);
        }

        function deleteSlot(id) {
            return httpDelete('/api/slots/' + id);
        }

        function deleteSpecialRequest(leagueId, teamId) {
            return httpDelete('/api/docs/schedule-requests/league-' + leagueId + '/' + teamId);
        }

        function deleteTeam(id) {
            return httpDelete('/api/teams/' + id);
        }

        function editLeagueMember(leagueId, memberId, member) {
            return httpPut('/api/leagues/' + leagueId + '/members/' + memberId, member);
        }

        function getGames(leagueId) {
            return httpGet('/api/games?leagueId=' + leagueId);
        }

        function getIdentityInfo() {
            return httpGet('/api/identity/info');
        }

        function getLeague(leagueId) {
            return httpGet('/api/leagues/' + leagueId);
        }

        function getLeagueMembers(leagueId) {
            return httpGet('/api/leagues/' + leagueId + '/members');
        }

        function getLeagues() {
            //return httpGet('/api/leagues');
            return httpGet('/api/my-leagues');
        }

        function getLocations() {
            return httpGet('/api/locations');
        }

        function getSlots(leagueId) {
            return httpGet('/api/slots?leagueId=' + leagueId);
        }

        function getSpecialRequests(leagueId) {
            return httpGet('/api/specialrequests?leagueId=' + leagueId);
        }

        function getSpecialRequest(leagueId, teamId) {
            return httpGet('/api/docs/schedule-requests/league-' + leagueId + '/' + teamId);
        }

        function getSpecialRequests2(leagueId) {
            return httpGet('/api/docs/schedule-requests-list/league-' + leagueId);
            //return httpGet('/api/docs/schedule-requests-list?leagueId=' + leagueId);
        }

        function getSpecialRequestsFull(leagueId) {
            return httpGet('/api/docs/schedule-requests-full/league-' + leagueId);
        }

        function getTeams(leagueId) {
            return httpGet('/api/teams?leagueId=' + leagueId);
        }

        function publishLeague(leagueId) {
            return httpPost('/api/leagues/' + leagueId + '/publish');
        }

        function removeLeagueMember(leagueId, memberId) {
            return httpDelete('/api/leagues/' + leagueId + '/members/' + memberId);
        }

        function resetGames(leagueId) {
            return httpPost('/api/leagues/' + leagueId + '/reset-games');
        }

        function saveContentScreen(contentType, leagueId, text) {
            var url = "/api/leagues/" + leagueId + "/" + contentType + "-screen";
            return httpPut(url, { text: text });
        }

        function saveItem(url, item) {
            if (item.id) {
                return httpPut(url + '/' + item.id, item);
            } else {
                return httpPost(url, item);
            }
        }

        function saveGame(game) {
            return saveItem('/api/games', game);
        }

        function saveLeague(league) {
            return saveItem('/api/leagues', league);
        }

        function saveSlot(slot) {
            return saveItem('/api/slots', slot);
        }

        function saveSpecialRequest(specialRequest) {
            return saveItem('/api/specialrequests', specialRequest);
        }

        function saveSpecialRequest2(leagueId, teamId, specialRequest) {
            return saveItem('/api/docs/schedule-requests/league-' + leagueId + '/' + teamId, specialRequest);
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
                appSpinner.hideSpinner();
                console.log('***Error executing HTTP request:', err);
                return err;
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