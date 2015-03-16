(function () {
    'use strict';

    angular.module('eliteApp').controller('LeaguesCtrl', LeaguesCtrl);

    LeaguesCtrl.$inject = ['initialData', 'userData', 'eliteApi', 'dialogsService'];

    function LeaguesCtrl(initialData, userData, eliteApi, dialogs) {
        /* jshint validthis:true */
        var vm = this;
        vm.addItem = addItem;
        vm.cancelEdit = cancelEdit;
        vm.canCreateNewLeague = false;
        vm.currentEdit = {};
        vm.deleteItem = deleteItem;
        vm.editItem = editItem;
        vm.itemToEdit = {};
        vm.leagues = [];
        vm.saveItem = saveItem;

        activate();

        function activate() {
            //vm.leagues = _.filter(initialData, { 'isArchived': false });
            vm.myLeagues = _.filter(initialData, { 'isArchived': false, 'permission': 'league-owner' });
            vm.otherLeagues = _.filter(initialData, function (item) {
                return !item.isAchived && item.permission !== 'league-owner';
            });

            vm.archivedLeagues = _.filter(initialData, 'isArchived');
            vm.canCreateNewLeague = userData.hasClaim('can-create-new-league');
        }

        function addItem() {
            var newLeague = {
                name: vm.newLeagueName
            };

            eliteApi.addLeague(newLeague).then(function (data) {
                vm.newLeagueName = '';
                console.log("league just added", data);
                //vm.leagues.push(data);
                vm.myLeagues.push(data);
                userData.invalidate();
            });
        }

        function cancelEdit(id) {
            vm.currentEdit[id] = false;
        }

        function deleteItem(id) {
            dialogs.confirm('Are you sure you want to Delete this item?', 'Delete?', ['OK', 'Cancel'])
                .then(function () {
                    eliteApi.deleteLeague(id).then(function (data) {
                        _.remove(vm.leagues, { 'id': id });
                    });
                });
        }

        function editItem(item) {
            vm.currentEdit[item.id] = true;
            vm.itemToEdit = angular.copy(item);
        }

        function saveItem(item) {
            eliteApi.saveLeague(vm.itemToEdit).then(function (data) {
                vm.currentEdit[item.id] = false;
                item.name = vm.itemToEdit.name;
            });
        }
    }
})();
