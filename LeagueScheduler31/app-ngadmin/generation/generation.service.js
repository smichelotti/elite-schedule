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
            var minTimeBetweenGames = 60;
            var maxTimeBetweenGames = 260;
            var availableSlots = generateSlots(slotRanges);
            availableSlots = _.sortBy(availableSlots, 'startTime');
            var matchups = generateMatchUps(teams, numberOfRounds);
            matchups = _.sortBy(matchups, ['round', 'division']);

            console.log('***AVAILABLE SLOTS***');
            console.table(availableSlots);
            console.log('***MATCH UPS***');
            console.table(matchups);

            var games = [];

            _.forEach(matchups, function (mu) {
                //var slot = availableSlots.shift();
                var slot = getNextValidSlotForMatchUp(mu);
                if (slot) {
                    var game = {
                        //
                        gameTime: slot.startTime,
                        locationId: slot.locationId,
                        locationName: locationsLookup[slot.locationId],
                        division: mu.division,
                        round: mu.round,
                        display: mu.display,
                        team1Id: mu.team1,
                        team2Id: mu.team2
                    };
                    games.push(game);
                } else {
                    console.log("***SLOT NOT FOUND FOR GAME!!!", mu);
                }
            });

            console.log("**generation complete! Remaining availableslots?");
            console.table(availableSlots);

            return games;

            function getNextValidSlotForMatchUp(matchup) {
                // Find previous games for both teams in this match up
                var team1LastGame = findLastGameForTeam(matchup.team1);
                var team2LastGame = findLastGameForTeam(matchup.team2);
                var team1LastGameStart, team2LastGameStart;
                if (team1LastGame) {
                    team1LastGameStart = moment(team1LastGame.gameTime);
                }

                if (team2LastGame) {
                    team2LastGameStart = moment(team2LastGame.gameTime);
                }

                // Make sure the difference is greater than the minimum time threshold
                var nextSlotIndex = _.findIndex(availableSlots, function (slot) {
                    var slotStart = moment(slot.startTime);

                    var team1Diff = (team1LastGame ? slotStart.diff(team1LastGameStart, 'minutes') : minTimeBetweenGames);
                    var team2Diff = (team2LastGame ? slotStart.diff(team2LastGameStart, 'minutes') : minTimeBetweenGames);
                    var doDiffCheckForTeam1 = (team1LastGame && team1LastGameStart.isSame(slotStart, 'day'));
                    var doDiffCheckForTeam2 = (team2LastGame && team2LastGameStart.isSame(slotStart, 'day')) ? true : false;
                    if (team2LastGame) {
                        var isSame = team2LastGameStart.isSame(slotStart, 'day');
                    }

                    var team1Valid = doDiffCheckForTeam1 ?
                        (team1Diff >= minTimeBetweenGames && team1Diff <= maxTimeBetweenGames) : true;
                    var team2Valid = doDiffCheckForTeam2 ?
                        (team2Diff >= minTimeBetweenGames && team2Diff <= maxTimeBetweenGames) : true;

                    return team1Valid && team2Valid;
                });

                //TODO: probably need a check if no valid slot is found (index: -1)
                // Get the slot so we can return it
                if (nextSlotIndex === -1) {
                    console.log("######nextSlotIndex", nextSlotIndex, matchup);
                }
                var nextSlot = availableSlots[nextSlotIndex];

                // Remove it before we return
                availableSlots.splice(nextSlotIndex, 1);

                return nextSlot;
            }

            function findLastGameForTeam(teamId) {
                // consider using _.max() instead of _.findLast()
                return _.findLast(games, function (game) {
                    return game.team1Id === teamId || game.team2Id === teamId;
                });
            }
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