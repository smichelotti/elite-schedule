define(['data/leagueData'], function (leagueData) {
    return {
        leagueName: leagueData.data.league.name
    };
});