(function () {
    'use strict';

    angular.module('eliteApp').controller('SpecialRequestsCtrl', SpecialRequestsCtrl);

    SpecialRequestsCtrl.$inject = ['$modalInstance', 'data'];

    /* @ngInject */
    function SpecialRequestsCtrl($modalInstance, data) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.cancel = cancel;
        vm.editableItem = angular.copy(data.itemToEdit);
        vm.properties = data;
        vm.save = save;

        //vm.potentialDays = [{ date: new Date(2014, 10, 8) }, { date: new Date(2014, 10, 9) }];
        vm.potentialDays = [];//data.distinctDays;
        vm.potentialHours = [];
        vm.selectHour = selectHour;

        activate();
        console.log('888vm.potentialdays', data, vm.potentialDays);
        ////////////////

        function activate() {
            //var potentialHours = _.range(7, 19);
            var potentialHours = _.range(8, 22);

            _.forEach(potentialHours, function (hour) {
                vm.potentialHours.push(moment({ hour: hour }).toDate());
            });

            vm.potentialDays = _.map(data.distinctDays, function (day) {
                return { date: moment(day).toDate() };
            });

            //TODO: only do this even we don't have an existing item
            //var teamReqs = window.localStorage.getItem(vm.properties.team.id);
            //if (teamReqs) {
            //    vm.potentialDays = JSON.parse(teamReqs);
            //} else {
                _.forEach(vm.potentialDays, function (day) {
                    day.hours = _(potentialHours).map(function (hour) {
                        return { hour: hour };
                    }).value();
                });
            //}
        }

        function cancel() {
            $modalInstance.dismiss();
        }

        function save() {
            //window.localStorage.setItem(vm.properties.team.id, JSON.stringify(vm.potentialDays));
            //return;

            $modalInstance.close(vm.editableItem);
        }

        function selectHour(hour) {
            hour.selected = !hour.selected;
        }
    }
})();
