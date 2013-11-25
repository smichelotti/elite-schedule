define(['plugins/http'], function (http) {

    var leagueData = {};

    return {
        primeData: function (leagueId) {
            //console.log("***in primeData");
            return http.get("/api/leaguedata/" + leagueId).then(function (response) {
                //console.log("***primeData results", response);
                leagueData.teams = response.teams;
                leagueData.games = response.games;
                leagueData.locations = response.locations;
                leagueData.league = response.league;
                leagueData.standings = response.standings;
            });
        },

        data: leagueData
    };
});