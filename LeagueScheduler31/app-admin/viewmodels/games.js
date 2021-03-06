﻿define(['plugins/http', 'admin-utils'], function (http, utils) {
    //var self = this;
    //self.leagueId = ko.observable();
    //self.leagueName = ko.observable();


    function formatDate(date) {
        var d = new Date(date);
        return moment(d).utc().format("YYYY-MM-DDTHH:mm:00");
    }

    function sortByDate(left, right) {
        var leftDate = moment(left.gameTime());
        var rightDate = moment(right.gameTime());
        return leftDate.isSame(rightDate) ? 0 : (leftDate.isBefore(rightDate) ? -1 : 1);
    }

    var gamesViewModel = {
        apiUrl: '/api/games',
        newGameTime: ko.observable(),
        newTeam1Id: ko.observable(),
        newTeam2Id: ko.observable(),
        newLocationId: ko.observable(),
        isTabActive: function (tab) {
            return (tab === "games" ? "active" : "");
        },

        teams: ko.observableArray(),
        locations: ko.observableArray(),

        leagueId: ko.observable(),
        leagueName: ko.observable(),
        activate: activate,
        leagueId: ko.observable(),
        leagueName: ko.observable(),
        selectedScoreItem: ko.observable(),

        filterTeamId: ko.observable(),
        filterLocationId: ko.observable(),

        

        addItem: function (item) {
            var _this = this;
            
            var itemToPost = { gameTime: formatDate(this.newGameTime()), team1Id: this.newTeam1Id(), team2Id: this.newTeam2Id(), locationId: this.newLocationId(), leagueId: _this.leagueId };
            http.post(this.apiUrl, itemToPost).then(function(data) {
                _this.items.push(new GameItem(data));

                // Set the timepicker 1 hour ahead of what we just added to facilitate data entry
                var nextTime = _this.newGameTime();
                nextTime.setHours(nextTime.getHours() + 1);
                _this.newGameTime(nextTime);
                _this.newTeam1Id("");
                _this.newTeam2Id("");
                //_this.newLocationId("");
                _this.items.sort(sortByDate);
            });
        },

        getTeamName: function (teamId) {
            var result = ko.utils.arrayFirst(this.teams(), function (item) {
                return item.id == teamId;
            });
            return result ? result.name : "";
        },

        getLocationName: function (locationId) {
            var result = ko.utils.arrayFirst(this.locations(), function (item) {
                return item.id == locationId;
            });
            return result ? result.name : "";
        },

        editScore: function (item) {
            gamesViewModel.selectedScoreItem(item);
        },

        

        saveScore: function (item) {
            item.commit();
            gamesViewModel.beforeSave(item);
            http.put(gamesViewModel.apiUrl + "/" + item.id(), item).then(function (response) {
                gamesViewModel.selectedScoreItem(null);
                gamesViewModel.afterSave(response);
            });
        },

        cancelSaveScore: function (item) {
            gamesViewModel.selectedScoreItem(null);
            item.revert();
        }
    };

    utils.extendWithCrudBehaviors("game", gamesViewModel);

    gamesViewModel.filteredGames = ko.computed(function () {
        var filterTeamId = gamesViewModel.filterTeamId(),
            filterLocationId = gamesViewModel.filterLocationId();
        //console.log("teamId, locationId", filterTeamId, filterLocationId);
        
        var filteredItems = ko.utils.arrayFilter(gamesViewModel.items(), function (item) {
            var noFilter = (filterTeamId === undefined && filterLocationId === undefined),
                locationFilter = (filterLocationId && item.locationId() === filterLocationId),
                teamFilter = (filterTeamId && (item.team1Id() === filterTeamId || item.team2Id() === filterTeamId));

            return (noFilter || (locationFilter || teamFilter));
        });
        return filteredItems;
    });

    

    gamesViewModel.displayMode = function (item) {
        var isEditingScore = (gamesViewModel.selectedScoreItem() && item.id === gamesViewModel.selectedScoreItem().id);
        if (isEditingScore) {
            return "game-scoreTempl";
        }
        else {
            var isEditing = (gamesViewModel.selectedItem() && item.id === gamesViewModel.selectedItem().id);
            return isEditing ? gamesViewModel.uniqueName + "-editTempl" : gamesViewModel.uniqueName + "-itemTempl";
        }
    };

    gamesViewModel.beforeSave = function (item) {
        //item.gameTime(formatDate(item.gameTime()));
    };

    gamesViewModel.afterSave = function (data) {
        gamesViewModel.items.sort(sortByDate);
    };

    return gamesViewModel;


    function activate(leagueId) {
        gamesViewModel.leagueId(leagueId);
        console.log("***self.leagueId SET", gamesViewModel.leagueId());

        return http.get("/api/leagues/" + gamesViewModel.leagueId()).then(function (data) {
            gamesViewModel.leagueName(data.name);

            return http.get("/api/teams?leagueId=" + gamesViewModel.leagueId())
        })
        .then(function (data) {
            gamesViewModel.teams(data);
            return http.get("/api/locations");
        })
        .then(function (data) {
            gamesViewModel.locations(data);
            return http.get(gamesViewModel.apiUrl + "?leagueId=" + gamesViewModel.leagueId());
        })
        .then(function (data) {
            console.log("***all games data", data);
            var mappedData = ko.utils.arrayMap(data, function (item) {
                return new GameItem(item);
            });
            gamesViewModel.items(mappedData);
        });
    };

    function GameItem(data) {
        this.id = ko.observable();
        this.gameTime = ko.observable();
        this.team1Id = ko.observable();
        this.team2Id = ko.observable();
        this.locationId = ko.observable();
        this.leagueId = ko.observable();
        this.team1Score = ko.observable();
        this.team2Score = ko.observable();

        utils.addEditableMembers(this);
        this.update(data);
    };

   

    //return {
    //    activate: self.activate,
    //    items: gamesViewModel.items,
    //    editItem: gamesViewModel.editItem,
    //    deleteItem: gamesViewModel.deleteItem,
    //    addItem: gamesViewModel.addItem,
    //    saveItem: gamesViewModel.saveItem,
    //    cancelEdit: gamesViewModel.cancelEdit,
    //    displayMode: gamesViewModel.displayMode,
        
    //    newGameTime: gamesViewModel.newGameTime,
    //    teams: gamesViewModel.teams,
    //    locations: gamesViewModel.locations,
    //    newTeam1Id: gamesViewModel.newTeam1Id,
    //    newTeam2Id: gamesViewModel.newTeam2Id,
    //    newLocationId: gamesViewModel.newLocationId,
    //    apiUrl: gamesViewModel.apiUrl,

    //    getLocationName: gamesViewModel.getLocationName,
    //    getTeamName: gamesViewModel.getTeamName,
    //    leagueId: self.leagueId
    //};
});