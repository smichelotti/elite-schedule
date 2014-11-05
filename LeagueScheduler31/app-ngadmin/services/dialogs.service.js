(function () {
    'use strict';

    angular.module('eliteApp').factory('dialogsService', dialogsService);

    dialogsService.$inject = ['$modal'];

    function dialogsService($modal) {
        var service = {
            alert: alert,
            confirm: confirm
        };

        return service;

        function alert(messages, title) {
            var modalInstance = $modal.open({
                templateUrl: '/app-ngadmin/shared/alert-modal.html',
                controller: 'ConfirmModalCtrl',
                controllerAs: 'vm',
                resolve: {
                    data: function () {
                        return {
                            messages: messages,
                            title: title
                        };
                    }
                }
                //size: 'sm'
            });

            return modalInstance.result;
        }

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