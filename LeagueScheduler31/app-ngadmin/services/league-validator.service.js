(function () {
    'use strict';

    angular.module('eliteApp').factory('leagueValidator', leagueValidator);

    //utils.$inject = ['$rootScope'];

    function leagueValidator() {
        var service = {
            isTimeAvailableForTeam: isTimeAvailableForTeam,
            validateAll: validateAll
        };

        return service;


        function isTimeAvailableForTeam(requestDay, slotStart) {
            if (requestDay) {
                var unavailHours = _.chain(requestDay.unavailableHours).filter('selected').map('hour').value();
                if (unavailHours.length > 0) {
                    var slotHour = slotStart.hour();
                    var hourMatch = _.contains(unavailHours, slotHour);
                    return !hourMatch;
                }
            }
            return true;
        }

        function validateAll(allTeams, allGames, numberOfRounds) {
            numberOfRounds = Number(numberOfRounds);
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


            if (teamGames.length !== numberOfRounds) {
                validations.push(fullTeamName + ' - Number of games is: ' +
                    teamGames.length + '. Should be: ' + numberOfRounds);
            }

            var minTimeBetweenGames = 60,
                maxTimeBetweenGames = 260;//240;

            for (var i = 0; i < teamGames.length; i++) {
                if (i === 0) {
                    continue;
                }

                var formatString = 'MM/DD/YYYY h:mm a';
                var previousStart = moment(teamGames[i - 1].gameTime);
                var currentStart = moment(teamGames[i].gameTime);
                var diff = currentStart.diff(previousStart, 'minutes');
                var gameTimes = previousStart.format(formatString) + ' and ' + currentStart.format(formatString);

                if (previousStart.isSame(currentStart, 'day')) {
                    if (diff < minTimeBetweenGames) {
                        validations.push(fullTeamName + ' - Insufficient time between games: ' +
                            diff + ' minutes. Should be at least: ' + minTimeBetweenGames +
                            '. Game times: ' + gameTimes);
                    } else if (diff > maxTimeBetweenGames) {
                        validations.push(fullTeamName + ' - Too much time between games: ' +
                            diff + ' minutes. Should be at most: ' + maxTimeBetweenGames +
                            '. Game times: ' + gameTimes);
                    }
                }
            }
        }
    }
})();