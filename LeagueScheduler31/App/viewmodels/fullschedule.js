define(['durandal/app', 'data/leagueData'], function (app, leagueData) {
    var self = this;
    self.games = ko.observableArray();
    self.leagueName = ko.observable();

    self.activate = function () {
        self.games(leagueData.data.games);
        self.leagueName(leagueData.data.league.name);
    };

    return {
        activate: self.activate,
        games: self.games
    };
});