define(['durandal/app', 'plugins/http'], function (app, http) {
    var self = this;

    self.addEditableMembers = function(item) {
        var rawData = item;
        item.cache = function () { };
        item.cache.propertyList = [];

        for (var property in item) {
            if (item.hasOwnProperty(property)) {
                item.cache.propertyList.push(property);
            }
        }

        item.update = function (data) {
            for (var property in data) {
                if(item.hasOwnProperty(property) && data.hasOwnProperty(property)){
                    item[property](data[property]);
                }
            }

            //save off the latest data for later use
            item.cache.latestData = data;
        };

        item.revert = function () {
            item.update(item.cache.latestData);
        };

        item.commit = function () {
            item.cache.latestData = ko.toJS(item);
        };
    };

    self.extendWithCrudBehaviors = function (name, itemToExtend) {
        self.name = name;
        itemToExtend.uniqueName = name;

        itemToExtend.items = ko.observableArray();
        itemToExtend.itemToAdd = ko.observable("");
        itemToExtend.selectedItem = ko.observable(null);

        //TODO: addItem method
        //itemToExtend.addItem = function (item) {
        //    http.post(itemToExtend.apiUrl, { name: itemToExtend.itemToAdd() }).then(function (data) {
        //        itemToExtend.items.push(new TeamItem(data));
        //        itemToExtend.itemToAdd("");
        //    });
        //};

        itemToExtend.displayMode = function (item) {
            //var isEditing = (itemToExtend.selectedItem() && item.rowKey === itemToExtend.selectedItem().rowKey);
            var isEditing = (itemToExtend.selectedItem() && item.id === itemToExtend.selectedItem().id);
            return isEditing ? itemToExtend.uniqueName + "-editTempl" : itemToExtend.uniqueName + "-itemTempl";;;
        };

        itemToExtend.editItem = function (item) {
            itemToExtend.selectedItem(item);
        };

        itemToExtend.deleteItem = function (item) {
            var itemName = item.name ? item.name() : "this item";
            app.showMessage("Are you sure you want to delete " + itemName + "?", "Delete?", ['Yes', 'No']).then(function (response) {
                if (response === 'Yes') {
                    //http.delete(itemToExtend.apiUrl + "/" + item.rowKey()).then(function (response) {
                    http.delete(itemToExtend.apiUrl + "/" + item.id()).then(function (response) {
                        itemToExtend.items.remove(item);
                    });
                }
            });
        };

        itemToExtend.beforeSave = function (item) { };
        itemToExtend.afterSave = function (item) { };

        itemToExtend.saveItem = function (item) {
            item.commit();
            //http.put(itemToExtend.apiUrl + "/" + item.rowKey(), item).then(function (response) {
            itemToExtend.beforeSave(item);
            http.put(itemToExtend.apiUrl + "/" + item.id(), item).then(function (response) {
                itemToExtend.selectedItem(null);
                itemToExtend.afterSave(response);
            });
        };

        itemToExtend.cancelEdit = function (item) {
            itemToExtend.selectedItem(null);
            item.revert();
        };
    };


    return {
        addEditableMembers: self.addEditableMembers,
        extendWithCrudBehaviors: self.extendWithCrudBehaviors
    };
});