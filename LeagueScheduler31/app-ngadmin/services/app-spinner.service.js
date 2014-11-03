(function () {
    'use strict';

    angular.module('eliteApp').factory('appSpinner', appSpinner);

    appSpinner.$inject = ['$rootScope'];

    function appSpinner($rootScope) {
        var service = {
            hideSpinner: hideSpinner,
            showSpinner: showSpinner
        };

        return service;


        function hideSpinner() {
            toggleSpinner(false);
        }

        function showSpinner() {
            toggleSpinner(true);
        }

        function toggleSpinner(show) {
            $rootScope.$broadcast('spinner.toggle', { show: show });
        }
    }
})();