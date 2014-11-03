(function () {
    'use strict';

    angular.module('eliteApp').controller('EditTeamCtrl', EditTeamCtrl);

    EditTeamCtrl.$inject = ['$modalInstance', 'data'];

    /* @ngInject */
    function EditTeamCtrl($modalInstance, data) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.cancel = cancel;
        vm.editableItem = angular.copy(data.itemToEdit);
        vm.properties = data;
        vm.save = save;
        vm.title = (data.itemToEdit ? 'Edit Team' : 'Add New Team');

        activate();

        ////////////////

        function activate() {
        }

        function cancel(){
            $modalInstance.dismiss();
        }

        function save(){
            $modalInstance.close(vm.editableItem);
        }
    }
})();
