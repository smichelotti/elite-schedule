(function () {
    'use strict';

    angular.module('eliteApp').controller('LeagueShellCtrl', LeagueShellCtrl);

    LeagueShellCtrl.$inject = ['$state', '$stateParams']; 

    function LeagueShellCtrl($state, $stateParams) {
        /* jshint validthis:true */
        var vm = this;
        vm.leagueId = $stateParams.leagueId;
        vm.tabs = [
            { text: 'Teams', state: 'league.teams' },
            { text: 'Time Slots', state: 'league.slotsx', disabled: true },
            { text: 'Generation', state: 'league.generationx', disabled: true },
            { text: 'Games', state: 'league.games', disabled: true },
            { text: 'Games Calendar', state: 'league.games-calendar', disabled: true },
            { text: 'Home', state: 'league.home', disabled: true },
            { text: 'Rules', state: 'league.rules', disabled: true }
        ];

        activate();

        function activate() {
            _.each(vm.tabs, function (tab) {
                tab.active = ($state.current.name === tab.state);
            });
        }
    }
})();
