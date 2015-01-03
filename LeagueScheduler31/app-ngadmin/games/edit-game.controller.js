(function () {
    'use strict';

    angular.module('eliteApp').controller('EditGameCtrl', EditGameCtrl);

    EditGameCtrl.$inject = ['$modalInstance', 'eliteApi', 'data', 'utils'];

    /* @ngInject */
    function EditGameCtrl($modalInstance, eliteApi, data, utils) {
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
        vm.saveAndAddAnother = saveAndAddAnother;
        vm.title = (data.itemToEdit ? 'Edit Game' : 'Add New Game');

        activate();

        ////////////////

        function activate() {
            console.log('**vm.editableItem', vm.editableItem, data);
            if (data.itemToEdit) {
                vm.gameDate = utils.momentNoTS(data.itemToEdit.gameTime);
                vm.gameTime = utils.momentNoTS(data.itemToEdit.gameTime);
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
            vm.editableItem.gameTime = utils.combineDateTime(vm.gameDate, vm.gameTime);
            $modalInstance.close(vm.editableItem);
        }

        function saveAndAddAnother() {
            vm.editableItem.gameTime = utils.combineDateTime(vm.gameDate, vm.gameTime);
            vm.editableItem.leagueId = data.leagueId;

            eliteApi.saveGame(vm.editableItem).then(function (result) {
                data.allGames.push(result);

                vm.gameTime = moment(vm.editableItem.gameTime).add(1, 'hour').toDate();
                vm.editableItem.team1Id = null;
                vm.editableItem.team2Id = null;
            });
        }
    }
})();
