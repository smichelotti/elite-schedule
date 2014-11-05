(function () {
    'use strict';

    angular.module('eliteApp').controller('EditScoresCtrl', EditScoresCtrl);

    EditScoresCtrl.$inject = ['$modalInstance', 'data'];

    /* @ngInject */
    function EditScoresCtrl($modalInstance, data) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.cancel = cancel;
        vm.editableItem = angular.copy(data.itemToEdit);
        vm.open = openDatePicker;
        vm.opened = false;
        vm.properties = data;
        vm.save = save;

        activate();

        ////////////////

        function activate() {
        }

        function cancel() {
            $modalInstance.dismiss();
        }

        function openDatePicker($event) {
            $event.preventDefault();
            $event.stopPropagation();
            vm.opened = true;
        }

        function save() {
            $modalInstance.close(vm.editableItem);
        }
    }
})();
