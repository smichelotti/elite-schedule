define(['data/leagueData'], function (leagueData) {
    var vm = {
        activate: activate,
        leagueName: ko.observable()
    };

    return vm;

    function activate() {
        vm.leagueName(leagueData.data.league.name);
    }
});