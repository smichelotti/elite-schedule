(function () {
    'use strict';

    angular.module('eliteApp').controller('MainCtrl', MainCtrl);

    MainCtrl.$inject = ['$state', 'initialData', 'leagueMembers', 'userData', 'dialogsService', 'eliteApi'];

    /* @ngInject */
    function MainCtrl($state, initialData, leagueMembers, userData, dialogs, eliteApi) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.addMember = addMember;
        vm.cancelEdit = cancelEdit;
        vm.cancelMemberEdit = cancelMemberEdit;
        vm.canDeleteLeague = false;
        vm.canEditLeague = false;
        vm.deleteLeague = deleteLeague;
        vm.editMemberItem = editMemberItem;
        vm.editName = editName;
        vm.league = initialData;
        vm.leagueMembers = [];
        vm.leagueOwner = null;
        vm.memberCurrentEdit = {};
        vm.memberItemToEdit = {};
        vm.newUserPermission = '';
        vm.publish = publish;
        vm.removeMember = removeMember;
        vm.saveEdit = saveEdit;
        vm.saveMemberItem = saveMemberItem;
        vm.permissionsList = [
            { text: '(Select)', value: '' },
            { text: 'Co-Admin', value: 'league-co-admin' },
            { text: 'Scores Editor', value: 'league-score-editor' }
        ];
        vm.permissionsLookup = {};
        activate();

        ////////////////

        function activate() {
            //console.log('***league', vm.league, leagueMembers);
            vm.canDeleteLeague = userData.hasClaimValue('can-delete-league', vm.league.id);
            vm.canEditLeague = userData.hasClaimValue('can-edit-league', vm.league.id);
            vm.leagueOwner = _.find(leagueMembers, { 'permission': 'league-owner' });
            vm.leagueMembers = _.filter(leagueMembers, function (item) {
                return item.permission !== 'league-owner';
            });

            _.forEach(vm.permissionsList, function (perm) {
                vm.permissionsLookup[perm.value] = perm.text;
            });
        }

        function addMember() {
            if (vm.newUserName === '' || vm.newUserPermission === '') {
                dialogs.alert(['You must enter a user and select a permission!'], 'Invalid Entry');
                return;
            }

            var member = {
                name: vm.newUserName,
                permission: vm.newUserPermission
            };

            eliteApi.addLeagueMember(vm.league.id, member).then(function (response) {
                if (response.status === 400) {
                    dialogs.alert([response.data.message], 'Error');
                } else {
                    vm.leagueMembers.push(response);
                    vm.newUserName = '';
                    vm.newUserPermission = '';
                }
            });
        }

        function cancelEdit() {
            vm.leagueName = null;
        }

        function cancelMemberEdit() {
            vm.memberCurrentEdit = {};
        }

        function deleteLeague(id) {
            dialogs.confirm('Are you sure you want to Delete this League?', 'Delete?', ['OK', 'Cancel'])
                .then(function () {
                    eliteApi.deleteLeague(id).then(function (data) {
                        $state.go('leagues');
                    });
                });
        }

        function editMemberItem(item) {
            vm.memberCurrentEdit[item.id] = true;
            vm.memberItemToEdit = angular.copy(item);
        }

        function editName() {
            vm.leagueName = vm.league.name;
        }

        function publish() {
            dialogs.confirm('Are you sure you want to Publish?', 'Publish?', ['Yes', 'No'])
                .then(function(){
                    eliteApi.publishLeague(vm.league.id).then(function (data) {
                        vm.league.isDirty = false;
                        dialogs.alert(['League was successfully published!'], 'Publish Complete');
                    });
                });
        }

        function removeMember(member) {
            dialogs.confirm('Are you sure you want to remove this member?', 'Remove Member?', ['Yes', 'No'])
                .then(function () {
                    eliteApi.removeLeagueMember(vm.league.id, member.userId).then(function (data) {
                        _.remove(vm.leagueMembers, { 'userId': member.userId });
                    });
                });
        }

        function saveEdit() {
            vm.league.name = vm.leagueName;
            eliteApi.saveLeague(vm.league).then(function (data) {
                vm.leagueName = null;
            });
        }

        function saveMemberItem(leagueMember) {
            var member = {
                name: leagueMember.userName,
                permission: leagueMember.permission
            };
            eliteApi.editLeagueMember(vm.league.id, leagueMember.userId, member).then(function (response) {
                vm.cancelMemberEdit();
            });
        }
    }
})();