(function () {
    'use strict';

    angular.module('eliteApp').factory('leagueValidator', leagueValidator);

    //utils.$inject = ['$rootScope'];

    function leagueValidator() {
        var service = {
            validateAll: validateAll
        };

        return service;



        function validateAll(allTeams, allGames, numberOfRounds) {
            var validations = [];

            _.forEach(allTeams, function (team) {
                validateTeamGames(team, allGames, numberOfRounds, validations);
            });

            return validations;
        }

        function validateTeamGames(team, allGames, numberOfRounds, validations) {
            var fullTeamName = team.name + ' (Division: ' + team.division + ')';
            var teamGames = _.filter(allGames, function (game) {
                return game.team1Id === team.id || game.team2Id === team.id;
            });

            console.log(fullTeamName, teamGames.length);

            //var messages = [];

            if (teamGames.length !== numberOfRounds) {
                validations.push('Number of games for ' + fullTeamName + ' is: ' +
                    teamGames.length + '. Should be: ' + numberOfRounds);
            }
        }
    }
})();