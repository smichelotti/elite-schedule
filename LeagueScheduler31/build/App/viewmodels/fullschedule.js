define(["durandal/app","data/leagueData"],function(t,e){var n=this;return n.games=ko.observableArray(),n.leagueName=ko.observable(),n.activate=function(){n.games(e.data.games),n.leagueName(e.data.league.name)},{activate:n.activate,games:n.games}});