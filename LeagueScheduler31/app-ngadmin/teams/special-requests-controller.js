(function () {
    'use strict';

    angular.module('eliteApp').controller('SpecialRequestsCtrl', SpecialRequestsCtrl);

    SpecialRequestsCtrl.$inject = ['$modalInstance', 'data', 'itemToEdit', 'eliteApi'];

    /* @ngInject */
    function SpecialRequestsCtrl($modalInstance, data, itemToEdit, eliteApi) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.cancel = cancel;
        vm.editableItem = angular.copy(data.itemToEdit);
        vm.properties = data;
        vm.save = save;

        vm.scheduleRequests = [];
        vm.potentialHoursLabels = [];
        vm.selectHour = selectHour;

        activate();
        console.log('***data', data, '***itemtoEdit', itemToEdit);
        ////////////////

        function activate() {
            var potentialHours = _.range(8, 22);

            vm.potentialHoursLabels = _.map(potentialHours, function (hour) {
                var amPm = hour < 12 ? 'AM' : 'PM';
                return (hour < 13 ? hour + amPm : (hour - 12) + amPm);
            });

            //vm.potentialDays = data.distinctDays;

            //vm.potentialDays = _.map(data.distinctDays, function (day) { return { date: day }; });

            //vm.potentialDays = _.map(data.distinctDays, function (day) {
            //    return { date: moment(day).toDate() };
            //});

            //_.forEach(vm.potentialDays, function (day) {
            //    day.hours = _(potentialHours).map(function (hour) {
            //        return { hour: hour };
            //    }).value();
            //});

            //vm.scheduleRequests = _.map(data.distinctDays, function (day) {
            var emptyScheduleRequests = _.map(data.distinctDays, function (day) {
                return {
                    date: day,
                    unavailableHours: _.map(potentialHours, function (hour) {
                        //TODO: need to map "selected" for *existing*
                        return { hour: hour };
                    })
                    //TODO: need to map "extraRequest" and "resolved" for *existing*
                };
            });

            //var temp = _.union(itemToEdit.scheduleRequests, emptyScheduleRequests);
            var existingRequestDays = (itemToEdit ? itemToEdit.scheduleRequests : []);
            vm.scheduleRequests = _.uniq(_.union(existingRequestDays, emptyScheduleRequests), 'date');
            console.log('***scheduleRequests', vm.scheduleRequests);
        }

        function cancel() {
            $modalInstance.dismiss();
        }

        function save() {

            //var schedRequests = _.chain(vm.scheduleRequests)
            //    .filter(function (day) {
            //        return day.extraRequest;
            //    })
            //    .map(function (day) {
            //        return {
            //            date: day.date,
            //            //unavailableHours: _.chain(day.unavailableHours).filter('selected').map('hour').value(),
            //            unavailableHours: day.unavailableHours,
            //            extraRequest: day.extraRequest,
            //            resolved: day.resolved
            //        }
            //    }).value();

            //var schedRequests = _.filter(vm.scheduleRequests, function (day) {
            //    return day.extraRequest || _.any(day.unavailableHours, 'selected');
            //});

            var scheduleRequest = {
                teamId: data.team.id,
                scheduleRequests: _.filter(vm.scheduleRequests, function (day) {
                    return day.extraRequest || _.any(day.unavailableHours, 'selected');
                })
            };

            console.log('***about to save scheduleRequest', scheduleRequest);
            eliteApi.saveSpecialRequest2(data.team.leagueId, data.team.id, scheduleRequest).then(function () {
                $modalInstance.close(vm.editableItem);
            });
        }

        function selectHour(hour) {
            hour.selected = !hour.selected;
        }
    }
})();
