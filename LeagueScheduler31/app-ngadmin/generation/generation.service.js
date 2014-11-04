(function () {
    'use strict';

    angular.module('eliteApp').factory('generationService', generationService);

    //generationService.$inject = ['$q', 'eliteApi'];

    function generationService() {
        var service = {
            generateMatchUps: generateMatchUps,
            generateSlots: generateSlots,
            generateGameAssignments: generateGameAssignments
        };

        return service;

        function generateGameAssignments(teams, slotRanges, numberOfRounds, locationsLookup) {
            var availableSlots = generateSlots(slotRanges);
            var matchups = generateMatchUps(teams, numberOfRounds);

            var games = [];

            _.forEach(matchups, function (mu) {
                var slot = availableSlots.shift();
                var game = {
                    startTime: slot.startTime,
                    locationId: slot.locationId,
                    locationName: locationsLookup[slot.locationId],
                    division: mu.division,
                    round: mu.round,
                    display: mu.display
                };
                games.push(game);
            });

            return games;
        }

        function generateMatchUps(teams, numberOfRounds) {
            var allMatchUps = [];
            var groups = _.chain(teams)
                          .groupBy('division')
                          .pairs()
                          .map(function (item) {
                              return _.object(_.zip(['division', 'teams'], item));
                          })
                          .value();

            console.log('groups', groups);

            _.each(groups, function (item) {
                generateMatchUpsForDivision(item, numberOfRounds, allMatchUps);
            });

            return allMatchUps;
        }

        function generateMatchUpsForDivision(divisionGroup, numberOfRounds, allMatchUps) {
            console.log('divisionGroup', divisionGroup, numberOfRounds);
            var bye = 'BYE';
            var oddTeamsInDivision = (divisionGroup.teams.length % 2 !== 0);
            if (oddTeamsInDivision) {
                // Just need a "placeholder" during generation
                console.log(divisionGroup.division + ' ODD number of teams (' + divisionGroup.teams.length + ')');
                divisionGroup.teams.push({ name: bye });
            }

            var teamsList = divisionGroup.teams;
            var numTeams = divisionGroup.teams.length;
            if (oddTeamsInDivision) {
                numberOfRounds++;
            }
            var numGamesPerRound = numTeams / 2;

            for (var i = 0; i < numberOfRounds; i++) { // for each "round"
                // Generate all games for a round
                for (var g = 0; g < numGamesPerRound; g++) {
                    var matchup = {
                        round: (i + 1),
                        team1: teamsList[g].id,
                        team1Name: teamsList[g].name,
                        team2: teamsList[numTeams - 1 - g].id,
                        team2Name: teamsList[numTeams - 1 - g].name,
                        display: teamsList[g].name + ' vs. ' + teamsList[numTeams - 1 - g].name,
                        division: divisionGroup.division
                    };

                    if (matchup.team1Name !== bye && matchup.team2Name !== bye) {
                        allMatchUps.push(matchup);
                    }
                }

                // Now Shift before going onto the next round
                // First team is always the "fixed hub". Remove it, shift teams, then add it back to beginning.
                var fixedTeam = teamsList.shift();
                var last = teamsList.pop();
                teamsList.unshift(last);
                teamsList.unshift(fixedTeam);
            }
        }

        function generateSlots(slotRanges) {
            var generatedSlots = [];

            _.each(slotRanges, function (slot) {
                var rangeStart = moment(slot.startTime);
                var rangeEnd = moment(slot.endTime);
                var diff = rangeEnd.diff(rangeStart, 'minutes');
                var nextStart = rangeStart;

                while (diff >= slot.gameDuration) {
                    var gameSlot = {
                        startTime: nextStart.clone().toDate(),
                        locationId: slot.locationId
                    };
                    generatedSlots.push(gameSlot);
                    nextStart.add(slot.gameDuration, 'minutes');
                    diff = rangeEnd.diff(nextStart, 'minutes');
                }
            });

            return generatedSlots;
        }
    }
})();