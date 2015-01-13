﻿(function () {
    'use strict';

    angular.module('eliteApp').controller('LeagueShellCtrl', LeagueShellCtrl);

    LeagueShellCtrl.$inject = ['$state', '$stateParams', 'currentLeague']; 

    function LeagueShellCtrl($state, $stateParams, currentLeague) {
        /* jshint validthis:true */
        var vm = this;
        vm.league = currentLeague;
        vm.leagueId = $stateParams.leagueId;
        vm.tabs = [
            { text: 'Main', state: 'league.main' },
            { text: 'Teams', state: 'league.teams' },
            { text: 'Time Slots', state: 'league.slots' },
            { text: 'Generation', state: 'league.generation' },
            { text: 'Games', state: 'league.games' },
            { text: 'Games Calendar', state: 'league.games-calendar' },
            { text: 'Home', state: 'league.league-home' },
            { text: 'Rules', state: 'league.rules' }
        ];

        activate();

        function activate() {
            _.each(vm.tabs, function (tab) {
                tab.active = ($state.current.name === tab.state);
            });
        }
    }
})();
