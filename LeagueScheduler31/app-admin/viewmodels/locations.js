define(['plugins/http', 'admin-utils', 'user-data', 'plugins/router'], function (http, utils, userData, router) {
    var self = this;

    var locationViewModel = {
        apiUrl: "/api/locations",
        newLocationName: ko.observable(""),
        newLocationLink: ko.observable(""),
        newLocationAddress: ko.observable(""),
        newLocationLat: ko.observable(""),
        newLocationLng: ko.observable(""),


        addItem: function (item) {
            var self = this;
            var newLocation = { 
                name: this.newLocationName(),
                link: this.newLocationLink(),
                address: this.newLocationAddress(),
                latitude: this.newLocationLat(),
                longitude: this.newLocationLng()
            };
            http.post(this.apiUrl, newLocation).then(function (data) {
                self.items.push(new LocatonItem(data));
                self.newLocationName("");
                self.newLocationLink("");
                self.newLocationAddress("");
                self.newLocationLat("");
                self.newLocationLng("");
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
        this.address = ko.observable();
        this.latitude = ko.observable();
        this.longitude = ko.observable();
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
        newLocationAddress: locationViewModel.newLocationAddress,
        newLocationLat: locationViewModel.newLocationLat,
        newLocationLng: locationViewModel.newLocationLng,
        apiUrl: locationViewModel.apiUrl
    };
});