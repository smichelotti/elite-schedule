define(['durandal/app', 'data/leagueData'], function (app, leagueData) {
    var self = this;
    self.games = ko.observableArray();

    self.activate = function () {
        self.games(leagueData.data.games);
    };

    return {
        activate: self.activate,
        games: self.games
    };
});