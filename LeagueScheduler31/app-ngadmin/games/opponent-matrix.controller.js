(function () {
    'use strict';

    angular.module('eliteApp').controller('OpponentMatrixCtrl', OpponentMatrixCtrl);

    OpponentMatrixCtrl.$inject = ['$modalInstance', 'data'];

    /* @ngInject */
    function OpponentMatrixCtrl($modalInstance, data) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.close = close;
        vm.properties = data;

        activate();

        ////////////////

        function activate() {
            //console.table(data.games);
            vm.groups = _.chain(data.teams)
                .sortBy('name')
                .groupBy('division')
                .pairs()
                .map(function (item) {
                    return { division: (item[0] === 'null' ? '(No Division)' : item[0]), teams: item[1], isOpen: true };
                })
                .sortBy('division')
                .value();

            console.log(vm.groups);

            var matrices = [];

            _.forEach(vm.groups, function (group) {
                _.forEach(group.teams, function (team) {
                    var matrixLine = {
                        teamName: team.name,
                        opponentCount: []
                    };
                    var teamOpponents = angular.copy(group.teams);
                    // for each team, check (in alpha order) for every other team in the division
                    _.forEach(teamOpponents, function (opponent) {
                        if (team.id === opponent.id) {
                            matrixLine.opponentCount.push('X');
                        } else {

                        }
                    });
                });

                var matrix = {
                    division: group.division
                };
                matrices.push(matrix);
            });

            console.log('***matrices', matrices);
        }

        function close() {
            $modalInstance.dismiss();
        }
    }
})();
