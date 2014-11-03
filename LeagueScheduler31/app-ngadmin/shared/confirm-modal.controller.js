(function () {
    'use strict';

    angular.module('eliteApp').controller('ConfirmModalCtrl', ConfirmModalCtrl);

    ConfirmModalCtrl.$inject = ['$modalInstance', 'data'];

    function ConfirmModalCtrl($modalInstance, data) {
        /* jshint validthis:true */
        var vm = this;
        vm.cancel = cancel;
        vm.ok = ok;
        vm.properties = data;

        function cancel(){
            $modalInstance.dismiss();
        }

        function ok(){
            $modalInstance.close();
        }
    }
})();