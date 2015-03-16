(function () {
    'use strict';

    angular.module('eliteApp').factory('userData', userData);

    userData.$inject = ['$q', 'eliteApi'];

    function userData($q, eliteApi) {
        var mainPromise;
        var userData;

        var service = {
            userData: userData,
            hasClaim: hasClaim,
            hasClaimValue: hasClaimValue,
            invalidate: invalidate,
            primeData: primeData
        };
        return service;

        function primeData() {
            if (mainPromise) return mainPromise;

            var deferred = $q.defer();
            eliteApi.getIdentityInfo().then(function (data) {
                service.userData = data;
                console.log('***userData', data);
                deferred.resolve(service);
            });
            mainPromise = deferred.promise;
            return mainPromise;
        }

        function hasClaim(claim) {
            var foundItem = _.find(service.userData.claims, function (item) {
                return item.type === claim;
            });
            return !!foundItem;
        }

        function hasClaimValue(claim, value) {
            var foundItem = _.find(service.userData.claims, function (item) {
                return item.type === claim;
            });
            var values = foundItem.value.split(',');
            var hasValue = _.contains(values, value.toString());
            //console.log('***values', foundItem, values, hasValue);
            return hasValue;
        }

        function invalidate() {
            mainPromise = null;
        }
    }
})();