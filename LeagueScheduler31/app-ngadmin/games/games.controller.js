(function () {
    'use strict';

    angular.module('eliteApp').controller('GamesCtrl', GamesCtrl);

    GamesCtrl.$inject = ['$scope', '$modal', '$stateParams', '$filter', '$q', 'initialData', 'eliteApi', 'dialogsService', 'leagueValidator', 'userData'];

    /* @ngInject */
    function GamesCtrl($scope, $modal, $stateParams, $filter, $q, initialData, eliteApi, dialogs, leagueValidator, userData) {
        /* jshint validthis: true */
        var vm = this;

        vm.orderBy = $filter('orderBy');
        vm.activate = activate;
        //vm.colors = ['active', 'success', 'warning', 'danger', 'info', 'default'];
        vm.canEditLeague = false;
        vm.deleteItem = deleteItem;
        vm.editItem = editItem;
        vm.editScores = editScores;
        vm.gameFilter = gameFilter;
        vm.games = _.sortBy(initialData.games, 'gameTime');
        vm.getSpecialRequestForGame = getSpecialRequestForGame;
        vm.locations = initialData.locations;
        vm.locationsLookup = {};
        vm.locationsList = [];
        vm.locationCalendarChanged = locationCalendarChanged;
        vm.open = openDatePicker;
        vm.opened = false;
        vm.selectRow = selectRow;
        vm.specialRequests = initialData.specialRequests;
        vm.specialRequestsLookup = {};
        vm.teams = initialData.teams;
        vm.teamsLookup = {};
        vm.validateAll = validateAll;
        vm.viewOpponentMatrix = viewOpponentMatrix;
        vm.viewScheduleRequests = viewScheduleRequests;
        vm.viewScheduleRequests2 = viewScheduleRequests2;
        vm.scheduleRequestCss = scheduleRequestCss;
        vm.selected = [];
        vm.selectedRows = {};
        vm.specialRequestCss = specialRequestCss;
        vm.swapGames = swapGames;
        vm.viewUnusedSlots = viewUnusedSlots;

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
            defaultView: 'agendaDay',
            eventRender: eventRender
        };

        activate();

        ////////////////

        function activate() {
            vm.canEditLeague = userData.hasClaimValue('can-edit-league', $stateParams.leagueId);

            _.forEach(vm.teams, function(team){
                vm.teamsLookup[team.id] = team;//.name;
            });

            _.forEach(vm.locations, function(location){
               vm.locationsLookup[location.id] = location.name;
            });

            _.forEach(vm.specialRequests, function (specialReq) {
                vm.specialRequestsLookup[specialReq.teamId] = specialReq;
            });

            // set up event sources for calendar control
            var colors = ['primary', 'success', 'warning', 'danger', 'info', 'default'];
            var uniqLocations = _(vm.games).uniq('locationId').map('locationId').value();
            _.forEach(vm.locations, function (loc, index) {
                if (_.contains(uniqLocations, loc.id)) {
                    vm.locationsList.push({
                        locationId: loc.id,
                        name: loc.name,
                        color: colors[index % 6],
                        active: true
                    });
                }
            });

            setEventSources();
        }

        function eventRender(event, element) {
            element.find('.fc-event-title').css({
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                width: 'inherit',
                display: 'block'
            });
            element.attr('title', event.tooltip);
        }

        function setEventSources() {
            var gameEvents = [];
            _.forEach(vm.games, function (game) {
                var gameEvent = mapToGameEvent(game);
                gameEvents.push(gameEvent);
            });

            var groups = _.groupBy(gameEvents, 'locationId');
            var sources = [];
            _.forOwn(groups, function (value, key) {
                var loc = _.find(vm.locationsList, { 'locationId': Number(key) });
                if (loc.active) {
                    sources.push({ className: 'btn-' + loc.color, locationId: Number(key), events: value });
                }
            });
            console.log('**groups', groups);

            //console.table(gameEvents);
            //vm.eventSources = [gameEvents];
            console.log('***about to set event sources!!', sources);
            vm.eventSources = sources;
        }

        function locationCalendarChanged(loc) {
            console.log('**in locationCalendarChanged()', loc, $scope.rawCalendar.fullCalendar);
            _.forEach(vm.eventSources, function (es) {
                $scope.rawCalendar.fullCalendar('removeEventSource', es);
            });

            setEventSources();

            _.forEach(vm.eventSources, function (es) {
                $scope.rawCalendar.fullCalendar('addEventSource', es);
            });
        }

        function mapToGameEvent(game) {
            var team1 = vm.teamsLookup[game.team1Id];
            var team2 = vm.teamsLookup[game.team2Id];
            var startTime = moment.utc(game.gameTime).format('YYYY-MM-DDTHH:mm:00');

            return {
                id: game.id,
                start: startTime,
                title: (team1 ?  team1.name + ' (' + team1.division + ') vs. ' + team2.name + ' (' + team2.division + ')' : '[Empty]'),
                tooltip: (team1 ? team1.name + ' (' + team1.division + ') vs. ' + team2.name + ' (' + team2.division + ')' : '[Empty]'),
                allDay: false,
                durationEditable: false,
                end: moment(startTime).add(1, 'hour').toDate(),
                locationId: game.locationId
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
            game.gameTime = moment(calEvent.start).format('YYYY-MM-DDTHH:mm:00');
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
                            leagueId: $stateParams.leagueId,
                            itemToEdit: game,
                            allGames: vm.games
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
                        //vm.eventSources[0][index] = mapToGameEvent(game);
                        console.log('**after save eventSources', vm.eventSources);
                    } else{
                        vm.games.push(data);
                        //vm.eventSources[0].push(mapToGameEvent(data));
                    }
                    //TODO: need to re-sort here (remove angular filter in markup)
                    //vm.games = _.sortBy(vm.games, 'gameTime');
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
                            team1Name: vm.teamsLookup[game.team1Id].name,
                            team2Name: vm.teamsLookup[game.team2Id].name
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
            var dateFilterSet = vm.dateFilter;
            var locationFilterSet = (vm.filterLocationId && vm.filterLocationId.length > 0);
            var teamFilterSet = (vm.filterTeamId && vm.filterTeamId.length > 0);

            if (!dateFilterSet && !locationFilterSet && !teamFilterSet) {
                return true;
            }

            var results = [];
            var dateFilterHit = false;
            var locationFilterHit = false;
            var teamFilterHit = false;

            if (dateFilterSet) {
                dateFilterHit = moment(vm.dateFilter).isSame(game.gameTime, 'day');
                results.push(dateFilterHit);
            }

            if (locationFilterSet) {
                locationFilterHit = _.some(vm.filterLocationId, function (filter) {
                    return game.locationId === filter.id;
                });
                results.push(locationFilterHit);
            }

            if (teamFilterSet) {
                teamFilterHit = _.some(vm.filterTeamId, function(filter){
                    return game.team1Id === filter.id || game.team2Id === filter.id;
                });
                results.push(teamFilterHit);
            }

            return _.every(results);
        }

        function openDatePicker($event) {
            $event.preventDefault();
            $event.stopPropagation();
            vm.opened = true;
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

        function specialRequestCss(teamId, game) {
            var specialRequest = getSpecialRequestForGame(teamId, game);
            if (specialRequest) {
                return specialRequest.resolved ? 'success' : 'bg-yellow';
            } else {
                return '';
            }
        }

        function scheduleRequestCss(scheduleRequest, game) {
            if (scheduleRequest) {
                var isTimeAvail = leagueValidator.isTimeAvailableForTeam(scheduleRequest, moment.utc(game.gameTime));
                if (scheduleRequest.resolved) {
                    return 'success';
                } else if (!scheduleRequest.extraRequest && isTimeAvail) {
                    return 'success';
                } else {
                    return 'bg-yellow';
                }
            } else {
                return '';
            }
        }

        function getSpecialRequestForGame(teamId, game, extra) {
            var specialRequest = vm.specialRequestsLookup[teamId];

            if (specialRequest) {
                var gameDate = moment(game.gameTime).format('MM/DD/YYYY');
                var temp = _.find(specialRequest.scheduleRequests, function (item) {
                    return item.date === gameDate;
                });
                return temp;
            } else {
                return null;
            }
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
                    var team = vm.teamsLookup[teamId];
                    messages.push(team.name + ': ' + teamReq.requestText);
                }
            }
        }

        function viewScheduleRequests2(team1Id, schedReq1, team2Id, schedReq2) {
            var messages = [];

            createMessageForTeam(team1Id, schedReq1);
            createMessageForTeam(team2Id, schedReq2);

            dialogs.alert(messages, 'Schedule Requests');

            function createMessageForTeam(teamId, schedReq) {
                if (schedReq) {
                    var team = vm.teamsLookup[teamId];
                    var unavailHours = _.chain(schedReq.unavailableHours)
                        .filter('selected')
                        .map(function (item) {
                            return getHourLabel(item.hour);
                        }).value();

                    if (unavailHours.length > 0) {
                        messages.push(team.name + ': ' + 'Not available: ' + unavailHours.join(', '));
                    }
                    if (schedReq.extraRequest) {
                        messages.push(team.name + ': ' + 'Extra Request: ' + schedReq.extraRequest);
                    }
                }
            }
        }

        //TODO: need to clean this up later
        function getHourLabel(hour) {
            var amPm = hour < 12 ? 'AM' : 'PM';
            return (hour < 13 ? hour + amPm : (hour - 12) + amPm);
        }

        function viewUnusedSlots() {
            eliteApi.getSlots($stateParams.leagueId).then(function (data) {
                var generatedSlots = generateSlots(data);

                var unusedSlots = _.filter(generatedSlots, function (slot) {
                    var slotStart = moment(slot.startTime);
                    var matchingGame = _.find(vm.games, function (game) {
                        var gameStart = moment(game.gameTime);
                        return gameStart.isSame(slotStart) && (game.locationId === slot.locationId);
                    });

                    return !matchingGame;
                });

                //console.log("***unused slots", unusedSlots);
                var messages = _.chain(unusedSlots).sortBy('startTime').map(function (item) {
                    return moment.utc(item.startTime).format('MM/DD/YYYY h:mma') + ' - Location: ' + vm.locationsLookup[item.locationId];
                }).value();

                dialogs.alert(messages, 'Unused Slots');
            });
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

        function viewOpponentMatrix() {
            var modalInstance = $modal.open({
                templateUrl: '/app-ngadmin/games/opponent-matrix.html',
                controller: 'OpponentMatrixCtrl',
                size: 'lg',
                controllerAs: 'vm',
                resolve: {
                    data: function () {
                        return {
                            games: vm.games,
                            teams: vm.teams,
                            teamsLookup: vm.teamsLookup
                        };
                    }
                }
            });


        }
    }
})();
