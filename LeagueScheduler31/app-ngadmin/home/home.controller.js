(function () {
    'use strict';

    angular.module('eliteApp').controller('HomeCtrl', HomeCtrl);

    HomeCtrl.$inject = ['$location']; 

    function HomeCtrl($location) {
        /* jshint validthis:true */
        console.log("***in HomeCtrl");
        var vm = this;
        vm.title = 'HomeCtrl';

        activate();

        function activate() { }
    }
})();
