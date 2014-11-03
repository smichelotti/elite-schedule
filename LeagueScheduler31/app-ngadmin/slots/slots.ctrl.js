(function () {
    'use strict';

    angular.module('eliteApp').controller('SlotsCtrl', SlotsCtrl);

    SlotsCtrl.$inject = ['$stateParams', 'initialData'];

    function SlotsCtrl($stateParams, initialData) {
        /* jshint validthis:true */
        var vm = this;
        console.log('in slotsCtrl', initialData);
        vm.dateOptions = {
            showWeeks: false
        };
        vm.add = add;
        vm.closeAlert = closeAlert;
        vm.generateSlots = generateSlots;
        vm.locations = initialData.data;
        vm.newDate = new Date();// {};
        vm.newDuration = 60;
        vm.newLocation = {};
        vm.newEndTime = moment('22:00', 'HH:mm').toDate();
        vm.newStartTime = moment('18:00', 'HH:mm').toDate();
        vm.open = openDatePicker;
        vm.opened = false;
        vm.removeSlot = removeSlot;
        vm.saveLocal = saveLocal;
        vm.slots = [];
        vm.alerts = [];
        
        activate();

        function activate() {
            var ranges = window.localStorage.getItem('slotRanges-' + $stateParams.leagueId);
            if (ranges) {
                ranges = JSON.parse(ranges);
                _.each(ranges, function (range) {
                    range.startTime = new Date(range.startTime);
                    range.endTime = new Date(range.endTime);
                });
                vm.slots = ranges;
            }
        }

        function openDatePicker($event) {
            $event.preventDefault();
            $event.stopPropagation();

            vm.opened = true;
        }

        function add() {
            var slot = {
                locationId: vm.newLocation.id,
                locationName: vm.newLocation.name,
                startTime: combine(vm.newDate, vm.newStartTime),
                endTime: combine(vm.newDate, vm.newEndTime),
                gameDuration: vm.newDuration
            };

            if (isAddValid(slot)) {
                vm.slots.push(slot);
                vm.slots = _.sortBy(vm.slots, ['startTime', 'locationName']);
            }
        }

        function isAddValid(slotToAdd) {
            var diff = moment(slotToAdd.endTime).diff(moment(slotToAdd.startTime), 'minutes');
            if (diff < Number(slotToAdd.gameDuration)) {
                vm.alerts.push({ type: 'danger', msg: 'Invalid range - end time must be at least ' + slotToAdd.gameDuration + ' minutes after start time.' });
                return false;
            }

            var overlapFound = _.any(vm.slots, function (slot) {
                return slot.locationId === slotToAdd.locationId &&
                    ((slotToAdd.startTime >= slot.startTime && slotToAdd.startTime < slot.endTime) ||
                    (slotToAdd.startTime < slot.startTime && slotToAdd.endTime > slot.startTime));
            });

            if (overlapFound) {
                vm.alerts.push({ type: 'danger', msg: 'Invalid range - overlap detected with an existing range!' });
                return false;
            }
            return true;
        }

        function closeAlert(index) {
            vm.alerts.splice(index, 1);
        }

        function combine(date, time) {
            var dateString = moment(date).format('MM/DD/YYYY');
            return moment(dateString + ' ' + moment(time).format('HH:mm')).toDate()
        }

        function generateSlots() {
            var generatedSlots = [];

            _.each(vm.slots, function (slot) {
                var rangeStart = moment(slot.startTime);
                var rangeEnd = moment(slot.endTime);
                var diff = rangeEnd.diff(rangeStart, 'minutes');
                var nextStart = rangeStart;

                while (diff >= slot.gameDuration) {
                    var gameSlot = {
                        startTime: nextStart.clone(),
                        location: slot.location
                    };
                    generatedSlots.push(gameSlot);
                    nextStart.add(slot.gameDuration, 'minutes');
                    diff = rangeEnd.diff(nextStart, 'minutes');
                }
            });


            // debug output...
            console.log('generatedSlots', generatedSlots);
            _.each(generatedSlots, function (gameSlot) {
                //console.log(game.start.format());
                console.log(gameSlot.location, gameSlot.startTime.format());
            });
            return generatedSlots;
        }

        function removeSlot(slot) {
            _.remove(vm.slots, slot);
        }

        function saveLocal() {
            window.localStorage.setItem('slotRanges-' + $stateParams.leagueId, JSON.stringify(vm.slots));
            vm.alerts.push({ type: 'success', msg: 'Slot ranges successfully saved.' });
        }
    }
})();
