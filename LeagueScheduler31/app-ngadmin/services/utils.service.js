(function () {
    'use strict';

    angular.module('eliteApp').factory('utils', utils);

    //utils.$inject = ['$rootScope'];

    function utils() {
        var service = {
            combineDateTime: combineDateTime
        };

        return service;


        function combineDateTime(date, time) {
            var dateString = moment(date).format('MM/DD/YYYY');
            return moment(dateString + ' ' + moment(time).format('HH:mm')).toDate();
        }
    }
})();