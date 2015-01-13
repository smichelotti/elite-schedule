(function () {
    'use strict';

    angular.module('eliteApp').controller('MainCtrl', MainCtrl);

    MainCtrl.$inject = ['initialData', 'dialogsService', 'eliteApi'];

    /* @ngInject */
    function MainCtrl(initialData, dialogs, eliteApi) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.cancelEdit = cancelEdit;
        vm.editName = editName;
        vm.league = initialData;
        vm.publish = publish;
        vm.saveEdit = saveEdit;

        activate();

        ////////////////

        function activate() {
            console.log('***league', vm.league);
        }

        function cancelEdit() {
            vm.leagueName = null;
        }

        function editName() {
            vm.leagueName = vm.league.name;
        }

        function publish() {
            dialogs.confirm('Are you sure you want to Publish?', 'Publish?', ['Yes', 'No'])
                .then(function(){
                    eliteApi.publishLeague(vm.league.id).then(function (data) {
                        console.log('***data from publish', data);
                        vm.league.isDirty = false;
                        dialogs.alert(['League was successfully published!'], 'Publish Complete');
                    });
                });
        }

        function saveEdit() {
            vm.league.name = vm.leagueName;
            eliteApi.saveLeague(vm.league).then(function (data) {
                vm.leagueName = null;
            });
        }
    }
})();