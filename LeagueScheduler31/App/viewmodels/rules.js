define(['data/leagueData'], function (leagueData) {
    //var vm = {
    //    activate: activate,
    //    leagueName: ko.observable(),
    //    rulesContent: ko.observable()
    //};

    //return vm;

    //function activate() {
    //    vm.leagueName(leagueData.data.league.name);
    //    vm.rulesContent(leagueData.data.league.rulesScreen);
    //}

    return {
        leagueName: leagueData.data.league.name,
        rulesContent: leagueData.data.league.rulesScreen
    };
});