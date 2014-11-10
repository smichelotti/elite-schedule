(function () {
    'use strict';

    angular.module('eliteApp').controller('TeamsCtrl', TeamsCtrl);

    TeamsCtrl.$inject = ['$modal', '$stateParams', '$q', 'initialData', 'initialSpecRequests', 'eliteApi', 'dialogsService'];

    /* @ngInject */
    function TeamsCtrl($modal, $stateParams, $q, initialData, initialSpecRequests, eliteApi, dialogs) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.accordionExpanded = true;
        vm.deleteItem = deleteItem;
        vm.divisions = [];
        vm.editItem = editItem;
        vm.showImport = showImport;
        vm.specialRequests = initialSpecRequests;
        vm.specialRequestsLookup = {};
        vm.editSpecialRequest = editSpecialRequest;
        vm.teams = initialData;
        vm.toggleExpand = toggleExpand;

        activate();

        ////////////////

        function activate() {
            initializeGroups();

            _.forEach(vm.specialRequests, function (specialReq) {
                vm.specialRequestsLookup[specialReq.teamId] = specialReq;
            });
        }

        function deleteItem(id) {
            dialogs.confirm('Are you sure you want to Delete this item?', 'Delete?', ['OK', 'Cancel'])
                .then(function () {
                    eliteApi.deleteTeam(id).then(function (data) {
                        _.remove(vm.teams, { 'id': id });
                        initializeGroups();
                    });
                });
        }

        function editItem(team) {
            var modalInstance = $modal.open({
                templateUrl: '/app-ngadmin/teams/edit-team.html',
                controller: 'EditTeamCtrl',
                controllerAs: 'vm',
                resolve: {
                    data: function () {
                        return {
                            divisions: _.chain(vm.teams).uniq('division').map('division').value(),
                            itemToEdit: team
                        };
                    }
                }
            });

            modalInstance.result.then(function (result) {
                result.leagueId = $stateParams.leagueId;
                eliteApi.saveTeam(result).then(function (data) {
                    if (team) {
                        _.assign(team, data);
                    } else {
                        vm.teams.push(data);
                    }
                    initializeGroups();
                });
            });
        }

        function initializeGroups() {
            vm.groups = _.chain(vm.teams)
                .sortBy('name')
                .groupBy('division')
                .pairs()
                .map(function (item) {
                    return { division: item[0], teams: item[1], isOpen: true };
                })
                .sortBy('division')
                .value();
        }

        function showImport() {
            var modalInstance = $modal.open({
                templateUrl: '/app-ngadmin/teams/import-teams.html',
                controller: 'ImportTeamsCtrl',
                controllerAs: 'vm',
                size: 'lg'
            });

            modalInstance.result.then(function (newTeams) {
                var promises = [];

                _.forEach(newTeams, function (team) {
                    var deferred = $q.defer();
                    promises.push(deferred.promise);

                    team.leagueId = $stateParams.leagueId;

                    eliteApi.saveTeam(team).then(function (data) {
                        vm.teams.push(data);
                        deferred.resolve();
                    });
                });

                $q.all(promises).then(function () {
                    initializeGroups();
                    //console.log('**after initGroups', vm.groups, vm.teams);
                });
            });
        }

        function editSpecialRequest(team) {
            var modalInstance = $modal.open({
                templateUrl: '/app-ngadmin/teams/special-requests.html',
                controller: 'SpecialRequestsCtrl',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    data: function () {
                        return {
                            team: team,
                            itemToEdit: vm.specialRequestsLookup[team.id]
                        };
                    }
                }
            });

            modalInstance.result.then(function (result) {
                result.leagueId = $stateParams.leagueId;
                result.teamId = team.id;
                eliteApi.saveSpecialRequest(result).then(function (data) {
                    if (data.requestText) {
                        vm.specialRequestsLookup[team.id] = data;
                    } else {
                        delete vm.specialRequestsLookup[team.id];
                    }
                });
            });
        }

        function toggleExpand(expand) {
            _.forEach(vm.groups, function (group) {
                group.isOpen = expand;
            });
        }
    }
})();
