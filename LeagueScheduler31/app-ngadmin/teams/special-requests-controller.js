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

        activate();

        ////////////////

        function activate() {
        }

        function cancel() {
            $modalInstance.dismiss();
        }

        function save() {
            $modalInstance.close(vm.editableItem);
        }
    }
})();
