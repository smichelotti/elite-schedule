(function () {
    'use strict';

    angular.module('eliteApp').controller('SpecialRequestsCtrl', SpecialRequestsCtrl);

    SpecialRequestsCtrl.$inject = ['$modalInstance', 'data', 'itemToEdit', 'eliteApi'];

    /* @ngInject */
    function SpecialRequestsCtrl($modalInstance, data, itemToEdit, eliteApi) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.allHoursBlocked = allHoursBlocked;
        vm.blockAll = blockAll;
        vm.cancel = cancel;
        vm.deleteRequests = deleteRequests;
        vm.editableItem = angular.copy(data.itemToEdit);
        vm.properties = data;
        vm.save = save;

        vm.scheduleRequests = [];
        vm.potentialHoursLabels = [];
        vm.selectHour = selectHour;

        activate();
        ////////////////

        function activate() {
            var potentialHours = _.range(8, 22);

            vm.potentialHoursLabels = _.map(potentialHours, function (hour) {
                var amPm = hour < 12 ? 'AM' : 'PM';
                return (hour < 13 ? hour + amPm : (hour - 12) + amPm);
            });

            var emptyScheduleRequests = _.map(data.distinctDays, function (day) {
                return {
                    date: day,
                    unavailableHours: _.map(potentialHours, function (hour) {
                        return { hour: hour };
                    })
                };
            });

            var existingRequestDays = (itemToEdit ? itemToEdit.scheduleRequests : []);
            var mergedRequests = _.uniq(_.union(existingRequestDays, emptyScheduleRequests), 'date');
            vm.scheduleRequests = _.sortBy(mergedRequests, function (item) {
                return moment(item.date).toDate().getTime();
            });
            //console.log('***scheduleRequests', vm.scheduleRequests);
            //console.log('***vm.editableItem', vm.editableItem, data);
        }

        function allHoursBlocked(day) {
            return _.every(day.unavailableHours, 'selected', true);
        }

        function blockAll(day, block) {
            _.forEach(day.unavailableHours, function (item) {
                item.selected = block;
            });
        }

        function cancel() {
            $modalInstance.dismiss();
        }

        function deleteRequests() {
            eliteApi.deleteSpecialRequest(data.team.leagueId, data.team.id).then(function () {
                $modalInstance.close();
            });
        }

        function save() {
            var scheduleRequest = {
                teamId: data.team.id,
                scheduleRequests: _.filter(vm.scheduleRequests, function (day) {
                    return day.extraRequest || _.any(day.unavailableHours, 'selected');
                })
            };

            eliteApi.saveSpecialRequest2(data.team.leagueId, data.team.id, scheduleRequest).then(function (result) {
                $modalInstance.close(result);
            });
        }

        function selectHour(hour) {
            hour.selected = !hour.selected;
        }
    }
})();
