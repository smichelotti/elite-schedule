(function () {
    'use strict';

    var controllerId = 'teamschedule';
    angular.module('leagueApp').controller(controllerId, ['$routeParams', 'leagueApi', teamschedule]);

    function teamschedule($routeParams, leagueApi) {
        var vm = this;

        vm.teamName = $routeParams.id;
        vm.leagueName = leagueApi.league.name;

        var teamGames = _.chain(leagueApi.games)
            .filter(function (item) { return item.team1 == vm.teamName || item.team2 == vm.teamName; })
            .map(function (item) {
                var isTeam1 = (item.team1 === vm.teamName ? true : false);
                var opponentName = isTeam1 ? item.team2 : item.team1;
                var scoreDisplay = getScoreDisplay(isTeam1, item.team1Score, item.team2Score);
                return { opponent: opponentName, time: item.time, location: item.location, locationUrl: item.locationUrl, scoreDisplay: scoreDisplay, homeAway: (isTeam1 ? "vs." : "at") };
            }).value();


        vm.games = teamGames;

        //#region Internal Methods 

        function getScoreDisplay(isTeam1, team1Score, team2Score) {
            if (team1Score && team2Score) {
                var teamScore = (isTeam1 ? team1Score : team2Score);
                var opponentScore = (isTeam1 ? team2Score : team1Score);
                var winIndicator = teamScore > opponentScore ? "W: " : "L: ";
                return winIndicator + teamScore + "-" + opponentScore;
            }
            else {
                return "";
            }
        }
        //#endregion
    }
})();
