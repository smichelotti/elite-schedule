(function () {
    'use strict';

    var controllerId = 'shell';
    //angular.module('leagueApp').controller(controllerId, ['common', '$location', 'leagueApi', shell]);
    angular.module('leagueApp').controller(controllerId, ['$location', shell]);

    function shell($location) {
        var vm = this;
        vm.isBusy = true;
        vm.busyMessage = "Loading data...";


        //vm.activate = activate;
        //vm.title = 'shell';

        vm.highlightNav = function (path) {
            return $location.path() === path;
        };

        //activate();

        //function activate() {
        //    //console.log("about to call activate", leagueApi);
        //    //var promises = [leagueApi.primeData(1, false)];
        //    //common.activateController(promises, controllerId).then(function () {
        //    //    console.log("Shell activated", leagueApi.data);
        //    //    console.log(leagueApi.data);
        //    //});
        //}
    }
})();
