(function () {
    'use strict';

    angular.module('eliteApp').controller('GenerationCtrl', GenerationCtrl);

    GenerationCtrl.$inject = ['initialData'];

    function GenerationCtrl(initialData) {
        /* jshint validthis:true */
        var vm = this;
        vm.alerts = [];
        vm.allMatchUps = [];
        vm.closeAlert = closeAlert;
        vm.generate = generate;
        vm.onGameSlotClicked = onGameSlotClicked;
        //vm.numberOfRounds = 5;
        console.log("initialdata", initialData);
        vm.saveLocal = saveLocal;
        vm.slotRanges = initialData.slotRanges;
        vm.teams = initialData.teams;//data;
        activate();

        function activate() {
            var groups = _.chain(vm.teams)
                          .groupBy('division')
                          .pairs()
                          .map(function (item) {
                              return _.object(_.zip(['divisionName', 'teams'], item));
                          })
                          .value();
            _.each(groups, function (group) {
                group.selectedSlotRanges = [];
                group.numberOfRounds = 5;
            });

            vm.divisions = groups;
            console.log("divisions", vm.divisions);
        }

        function closeAlert(index) {
            vm.alerts.splice(index, 1);
        }

        function onGameSlotClicked(item) {
            item.isActive = !item.isActive;
            console.log("game slot clicked", item.isActive);
        }

        function generate() {
            // Show warning here and ask if they are *sure* they want to proceed
            //var groups = _.groupBy(vm.teams, 'division');

            vm.allMatchUps = [];
            var groups = _.chain(vm.teams)
                          .groupBy('division')
                          .pairs()
                          .map(function (item) {
                              return _.object(_.zip(['division', 'teams'], item));
                          })
                          .value();
            vm.divisions = groups;

            console.log("groups", groups);

            _.each(groups, function (item) {
                generateMatchUpsForDivision(item);
            });
        }

        function generateMatchUpsForDivision(divisionGroup) {
            console.log('divisionGroup', divisionGroup);
            if (divisionGroup.division === 'Division 1') {
                _.remove(divisionGroup.teams, function (item) {
                    console.log('checking delete: ' + item.name);
                    return item.name === 'Mitchell';
                });
            }

            var divisionMatchUps = {
                name: divisionGroup.division,
                matchups: []
            };


            if (divisionGroup.teams.length % 2 !== 0) {
                console.log(divisionGroup.division + ' ODD number of teams (' + divisionGroup.teams.length + ')');
                divisionGroup.teams.push({ name: 'BYE' });
            }

            var teamsList = divisionGroup.teams;
            var numTeams = divisionGroup.teams.length;
            //var numRounds = numTeams - 1;
            var numRounds = vm.numberOfRounds;
            var numGamesPerRound = numTeams / 2;
            

            for (var i = 0; i < numRounds; i++) { // for each "round"
                // Generate all games for a round
                for (var g = 0; g < numGamesPerRound; g++) {
                    var matchup = { round: (i + 1), team1: teamsList[g], team2: teamsList[numTeams - 1 - g] };
                    //, ordinals: (g+1) + ' vs. ' + (numTeams - g) };
                    divisionMatchUps.matchups.push(matchup);
                }

                // Now Shift before going onto the next round
                // First team is always the "fixed hub". Remove it, shift teams, then add it back to beginning.
                var fixedTeam = teamsList.shift();
                var last = teamsList.pop();
                teamsList.unshift(last);
                teamsList.unshift(fixedTeam);
            }

            vm.allMatchUps.push(divisionMatchUps);
        }

        function saveLocal() {
            //window.localStorage.setItem('genOptions-' + $stateParams.leagueId, JSON.stringify(vm.slots));
            vm.alerts.push({ type: 'success', msg: 'Generation options successfully saved.' });
        }
    }
})();
