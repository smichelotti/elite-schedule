define(['data/leagueData'], function (leagueData) {
    //return {
    //    teams: leagueData.teams
    //};
    var self = this;
    self.teams = ko.observableArray();

    self.activate = function () {
        self.teams(leagueData.data.teams);
    };

    return {
        activate: self.activate,
        teams: self.teams
    };
});