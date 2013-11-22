define(['data/leagueData', 'lodash'], function (leagueData, _) {
    var vm = {
        activate: activate,
        title: ko.observable(),
        games: ko.observableArray()
    };

    return vm;

    function activate(name) {
        vm.title('Team Schedule for ' + name);

        var teamGames = _.chain(leagueData.data.games)
            .filter(function (item) { return item.team1 == name || item.team2 == name; })
            .map(function (item) {
                var opponentName = (item.team1 === name ? item.team2 : item.team1);
                return { opponent: opponentName, time: item.time, location: item.location, locationUrl: item.locationUrl };
            }).value();

        vm.games(teamGames);

        return true;
    }
});