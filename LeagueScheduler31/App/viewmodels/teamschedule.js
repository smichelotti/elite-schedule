﻿define(['data/leagueData'], function (leagueData) {
    var vm = {
        activate: activate,
        title: ko.observable(),
        games: ko.observableArray(),

        scoreDisplay: function (item) {
            console.log("inside score display", item);

            return "";
        }
    };

    return vm;

    function activate(name) {
        vm.title('Team Schedule for ' + name);

        var teamGames = _.chain(leagueData.data.games)
            .filter(function (item) { return item.team1 == name || item.team2 == name; })
            .map(function (item) {
                var isTeam1 = (item.team1 === name ? true : false);
                var opponentName = isTeam1 ? item.team2 : item.team1;
                var scoreDisplay = getScoreDisplay(isTeam1, item.team1Score, item.team2Score);
                return { opponent: opponentName, time: item.time, location: item.location, locationUrl: item.locationUrl, scoreDisplay: scoreDisplay, homeAway: (isTeam1 ? "vs." : "at") };
            }).value();

        vm.games(teamGames);

        return true;
    }

    function getScoreDisplay(isTeam1, team1Score, team2Score) {
        if (team1Score && team2Score) {
            var teamScore = (isTeam1 ? team1Score : team2Score);
            var opponentScore = (isTeam1 ? team2Score : team1Score);
            var winIndicator = Number(teamScore) > Number(opponentScore) ? "W: " : "L: ";
            return winIndicator + teamScore + "-" + opponentScore;
        }
        else {
            return "";
        }
    }
});