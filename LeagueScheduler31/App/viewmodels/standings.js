define(['data/leagueData'], function (leagueData) {
        var vm = {
            activate: activate,
            standings: ko.observableArray(),
            leagueName: ko.observable()
        };

        return vm;

        function activate() {
            vm.standings(leagueData.data.standings);
            vm.leagueName(leagueData.data.league.name);
        }
});