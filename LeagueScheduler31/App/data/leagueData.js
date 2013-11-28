define(['plugins/http'], function (http) {

    var leagueData = {};

    return {
        primeData: function (leagueId, isPreview) {
            var url = "/api/leaguedata/" + leagueId;
            if (isPreview) {
                url += "/preview";
            }

            return http.get(url).then(function (response) {
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