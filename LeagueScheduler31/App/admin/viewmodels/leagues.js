define(['plugins/http', 'admin-utils', 'user-data', 'plugins/router'], function (http, utils, userData, router) {
    var app = require('durandal/app');
    var self = this;

    var leagueViewModel = {
        apiUrl: "/api/leagues",
        newName: ko.observable(""),
        publishVisible: ko.observable(true),


        addItem: function (item) {
            var self = this;
            http.post(this.apiUrl, { name: this.newName() }).then(function (data) {
                self.items.push(new LeagueItem(data));
                self.newName("");
            });
        }
    };

    utils.extendWithCrudBehaviors("league", leagueViewModel);

    self.activate = function () {
        if (!userData.hasClaim("AdminSiteUser")) {
            return router.navigate("#");
        }

        http.get("/api/identity/roles").then(function (data) {
            console.log("***identity roles", data);
        });

        return http.get(leagueViewModel.apiUrl).then(function (data) {
            var mappedData = ko.utils.arrayMap(data, function (item) {
                return new LeagueItem(item);
            });
            leagueViewModel.items(mappedData);
        });
    };

    var LeagueItem = function (data) {
        this.id = ko.observable();
        this.name = ko.observable();
        this.isDirty = ko.observable();

        this.publishEnabled = ko.observable(true);

        utils.addEditableMembers(this);
        this.update(data);
    };

    self.publish = function (item) {
        app.showMessage('Are you sure you want to Publish?', 'Publish?', ['Yes', 'No']).then(function (response) {
            if (response === "Yes") {
                item.publishEnabled(false);
                http.post("/api/leagues/" + item.id() + "/publish").then(function () {
                    item.publishEnabled(true);
                    item.isDirty(false);
                    app.showMessage("Publish complete!");
                });
            }
        });
    };

    leagueViewModel.beforeSave = function (item) {
        item.isDirty(true);
    };

    return {
        activate: self.activate,
        items: leagueViewModel.items,
        editItem: leagueViewModel.editItem,
        deleteItem: leagueViewModel.deleteItem,
        addItem: leagueViewModel.addItem,
        saveItem: leagueViewModel.saveItem,
        cancelEdit: leagueViewModel.cancelEdit,
        displayMode: leagueViewModel.displayMode,
        newName: leagueViewModel.newName,
        apiUrl: leagueViewModel.apiUrl,
        publish: self.publish
    };
});