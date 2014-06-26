(function () {
    'use strict';

    angular.module('leagueApp').controller('locationSchedule', ['$scope', '$routeParams', 'leagueApi', 'common', locationSchedule]);

    function locationSchedule($scope, $routeParams, leagueApi, common) {
        var vm = this;

        console.log("*** location sched. route params", $routeParams);

        var locationName = $routeParams.id;
        vm.title = 'Location Schedule for ' + $routeParams.id;
        var filtered = _.filter(leagueApi.games, function (item) { return item.location == common.replaceAll('+', ' ', locationName); });
        console.log("***after filter", filtered, leagueApi.games);
        vm.games = filtered;
    }
})();
