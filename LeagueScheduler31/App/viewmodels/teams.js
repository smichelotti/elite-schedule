define(['data/leagueData'], function (leagueData) {
    var self = this;
    self.teams = ko.observableArray();
    self.leagueName = ko.observable();

    self.activate = function () {
        self.teams(leagueData.data.teams);
        self.leagueName(leagueData.data.league.name);
    };

    return {
        activate: self.activate,
        teams: self.teams
    };
});