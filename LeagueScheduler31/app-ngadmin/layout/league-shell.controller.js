(function () {
    'use strict';

    angular.module('eliteApp').controller('LeagueShellCtrl', LeagueShellCtrl);

    LeagueShellCtrl.$inject = ['$state', '$stateParams', 'currentLeague', 'userData'];

    function LeagueShellCtrl($state, $stateParams, currentLeague, userData) {
        /* jshint validthis:true */
        var vm = this;
        vm.canEditLeague = userData.hasClaimValue('can-edit-league', $stateParams.leagueId);
        vm.league = currentLeague;
        vm.leagueId = $stateParams.leagueId;
        vm.tabs = [
            { text: 'Main', state: 'league.main', visible: true },
            { text: 'Teams', state: 'league.teams', visible: true },
            { text: 'Time Slots', state: 'league.slots', visible: vm.canEditLeague },
            { text: 'Generation', state: 'league.generation', visible: vm.canEditLeague },
            { text: 'Games', state: 'league.games', visible: true },
            { text: 'Games Calendar', state: 'league.games-calendar', visible: vm.canEditLeague },
            { text: 'Home', state: 'league.league-home', visible: vm.canEditLeague },
            { text: 'Rules', state: 'league.rules', visible: vm.canEditLeague }
        ];

        activate();

        function activate() {
            _.each(vm.tabs, function (tab) {
                tab.active = ($state.current.name === tab.state);
            });
        }
    }
})();
