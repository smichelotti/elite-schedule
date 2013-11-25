define(['data/leagueData'], function (leagueData) {
        var vm = {
            activate: activate,
            standings: ko.observableArray()
        };

        return vm;

        function activate() {
            vm.standings(leagueData.data.standings);
        }
});