(function () {
    'use strict';

    angular.module('eliteApp').controller('GamesCtrl', GamesCtrl);

    GamesCtrl.$inject = ['$modal', '$stateParams', '$filter', '$q', 'initialData', 'eliteApi', 'dialogsService', 'leagueValidator'];

    /* @ngInject */
    function GamesCtrl($modal, $stateParams, $filter, $q, initialData, eliteApi, dialogs, leagueValidator) {
        /* jshint validthis: true */
        var vm = this;

        vm.orderBy = $filter('orderBy');
        vm.activate = activate;
        vm.deleteItem = deleteItem;
        vm.editItem = editItem;
        vm.editScores = editScores;
        vm.gameFilter = gameFilter;
        //vm.games = initialData.games;
        vm.games = _.sortBy(initialData.games, 'gameTime');
        vm.locations = initialData.locations;
        vm.locationsLookup = {};
        vm.selectRow = selectRow;
        vm.specialRequests = initialData.specialRequests;
        vm.specialRequestsLookup = {};
        vm.teams = initialData.teams;
        vm.teamsLookup = {};
        vm.validateAll = validateAll;
        vm.viewScheduleRequests = viewScheduleRequests;
        vm.selected = [];
        vm.selectedRows = {};
        vm.swapGames = swapGames;

        vm.calendarConfig = {
            height: 550,
            editable: true,
            header: {
                left: 'month agendaWeek agendaDay',
                center: 'title',
                right: 'today prev,next'
            },
            eventClick: eventClick,
            eventDrop: eventDrop,
            firstHour: 7,
            defaultView: 'agendaDay'
        };

        activate();

        ////////////////

        function activate() {
            _.forEach(vm.teams, function(team){
               vm.teamsLookup[team.id] = team.name;
            });

            _.forEach(vm.locations, function(location){
               vm.locationsLookup[location.id] = location.name;
            });

            _.forEach(vm.specialRequests, function (specialReq) {
                vm.specialRequestsLookup[specialReq.teamId] = specialReq;
            });

            // set up event sources for calendar control
            var gameEvents = [];
            _.forEach(vm.games, function(game){
                var gameEvent = mapToGameEvent(game);
                gameEvents.push(gameEvent);
            });

            vm.eventSources = [gameEvents];
        }

        function mapToGameEvent(game){
            return {
                id: game.id,
                start: game.time,
                title: vm.teamsLookup[game.team1Id] + ' vs. ' + vm.teamsLookup[game.team2Id],
                allDay: false,
                durationEditable: false,
                end: moment(game.time).add(1, 'hour').toDate()
            };
        }

        function deleteItem(id){
            dialogs.confirm('Are you sure you want to Delete this item?', 'Delete?', ['OK', 'Cancel'])
                .then(function(){
                    eliteApi.deleteGame(id).then(function(data){
                        _.remove(vm.games, { 'id': id });
                    });
                });
        }

        function eventClick(calEvent){
            var game = _.find(vm.games, { 'id': calEvent.id });
            editItem(game);
        }

        function eventDrop(calEvent){
            console.log('***in eventDrop', calEvent);
            var game = _.find(vm.games, { 'id': calEvent.id });
            game.time = moment(calEvent.start).format('YYYY-MM-DDTHH:mm:00');
            eliteApi.saveGame(game).then(function(data){
                //_.assign(game, data);
                //var index = _.findIndex(vm.eventSources[0], { 'id': game.id });
                //vm.eventSources[0][index] = mapToGameEvent(game);
            });
        }

        function editItem(game){
            var modalInstance = $modal.open({
                templateUrl: '/app-ngadmin/games/edit-game.html',
                controller: 'EditGameCtrl',
                controllerAs: 'vm',
                resolve: {
                    data: function() {
                        return {
                            locations: _.sortBy(vm.locations, 'name'),
                            teams: _.sortBy(vm.teams, 'divisionName, name'),
                            itemToEdit: game
                        };
                    }
                }
            });

            modalInstance.result.then(function(result){
                result.leagueId = $stateParams.leagueId;
                eliteApi.saveGame(result).then(function(data){
                    if (game){
                        _.assign(game, data);
                        var index = _.findIndex(vm.eventSources[0], { 'id': game.id });
                        vm.eventSources[0][index] = mapToGameEvent(game);
                    } else{
                        vm.games.push(data);
                        vm.eventSources[0].push(mapToGameEvent(data));
                    }
                    //TODO: need to re-sort here (remove angular filter in markup)
                    vm.games = _.sortBy(vm.games, 'gameTime');
                });
            });
        }

        function editScores(game) {
            console.log('**inside editScores');
            var modalInstance = $modal.open({
                templateUrl: '/app-ngadmin/games/edit-scores.html',
                controller: 'EditScoresCtrl',
                size: 'sm',
                controllerAs: 'vm',
                resolve: {
                    data: function () {
                        return {
                            itemToEdit: game,
                            team1Name: vm.teamsLookup[game.team1Id],
                            team2Name: vm.teamsLookup[game.team2Id]
                        };
                    }
                }
            });

            modalInstance.result.then(function (result) {
                result.leagueId = $stateParams.leagueId;
                eliteApi.saveGame(result).then(function (data) {
                    _.assign(game, data);
                    var index = _.findIndex(vm.eventSources[0], { 'id': game.id });
                    vm.eventSources[0][index] = mapToGameEvent(game);
                });
            });
        }

        function gameFilter(game) {
            if (!vm.filterLocationId && !vm.filterTeamId) {
                return true;
            }

            if (vm.filterLocationId) {
                return game.locationId === vm.filterLocationId;
            }

            if (vm.filterTeamId) {
                return game.team1Id === vm.filterTeamId || game.team2Id === vm.filterTeamId;
            }
        }
        

        function swapGames() {
            var game1 = _.find(vm.games, { 'id': Number(vm.selected[0]) });
            var game2 = _.find(vm.games, { 'id': Number(vm.selected[1]) });
            var game1Temp = { gameTime: game1.gameTime, locationId: game1.locationId };
            var game2Temp = { gameTime: game2.gameTime, locationId: game2.locationId };
            game1.gameTime = game2Temp.gameTime;
            game1.locationId = game2Temp.locationId;
            game2.gameTime = game1Temp.gameTime;
            game2.locationId = game1Temp.locationId;

            return $q.all([
            eliteApi.saveGame(game1),
            eliteApi.saveGame(game2)
            ]).then(function (results) {
                _.assign(game1, results[0]);
                _.assign(game2, results[1]);
                vm.games = _.sortBy(vm.games, 'gameTime');
            });
        }

        function selectRow() {
            //var selected = [];
            vm.selected = [];
            var result = _.forOwn(vm.selectedRows, function (value, key, obj) {
                if (value) {
                    //selected.push(key);
                    vm.selected.push(key);
                }
            });
            //console.log("result", selected, selected.length);

            //if (selected.length === 2) {
            //    dialogs.confirm('Swap these 2 games?', 'Swap?', ['Yes', 'No'])
            //     .then(function () {
            //         var game1 = _.find(vm.games, { 'id': Number(selected[0]) });
            //         var game2 = _.find(vm.games, { 'id': Number(selected[1]) });
            //         var game1Temp = { gameTime: game1.gameTime, locationId: game1.locationId };
            //         var game2Temp = { gameTime: game2.gameTime, locationId: game2.locationId };
            //         game1.gameTime = game2Temp.gameTime;
            //         game1.locationId = game2Temp.locationId;
            //         game2.gameTime = game1Temp.gameTime;
            //         game2.locationId = game1Temp.locationId;

            //         return $q.all([
            //            eliteApi.saveGame(game1),
            //            eliteApi.saveGame(game2)
            //         ]).then(function (results) {
            //             _.assign(game1, results[0]);
            //             _.assign(game2, results[1]);
            //             vm.games = _.sortBy(vm.games, 'gameTime');
            //         });
            //     }, function () {
            //        // No, do not swap
            //        _.forEach(selected, function (id) {
            //            vm.selectedRows[id] = 0;
            //        });
            //     });
            //}
        }

        function validateAll() {
            var validations = leagueValidator.validateAll(vm.teams, vm.games, 4);

            if (validations.length > 0) {
                console.table(validations);
                dialogs.alert(validations, 'Violations Detected! (' + validations.length + ')');
            } else {
                dialogs.alert(['All tests passed.'], 'Valid!');
            }
        }

        function viewScheduleRequests(game) {
            var messages = [];

            createMessageForTeam(game.team1Id);
            createMessageForTeam(game.team2Id);

            dialogs.alert(messages, 'Schedule Requests');

            function createMessageForTeam(teamId) {
                var teamReq = vm.specialRequestsLookup[teamId];
                if (teamReq) {
                    var teamName = vm.teamsLookup[teamId];
                    messages.push(teamName + ': ' + teamReq.requestText);
                }
            }
        }
    }
})();
