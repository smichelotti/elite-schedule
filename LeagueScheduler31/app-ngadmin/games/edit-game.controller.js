(function () {
    'use strict';

    angular.module('eliteApp').controller('EditGameCtrl', EditGameCtrl);

    EditGameCtrl.$inject = ['$modalInstance', 'data', 'utils'];

    /* @ngInject */
    function EditGameCtrl($modalInstance, data, utils) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.cancel = cancel;
        vm.editableItem = angular.copy(data.itemToEdit);
        vm.gameDate = {};
        vm.gameTime = {};
        vm.open = openDatePicker;
        vm.opened = false;
        vm.properties = data;
        vm.save = save;
        vm.title = (data.itemToEdit ? 'Edit Game' : 'Add New Game');

        activate();

        ////////////////

        function activate() {
            console.log('**vm.editableItem', vm.editableItem, data);
            if (data.itemToEdit) {
                vm.gameDate = data.itemToEdit.gameTime;
                vm.gameTime = moment(data.itemToEdit.gameTime).toDate();
            } else {
                vm.gameDate = moment().format('MM/DD/YYYY');
                vm.gameTime = moment('18:00', 'HH:mm').toDate();
            }
        }

        function cancel(){
            $modalInstance.dismiss();
        }

        function openDatePicker($event) {
            $event.preventDefault();
            $event.stopPropagation();
            vm.opened = true;
        }

        function save() {
            console.log('**about to save game', vm.editableItem);

            vm.editableItem.gameTime = utils.combineDateTime(vm.gameDate, vm.gameTime);
            $modalInstance.close(vm.editableItem);
        }
    }
})();
