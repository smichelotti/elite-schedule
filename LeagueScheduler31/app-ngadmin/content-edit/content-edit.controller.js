(function () {
    'use strict';

    angular.module('eliteApp').controller('ContentEditCtrl', ContentEditCtrl);

    ContentEditCtrl.$inject = ['$state', 'initialData', 'eliteApi', 'dialogsService'];

    /* @ngInject */
    function ContentEditCtrl($state, initialData, eliteApi, dialogs) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.isClean = isClean;
        vm.league = initialData;
        vm.origText = ($state.current.data.contentType === 'home' ? initialData.homeScreen : initialData.rulesScreen);
        vm.contentText = vm.origText;
        vm.reset = reset;
        vm.save = save;

        activate();

        ////////////////

        function activate() {
        }

        function isClean() {
            return vm.origText === vm.contentText;
        }

        function reset() {
            vm.contentText = vm.origText;
        }

        function save() {
            eliteApi.saveContentScreen($state.current.data.contentType, vm.league.id, vm.contentText).then(function (data) {
                vm.contentText = data.text;
                dialogs.alert(['Save Complete'], 'Success');
            });
        }
    }
})();