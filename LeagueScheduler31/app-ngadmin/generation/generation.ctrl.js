(function () {
    'use strict';

    angular.module('eliteApp').controller('GenerationCtrl', GenerationCtrl);

    GenerationCtrl.$inject = ['$q', '$stateParams', 'initialData', 'generationService', 'uiGridConstants', 'eliteApi', 'dialogsService', 'leagueValidator'];

    function GenerationCtrl($q, $stateParams, initialData, generationService, uiGridConstants, eliteApi, dialogs, leagueValidator) {
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
        vm.saveAll = saveAll;
        vm.slotRanges = initialData.slotRanges;
        vm.teams = initialData.teams;
        vm.teamsLookup = {};

        vm.gridOptions = {
            data: 'vm.allGames',
            enableFiltering: true,
            enableColumnResizing: true,
            enableGridMenu: true,
            exporterCsvFilename: 'generated-schedule.csv',
            columnDefs: [
                { name: 'Game Time', field: 'gameTime', cellFilter: 'date:\'MM/d/y h:mm a\'', maxWidth: '50' },
                { name: 'Location', field: 'locationName', maxWidth: '50' },
                {
                    name: 'Home vs. Away', field: 'display', filter: {
                        condition: uiGridConstants.filter.CONTAINS
                    }
                },
                { name: 'Division', field: 'division', maxWidth: '50' }
            ],
            exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
                onRegisterApi: function (gridApi) {
                    //$scope.gridApi = gridApi;
                }
        };

        activate();

        function activate() {
            // 1st try:
            //     X GENERATE game match-ups (based on # of rounds)
            //     X GENERATE slots (from ranges)
            //     X ASSIGN games to slots
            //     * VERIFY logic: 1) no back-to-back games, 2) no break between games > 3 hours
            //     - ignore team seeding order (add later)
            //     - ignore location(s) associations with division (add later)
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
            var availableSlots = generationService.generateSlots(initialData.slotRanges);

            validationsCheck(availableSlots);
            if (vm.alerts.length > 0) {
                return;
            }

            var generatedMatchUps = generationService.generateMatchUps(vm.teams, vm.numberOfRounds);
            //TODO: need to remove this
            vm.allMatchUps = generatedMatchUps;


            vm.allGames = generationService.generateGameAssignments(vm.teams, initialData.slotRanges, vm.numberOfRounds, vm.locationsLookup);
            validateAll();
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

        function validateAll() {
            var validations = leagueValidator.validateAll(vm.teams, vm.allGames, vm.numberOfRounds);

            if (validations.length > 0) {
                dialogs.alert(validations, 'Violations Detected! (' + validations.length + ')');
            } else {
                dialogs.alert(['All tests passed.'], 'Valid!');
            }
        }

        function saveAll() {
            var promises = [];

            eliteApi.resetGames($stateParams.leagueId).then(function () {
                _.forEach(vm.allGames, function (gameRow) {
                    var deferred = $q.defer();
                    promises.push(deferred.promise);

                    var game = {
                        leagueId: $stateParams.leagueId,
                        locationId: gameRow.locationId,
                        //gameTime: gameRow.gameTime,
                        gameTime: moment(gameRow.gameTime).format('YYYY-MM-DDTHH:mm:00'),
                        team1Id: gameRow.team1Id,
                        team2Id: gameRow.team2Id
                    };

                    eliteApi.saveGame(game).then(function (data) {
                        deferred.resolve();
                    });
                });

                $q.all(promises).then(function () {
                    dialogs.alert(['All games have been successfully saved.'], 'Complete!');
                });
            });
        }
    }
})();
