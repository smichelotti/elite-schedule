define(["durandal/app","data/leagueData"],function(a,e){function t(a){n.title("Location Schedule for "+a);var t=_.filter(e.data.games,function(e){return e.location==a});return n.games(t),!0}var n={activate:t,title:ko.observable(),games:ko.observableArray(),scoreboardAlert:function(){var e=this.team1TakesScoreboard?this.team1:this.team2;a.showMessage(e+" takes scoreboard and scorebook home.","Scoreboard")}};return n});