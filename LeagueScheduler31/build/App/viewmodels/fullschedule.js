define(["durandal/app","data/leagueData"],function(a,e){var t=this;return t.games=ko.observableArray(),t.leagueName=ko.observable(),t.activate=function(){t.games(e.data.games),t.leagueName(e.data.league.name)},{activate:t.activate,games:t.games}});