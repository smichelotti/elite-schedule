define(["data/leagueData"],function(e){var t=this;return t.locations=ko.observableArray(),t.leagueName=ko.observable(),t.activate=function(){t.locations(e.data.locations),t.leagueName(e.data.league.name)},{activate:t.activate,locations:t.locations}});