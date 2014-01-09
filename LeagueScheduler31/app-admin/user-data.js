/// This user-data module should be used to cache user data and re-used across view models
define(function () {
    var userData = {};

    return {
        getUserData: function () { return userData; },

        setUserData: function (data) {
            userData = data;
        },

        getFoo: function(){
            return userData.claims.length;
        },

        hasClaim: function (claim) {
            var foundItem = _.find(userData.claims, function (item) {
                return item.type === claim;
            });
            return !!foundItem;
        }
    };
});