(function () {
    'use strict';

    angular.module('eliteApp').controller('GenerationCtrl', GenerationCtrl);

    GenerationCtrl.$inject = ['initialData', 'generationService', 'uiGridConstants'];

    function GenerationCtrl(initialData, generationService, uiGridConstants) {
        /* jshint validthis:true */
        var vm = this;
        vm.alerts = [];
        vm.allGames = [];
        vm.allMatchUps = [];
        vm.closeAlert = closeAlert;
        vm.generate = generate;
        vm.locations = initialData.locations;
        vm.locationsLookup = {};
        vm.onGameSlotClicked = onGameSlotClicked;
        vm.numberOfRounds = 4;
        //vm.saveLocal = saveLocal;
        vm.slotRanges = initialData.slotRanges;
        vm.teams = initialData.teams;
        vm.teamsLookup = {};

        vm.gridOptions = {
            //data: 'vm.allMatchUps',
            data: 'vm.allGames',
            enableFiltering: true,
            enableColumnResizing: true,
            columnDefs: [
                //{ name: 'Round', field: 'round', maxWidth: '50' },
                { name: 'Start Time', field: 'startTime', cellFilter: 'date:\'MM/d/y h:mm a\'', maxWidth: '50' },
                //{ name: 'Location', field: 'locationId', maxWidth: '50' },
                { name: 'Location', field: 'locationName', maxWidth: '50' },
                //{ name: 'Home Team', field: 'team1Name' },
                //{ name: 'Away Team', field: 'team2Name' },
                {
                    name: 'Home vs. Away', field: 'display', filter: {
                        condition: uiGridConstants.filter.CONTAINS
                    }
                },
                { name: 'Division', field: 'division', maxWidth: '50' }
            ]
        };

        activate();

        function activate() {
            // 1st try:
            //     * GENERATE game match-ups (based on # of rounds)
            //     * GENERATE slots (from ranges)
            //     * ASSIGN games to slots
            //     * VERIFY logic: 1) no back-to-back games, 2) no break between games > 3 hours
            //     - ignore team seeding order (add later)
            //     - ignore slot range associations with division (add later)
            var groups = _.chain(vm.teams)
                          .groupBy('division')
                          .pairs()
                          .map(function (item) {
                              return _.object(_.zip(['divisionName', 'teams'], item));
                          })
                          .value();
            _.each(groups, function (group) {
                group.selectedSlotRanges = [];
                group.numberOfRounds = 4;
            });

            //vm.divisions = groups;
            //console.log("divisions", vm.divisions);

            _.forEach(vm.teams, function (team) {
                vm.teamsLookup[team.id] = team.name;
            });

            _.forEach(vm.locations, function (location) {
                vm.locationsLookup[location.id] = location.name;
            });
        }

        function closeAlert(index) {
            vm.alerts.splice(index, 1);
        }

        function onGameSlotClicked(item) {
            item.isActive = !item.isActive;
            console.log('game slot clicked', item.isActive);
        }

        function generate() {
            console.log('***about to generate');
            console.table(initialData.slotRanges);
            var availableSlots = generationService.generateSlots(initialData.slotRanges);
            console.table(availableSlots);

            validationsCheck(availableSlots);
            if (vm.alerts.length > 0) {
                return;
            }

            var generatedMatchUps = generationService.generateMatchUps(vm.teams, vm.numberOfRounds);
            vm.allMatchUps = generatedMatchUps;


            vm.allGames = generationService.generateGameAssignments(vm.teams, initialData.slotRanges, vm.numberOfRounds, vm.locationsLookup);

            //console.table(vm.allMatchUps);
            validateMatchUps();
        }

        function validationsCheck(availableSlots) {
            var numberSlotsNeeded = vm.teams.length / 2 * vm.numberOfRounds;

            console.log('numberSlotsNeeded', numberSlotsNeeded, 'numTeam', vm.teams.length,
                'numAvailableSlots', availableSlots.length);
            if (availableSlots.length < numberSlotsNeeded) {
                var msg = numberSlotsNeeded + ' slots are required for ' +
                    vm.teams.length + ' teams. However there are currently only ' +
                    availableSlots.length + ' slots currently available!';
                vm.alerts.push({ type: 'danger', mainMessage: msg });
            }
        }

        function validateMatchUps() {
            _.forEach(vm.teams, function (team) {
                validateTeam(team);
            });

            if (vm.alerts.length === 0) {
                vm.alerts.push({ type: 'success', mainMessage: 'Congrats! No violations detected!' });
            }
        }

        function validateTeam(team) {
            var teamGames = _.filter(vm.allMatchUps, function (mu) {
                return mu.team1 === team.id || mu.team2 === team.id;
            });

            var messages = [];

            if (teamGames.length !== vm.numberOfRounds) {
                messages.push('Number of games: ' + teamGames.length + '. Should be: ' + vm.numberOfRounds);
            }

            if (messages.length > 0) {
                var msg = 'Violoations for: ' + team.name + ' (Division: ' + team.division + ')';
                vm.alerts.push({ type: 'warning', mainMessage: msg, messages: messages });
            }
        }

        //function saveLocal() {
        //    //window.localStorage.setItem('genOptions-' + $stateParams.leagueId, JSON.stringify(vm.slots));
        //    vm.alerts.push({ type: 'success', msg: 'Generation options successfully saved.' });
        //}
    }
})();
