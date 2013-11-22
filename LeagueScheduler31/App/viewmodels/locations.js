define(['data/leagueData'], function (leagueData) {
    var self = this;
    self.locations = ko.observableArray();

    self.activate = function () {
        self.locations(leagueData.data.locations);
    };

    return {
        activate: self.activate,
        locations: self.locations
    };
});