define(['durandal/app', 'data/leagueData'], function (app, leagueData) {
    var vm = {
        activate: activate,
        title: ko.observable(),
        games: ko.observableArray(),

        scoreboardAlert: function () {
            var scoreboardCoach = (this.team1TakesScoreboard ? this.team1 : this.team2);
            app.showMessage(scoreboardCoach + ' takes scoreboard and scorebook home.', 'Scoreboard');
        }
    };

    return vm;

    function activate(name) {
        vm.title('Location Schedule for ' + name);
        var filtered = _.filter(leagueData.data.games, function (item) { return item.location == name; });
        vm.games(filtered);

        return true;
    }
});