define(['data/leagueData'], function (leagueData) {
    var self = this;
    self.locations = ko.observableArray();
    self.leagueName = ko.observable();

    self.activate = function () {
        self.locations(leagueData.data.locations);
        self.leagueName(leagueData.data.league.name);
    };

    return {
        activate: self.activate,
        locations: self.locations
    };
});