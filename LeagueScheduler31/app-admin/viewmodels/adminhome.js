define(['user-data', 'plugins/router'], function (userData, router) {
    var self = this;
    self.hasAdminClaim = ko.observable(false);

    self.activate = function () {
        self.hasAdminClaim(userData.hasClaim("AdminSiteUser"));

    };

    return {
        activate: self.activate,
        hasAdminClaim: self.hasAdminClaim
    };
});