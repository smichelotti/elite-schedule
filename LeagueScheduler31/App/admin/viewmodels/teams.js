define(['plugins/http', 'durandal/app', 'admin-utils'], function (http, app, utils) {
    //var self = this;
    //self.leagueId = ko.observable();
    //self.leagueName = ko.observable();
    //self.gamesUrl = ko.observable();


    var teamViewModel = {
        apiUrl: "/api/teams",
        newTeamName: ko.observable(""),
        newLeagueId: ko.observable(""),
        //leagues: ko.observableArray(),

        addItem: function (item) {
            var _this = this;
            //http.post(this.apiUrl, { name: _this.newTeamName(), leagueId: _this.newLeagueId() }).then(function (data) {
            http.post(this.apiUrl, { name: _this.newTeamName(), leagueId: _this.leagueId }).then(function (data) {
                _this.items.push(new TeamItem(data));
                _this.newTeamName("");
                _this.newLeagueId(0);
            });
        },

        getLeagueName: function (currentItem) {
            var result = ko.utils.arrayFirst(this.leagues(), function (item) {
                return item.id === currentItem.leagueId();
            });
            return result.name;
        },

        activate: activate,

        leagueId: ko.observable(),
        leagueName: ko.observable(),
        gamesUrl: ko.observable()
    };

    utils.extendWithCrudBehaviors("team", teamViewModel);


    return teamViewModel;

    function TeamItem(data) {
        this.id = ko.observable();
        this.name = ko.observable();
        this.leagueId = ko.observable();

        utils.addEditableMembers(this);
        this.update(data);
    };

    function activate(leagueId) {
        teamViewModel.leagueId(leagueId);
        teamViewModel.gamesUrl("#leagues/" + leagueId + "/games");
        console.log("***self.leagueId SET", teamViewModel.leagueId(), teamViewModel.gamesUrl());

        return http.get("/api/leagues/" + teamViewModel.leagueId()).then(function (data) {
            teamViewModel.leagueName(data.name);

            return http.get(teamViewModel.apiUrl + "?leagueId=" + teamViewModel.leagueId())
        }).then(function (data) {
            var mappedData = ko.utils.arrayMap(data, function (item) {
                return new TeamItem(item);
            });
            teamViewModel.items(mappedData);
        });

    };

    


    //return {
    //    activate: self.activate,
    //    items: teamViewModel.items,
    //    editItem: teamViewModel.editItem,
    //    deleteItem: teamViewModel.deleteItem,
    //    addItem: teamViewModel.addItem,
    //    saveItem: teamViewModel.saveItem,
    //    cancelEdit: teamViewModel.cancelEdit,
    //    displayMode: teamViewModel.displayMode,
    //    newTeamName: teamViewModel.newTeamName,
    //    newLeagueId: teamViewModel.newLeagueId,
    //    apiUrl: teamViewModel.apiUrl,
    //    //leagues: teamViewModel.leagues,
    //    leagueName: self.leagueName,
    //    leagueId: self.leagueId,
    //    gamesUrl: self.gamesUrl,
    //    getLeagueName: teamViewModel.getLeagueName

    //    //teams: teamViewModel.items,
    //    //activate: self.activate,

    //    //teamToAdd: self.itemToAdd,
    //    //addTeam: self.addItem,
    //    //editTeam: self.editItem,
    //    //deleteTeam: self.deleteItem,
    //    //displayMode: self.displayMode,
    //    //saveItem: self.saveItem,
    //    //cancelEdit: self.cancelEdit
    //};
});