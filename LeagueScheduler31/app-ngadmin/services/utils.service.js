(function () {
    'use strict';

    angular.module('eliteApp').factory('utils', utils);

    //utils.$inject = ['$rootScope'];

    function utils() {
        var formatString = 'YYYY-MM-DDTHH:mm:00';

        var service = {
            combineDateTime: combineDateTime,
            momentNoTS: momentNoTS
        };

        return service;


        function combineDateTime(date, time) {
            var dateString = moment(date).format('MM/DD/YYYY');
            var retVal = moment(dateString + ' ' + moment(time).format('HH:mm')).toDate();
            var formattedVal = moment(dateString + ' ' + moment(time).format('HH:mm')).format(formatString);
            console.log('***retVal', retVal, 'formatted', formattedVal);
            return formattedVal;

            //return moment(dateString + ' ' + moment(time).format('HH:mm')).toDate();
        }

        function momentNoTS(date) {
            return moment(date, formatString);//.format(formatString);
        }
    }
})();