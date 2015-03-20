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

        function generateGameAssignments(teams, slotRanges, numberOfRounds, locationsLookup, specialRequests) {
            var minTimeBetweenGames = 60;
            var maxTimeBetweenGames = 260;
            var availableSlots = generateSlots(slotRanges);
            availableSlots = _.sortBy(availableSlots, 'startTime');
            var matchups = generateMatchUps(teams, numberOfRounds);
            matchups = _.sortBy(matchups, ['round', 'division']);
            var unassignedMatchups = [];

            //console.log('***AVAILABLE SLOTS***');
            //console.table(availableSlots);
            //console.table(teams);
            //console.log('***MATCH UPS***');
            //console.table(matchups);

            var games = [];

            _.forEach(matchups, function (mu) {
                var slot = getNextValidSlotForMatchUp(mu);
                if (slot) {
                    ////console.log("slot startTime", slot.startTime, moment(slot.startTime).format('YYYY-MM-DDTHH:mm:00'));
                    var game = {
                        gameTime: moment.utc(slot.startTime).format('YYYY-MM-DDTHH:mm:00'),
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
                    console.log('***SLOT NOT FOUND FOR GAME!!!', mu);
                    unassignedMatchups.push(mu);
                }
            });

            console.log('**Generation complete! Remaining availableslots: ' + availableSlots.length);
            console.table(availableSlots);
            console.table(unassignedMatchups);

            //return games;
            return {
                games: games,
                unassignedMatchups: unassignedMatchups
            };

            function getNextValidSlotForMatchUp(matchup) {
                // Find previous games for both teams in this match up
                var team1LastGame = findLastGameForTeam(matchup.team1);
                var team1Games = findGamesForTeam(matchup.team1);
                var team2LastGame = findLastGameForTeam(matchup.team2);
                var team2Games = findGamesForTeam(matchup.team2);

                if (team1Games.length >= numberOfRounds && team2Games.length >= numberOfRounds) {
                    return null;
                }
                var team1LastGameStart, team2LastGameStart;
                if (team1LastGame) {
                    team1LastGameStart = moment.utc(team1LastGame.gameTime);
                }

                if (team2LastGame) {
                    team2LastGameStart = moment.utc(team2LastGame.gameTime);
                }

                var logit = (matchup.team1 == 6201 && matchup.team2 == 6198);
                // Make sure the difference is greater than the minimum (and less than maximum) time threshold
                var nextSlotIndex = _.findIndex(availableSlots, function (slot) {
                    var slotStart = moment.utc(slot.startTime);

                    //var team1Valid = checkTeamMaxMinValid(team1LastGameStart, slotStart, matchup.team1);
                    //var team2Valid = checkTeamMaxMinValid(team2LastGameStart, slotStart, matchup.team2);
                    var team1Valid = checkTeamMaxMinValid2(team1Games, slotStart, matchup.team1, slot, logit);
                    var team2Valid = checkTeamMaxMinValid2(team2Games, slotStart, matchup.team2, slot, logit);

                    var team1Available = isTimeAvailableForTeam(matchup.team1, slotStart);
                    var team2Available = isTimeAvailableForTeam(matchup.team2, slotStart);

                    return team1Valid && team2Valid && team1Available && team2Available;
                });

                /***************************/
                function checkTeamMaxMinValid(teamLastGameStart, slotStart, teamId, logit) {
                    if (teamLastGameStart) {
                        var teamDiff = slotStart.diff(teamLastGameStart, 'minutes');
                        var sameDayAsLastGame = teamLastGameStart.isSame(slotStart, 'day');
                        return (teamDiff > minTimeBetweenGames) &&
                            (sameDayAsLastGame ? teamDiff <= maxTimeBetweenGames : true);
                    } else {

                        return true; // it's their first game
                    }
                }

                function checkTeamMaxMinValid2(teamGames, slotStart, teamId, slot, logit) {
                    // if any team games that are *same* day as slotStart *and* less than 120 minutes before or less than 120 minutes after
                    var conflictingGames = _.filter(teamGames, function (game) {
                        var gameTime = moment.utc(game.gameTime);
                        var isSameDay = slotStart.isSame(gameTime, 'day');
                        var minutesDiff = slotStart.diff(gameTime, 'minutes');
                        var minutesDiffLessThan120 = (minutesDiff < 120 && minutesDiff > -120);
                        var minutesDiffGreaterThan260 = (minutesDiff > 260 || minutesDiff < -260);
                        if (logit && teamId == 6198) {
                            //var minutesDiffLessThan120 = (minutesDiff < 120 && minutesDiff > -120);
                            console.log('**conflict result', isSameDay, minutesDiffLessThan120, minutesDiff, slot);
                        }
                        return isSameDay && minutesDiffLessThan120;
                        //return isSameDay && (minutesDiffLessThan120 || minutesDiffGreaterThan260);
                    });
                    // if any conflicting games, then not valid
                    // if zero conflicting games, then valid
                    var valid = conflictingGames.length === 0;
                    if (logit) {
                        console.log('****maxminvalid2', valid, teamId, slotStart, conflictingGames, slot);
                    }
                    return conflictingGames.length === 0;
                }
                /***************************/



                //TODO: probably need a check if no valid slot is found (index: -1)
                // Get the slot so we can return it
                if (nextSlotIndex === -1) {
                    console.log('######nextSlotIndex', nextSlotIndex, matchup);
                    return null;
                } else {
                    var nextSlot = availableSlots[nextSlotIndex];

                    // Remove it before we return
                    availableSlots.splice(nextSlotIndex, 1);

                    return nextSlot;
                }
            }

            function findLastGameForTeam(teamId) {
                var teamGames = _.filter(games, function (game) {
                    return game.team1Id === teamId || game.team2Id === teamId;
                });

                if (teamGames.length === 0) {
                    return null;
                } else {
                    return _.max(teamGames, function (item) {
                        return moment(item.gameTime, 'YYYY-MM-DDTHH:mm:00').toDate().getTime();
                    });
                }
            }

            function findGamesForTeam(teamId) {
                return _.filter(games, function (game) {
                    return game.team1Id === teamId || game.team2Id === teamId;
                });
            }

            function isTimeAvailableForTeam(teamId, slotStart) {
                var teamRequest = _.find(specialRequests, { 'teamId': teamId });
                if (teamRequest) {
                    var requestDay = _.find(teamRequest.scheduleRequests, function (item) {
                        return moment(item.date, 'MM-DD-YYYY').isSame(slotStart, 'day');
                    });
                    if (requestDay) {
                        var unavailHours = _.chain(requestDay.unavailableHours).filter('selected').map('hour').value();
                        if (unavailHours.length > 0) {
                            var slotHour = slotStart.hour();
                            var hourMatch = _.contains(unavailHours, slotHour);
                            return !hourMatch;
                        }
                    }
                }
                return true;
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
            //console.log('divisionGroup', divisionGroup, numberOfRounds);
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