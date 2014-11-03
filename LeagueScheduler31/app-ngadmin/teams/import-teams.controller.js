(function () {
    'use strict';

    angular.module('eliteApp').controller('ImportTeamsCtrl', ImportTeamsCtrl);

    ImportTeamsCtrl.$inject = ['$modalInstance'];

    /* @ngInject */
    function ImportTeamsCtrl($modalInstance) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.cancel = cancel;
        vm.importData = importData;

        vm.parsedData = [];

        vm.gridOptions = {
            enableGridMenu: true,
            columnDefs: [
                { name: 'Team Name', field: 'name' },
                { name: 'Coach', field: 'coach' },
                { name: 'Division', field: 'division' },
            ],
            data: 'vm.parsedData',
            importerDataAddCallback: function (grid, newObjects) {
                console.log('**inside importer callback', grid, newObjects);
                vm.parsedData = vm.parsedData.concat(newObjects);
            }
        };

        activate();

        ////////////////

        function activate() {}

        function cancel() {
            $modalInstance.dismiss();
        }

        function importData(){
            $modalInstance.close(vm.parsedData);
        }
    }
})();
