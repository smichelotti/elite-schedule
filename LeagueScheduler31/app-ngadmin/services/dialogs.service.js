(function () {
    'use strict';

    angular.module('eliteApp').factory('dialogsService', dialogsService);

    dialogsService.$inject = ['$modal'];

    function dialogsService($modal) {
        var service = {
            confirm: confirm
        };

        return service;

        function confirm(message, title, buttons) {
            var modalInstance = $modal.open({
                templateUrl: '/app-ngadmin/shared/confirm-modal.html',
                controller: 'ConfirmModalCtrl',
                controllerAs: 'vm',
                resolve: {
                    data: function () {
                        return {
                            message: message,
                            title: title,
                            buttons: buttons
                        };
                    }
                },
                size: 'sm'
            });

            return modalInstance.result;
        }
    }
})();