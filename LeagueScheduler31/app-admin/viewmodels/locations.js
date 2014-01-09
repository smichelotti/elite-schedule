define(['plugins/http', 'admin-utils', 'user-data', 'plugins/router'], function (http, utils, userData, router) {
    var self = this;

    var locationViewModel = {
        apiUrl: "/api/locations",
        newLocationName: ko.observable(""),
        newLocationLink: ko.observable(""),


        addItem: function (item) {
            var self = this;
            http.post(this.apiUrl, { name: this.newLocationName(), link: this.newLocationLink() }).then(function (data) {
                self.items.push(new LocatonItem(data));
                self.newLocationName("");
                self.newLocationLink("");
            });
        }
    };

    utils.extendWithCrudBehaviors("location", locationViewModel);

    self.activate = function () {
        if (!userData.hasClaim("AdminSiteUser")) {
            return router.navigate("#");
        }


        return http.get(locationViewModel.apiUrl).then(function (data) {
            var mappedData = ko.utils.arrayMap(data, function (item) {
                return new LocatonItem(item);
            });
            locationViewModel.items(mappedData);
        });
    };

    var LocatonItem = function (data) {
        this.id = ko.observable();
        this.name = ko.observable();
        this.link = ko.observable();
        //this.timestamp = ko.observable();
        //this.partitionKey = ko.observable();
        //this.rowKey = ko.observable();

        utils.addEditableMembers(this);
        this.update(data);
    }

    return {
        activate: self.activate,
        items: locationViewModel.items,
        editItem: locationViewModel.editItem,
        deleteItem: locationViewModel.deleteItem,
        addItem: locationViewModel.addItem,
        saveItem: locationViewModel.saveItem,
        cancelEdit: locationViewModel.cancelEdit,
        displayMode: locationViewModel.displayMode,
        newLocationName: locationViewModel.newLocationName,
        newLocationLink: locationViewModel.newLocationLink,
        apiUrl: locationViewModel.apiUrl
    };
});