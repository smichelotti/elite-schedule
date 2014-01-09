define(['plugins/http', 'durandal/app', 'admin-utils'], function (http, app, utils) {
    var self = this;
    self.leagueId = ko.observable();
    self.leagueName = ko.observable();
    self.gamesUrl = ko.observable();


    var teamViewModel = {
        apiUrl: "/api/teams",
        newTeamName: ko.observable(""),
        newLeagueId: ko.observable(""),
        //leagues: ko.observableArray(),

        addItem: function (item) {
            var _this = this;
            //http.post(this.apiUrl, { name: _this.newTeamName(), leagueId: _this.newLeagueId() }).then(function (data) {
            http.post(this.apiUrl, { name: _this.newTeamName(), leagueId: self.leagueId }).then(function (data) {
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
        }
    };

    utils.extendWithCrudBehaviors("team", teamViewModel);


    //self.apiUrl = "/api/teams";
    //self.items = ko.observableArray();
    //self.newTeamName = ko.observable("");
    //self.newLeagueId = ko.observable();
    //self.selectedItem = ko.observable(null);
    //self.leagues = ko.observableArray();

    //http.get("/api/leagues").then(function (data) {
    //    console.log("leagelist", data);
    //    self.leagues(data);
    //});

    //self.addItem = function (item) {
    //    http.post(self.apiUrl, { name: self.newTeamName(), leagueId: self.newLeagueId }).then(function (data) {
    //        self.items.push(new TeamItem(data));
    //        self.newTeamName("");
    //    });
    //};

    //self.editItem = function (item) {
    //    self.selectedItem(item);
    //};

    //self.displayMode = function (item) {
    //    var isEditing = (self.selectedItem() && item.rowKey === self.selectedItem().rowKey);
    //    return isEditing ? "editTempl" : "itemTempl";
    //};

    //self.saveItem = function (item) {
    //    item.commit();

    //    http.put(self.apiUrl + "/" + item.rowKey(), item).then(function (response) {
    //        self.selectedItem(null);
    //    });
    //};

    //self.cancelEdit = function (item) {
    //    self.selectedItem(null);
    //    item.revert();
    //};

    //self.deleteItem = function (item) {
    //    app.showMessage("Are you sure you want to delete: " + item.name() + "?", "Delete?", ['Yes', 'No']).then(function (response) {
    //        if (response === 'Yes') {
    //            http.delete(self.apiUrl + "/" + item.rowKey()).then(function (response) {
    //                self.items.remove(item);
    //            });
    //        }
    //    });
    //};

    self.activate = function (leagueId) {
        //return http.get(self.apiUrl).then(function (data) {
        //    var mappedData = ko.utils.arrayMap(data, function (item) {
        //        return new TeamItem(item);
        //    });
        //    self.items(mappedData);
        //});
        self.leagueId(leagueId);
        self.gamesUrl("#leagues/" + leagueId + "/games");
        console.log("***self.leagueId SET", self.leagueId(), self.gamesUrl());

        //http.get("/api/leagues").then(function (data) {
        //    teamViewModel.leagues(data);
        //});

        //http.get("/api/leagues/" + self.leagueId).then(function (data) {
        //    console.log("***data from league ", data);
        //    self.leagueName = data.name;
        //});

        //return http.get(teamViewModel.apiUrl).then(function (data) {
        //    var mappedData = ko.utils.arrayMap(data, function (item) {
        //        return new TeamItem(item);
        //    });
        //    teamViewModel.items(mappedData);
        //});

        return http.get("/api/leagues/" + self.leagueId()).then(function (data) {
            self.leagueName(data.name);

            return http.get(teamViewModel.apiUrl + "?leagueId=" + self.leagueId())
        }).then(function (data) {
            var mappedData = ko.utils.arrayMap(data, function (item) {
                return new TeamItem(item);
            });
            teamViewModel.items(mappedData);
        });

    };

    //TODO: potentially refactor this out with re-usable function
    var TeamItem = function (data) {
        this.id = ko.observable();
        this.name = ko.observable();
        this.leagueId = ko.observable();
        //this.leagueName = ko.observable(data.league.name);
        //this.timestamp = ko.observable();
        //this.partitionKey = ko.observable();
        //this.rowKey = ko.observable();

        utils.addEditableMembers(this);
        this.update(data);
    }


    return {
        activate: self.activate,
        items: teamViewModel.items,
        editItem: teamViewModel.editItem,
        deleteItem: teamViewModel.deleteItem,
        addItem: teamViewModel.addItem,
        saveItem: teamViewModel.saveItem,
        cancelEdit: teamViewModel.cancelEdit,
        displayMode: teamViewModel.displayMode,
        newTeamName: teamViewModel.newTeamName,
        newLeagueId: teamViewModel.newLeagueId,
        apiUrl: teamViewModel.apiUrl,
        //leagues: teamViewModel.leagues,
        leagueName: self.leagueName,
        leagueId: self.leagueId,
        gamesUrl: self.gamesUrl,
        getLeagueName: teamViewModel.getLeagueName

        //teams: teamViewModel.items,
        //activate: self.activate,

        //teamToAdd: self.itemToAdd,
        //addTeam: self.addItem,
        //editTeam: self.editItem,
        //deleteTeam: self.deleteItem,
        //displayMode: self.displayMode,
        //saveItem: self.saveItem,
        //cancelEdit: self.cancelEdit
    };
});