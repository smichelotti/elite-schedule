//TODO: Inject dependencies
define(['plugins/http'], function (http) {
        // Internal properties and functions
       
        // Reveal the bindable properties and functions
        var rulesViewModel = {
            activate: activate,
            leagueId: ko.observable(),
            leagueName: ko.observable(),
            isTabActive: function (tab) {
                return (tab === "rules" ? "active" : "");
            },
        };

        return rulesViewModel;
        
        function activate(leagueId) {
            //TODO: Initialize lookup data here.
            rulesViewModel.leagueId(leagueId);
            console.log("***self.leagueId SET", rulesViewModel.leagueId());

            return http.get("/api/leagues/" + rulesViewModel.leagueId()).then(function (data) {
                rulesViewModel.leagueName(data.name);

                //return http.get("/api/teams?leagueId=" + gamesViewModel.leagueId())
            });
            //TODO: Get the data for this viewmodel, return a promise.
        }
});