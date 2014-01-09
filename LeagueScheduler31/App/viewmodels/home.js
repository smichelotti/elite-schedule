define(['data/leagueData'], function (leagueData) {
    return {
        leagueName: leagueData.data.league.name,
        homeContent: leagueData.data.league.homeScreen
    };
});