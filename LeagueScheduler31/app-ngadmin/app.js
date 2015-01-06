(function () {
    'use strict';
    var app = angular.module('eliteApp', [
        // Angular modules 
        'ngAnimate',        // animations
        //'ngRoute',          // routing
        'ngSanitize',

        // 3rd Party Modules
        'ui.bootstrap',      // ui-bootstrap (ex: carousel, pagination, dialog)
        'ui.router',
        'ui.grid',
        'ui.grid.edit',
        'ui.grid.importer',
        'ui.grid.selection',
        'ui.grid.exporter',
        'ui.calendar',
        'ui.select'
    ]);

    //app.config(['$routeProvider', configRoutes]);
    app.config(['$stateProvider', '$urlRouterProvider', /*'uiSelectConfig',*/ configRoutes]);

    // Handle routing errors and success events
    //app.run(['$route', function ($route) {
    app.run(['$state', function ($state) {
        // Include $route to kick start the router.
    }]);

    //#region Private Members

    function configRoutes($stateProvider, $urlRouterProvider, $rootScope/*, uiSelectConfig*/) {
        //uiSelectConfig.theme = 'bootstrap';

        $stateProvider
            .state('home', {
                url: '/',
                controller: 'HomeCtrl',
                controllerAs: 'vm',
                templateUrl: '/app-ngadmin/home/home.html'
            })

        .state('leagues', {
            url: '/leagues',
            controller: 'LeaguesCtrl',
            controllerAs: 'vm',
            templateUrl: '/app-ngadmin/leagues/leagues.html',
            resolve: {
                initialData: ['eliteApi', function (eliteApi) {
                    return eliteApi.getLeagues();
                }]
            }
        })

        .state('league', {
            url: '/leagues/:leagueId',
            abstract: true,
            controller: 'LeagueShellCtrl',
            controllerAs: 'vm',
            templateUrl: '/app-ngadmin/layout/league-shell.html',
            resolve: {
                currentLeague: ['$stateParams', 'eliteApi', function ($stateParams, eliteApi) {
                    return eliteApi.getLeague($stateParams.leagueId);
                }]
            }
        })

        .state('league.teams', {
            url: '/teams',
            views: {
                'tabContent': {
                    templateUrl: '/app-ngadmin/teams/teams.html',
                    controller: 'TeamsCtrl',
                    controllerAs: 'vm',
                    resolve: {
                        initialData: ['$stateParams', 'eliteApi', function ($stateParams, eliteApi) {
                            return eliteApi.getTeams($stateParams.leagueId);
                        }],
                        //TODO: combine this to a init data service
                        initialSpecRequests: ['$stateParams', 'eliteApi', function ($stateParams, eliteApi) {
                            //return eliteApi.getSpecialRequests($stateParams.leagueId);
                            return eliteApi.getSpecialRequests2($stateParams.leagueId);
                        }],
                        timeSlots: ['$stateParams', 'eliteApi',
                            function ($stateParams, eliteApi) {
                                return eliteApi.getSlots($stateParams.leagueId)
                            }]
                    }
                }
            }
        })

        .state('league.slots', {
            url: '/slots',
            views: {
                'tabContent': {
                    templateUrl: '/app-ngadmin/slots/slots.html',
                    controller: 'SlotsCtrl',
                    controllerAs: 'vm',
                    resolve: {
                        initialData: ['$stateParams', 'slotsInitialDataService',
                                function ($stateParams, slotsInitialDataService) {
                                    return slotsInitialDataService.getData($stateParams.leagueId);
                                }]
                    }
                }
            }
        })

        .state('league.generation', {
            url: '/generation',
            views: {
                'tabContent': {
                    templateUrl: '/app-ngadmin/generation/generation.html',
                    controller: 'GenerationCtrl',
                    controllerAs: 'vm',
                    resolve: {
                        initialData: ['$stateParams', 'generationInitialDataService', function ($stateParams, generationInitialDataService) {
                            return generationInitialDataService.getData($stateParams.leagueId);
                        }]
                    }
                }
            }
        })

        .state('league.games', {
            url: '/games',
            views: {
                'tabContent': {
                    templateUrl: '/app-ngadmin/games/games.html',
                    controller: 'GamesCtrl',
                    controllerAs: 'vm',
                    resolve: {
                        initialData: ['$stateParams', 'gamesInitialDataService',
                            function ($stateParams, gamesInitialDataService) {
                                return gamesInitialDataService.getData($stateParams.leagueId);
                            }]
                    }
                }
            }
        })

        .state('league.games-calendar', {
            url: '/games-calendar',
            views: {
                'tabContent': {
                    templateUrl: '/app-ngadmin/games/games-calendar.html',
                    controller: 'GamesCtrl',
                    controllerAs: 'vm',
                    resolve: {
                        initialData: ['$stateParams', 'gamesInitialDataService',
                            function ($stateParams, gamesInitialDataService) {
                                return gamesInitialDataService.getData($stateParams.leagueId);
                            }]
                    }
                }
            }
        });


        $urlRouterProvider.otherwise('/');//{ redirectTo: '/' });

    }

    //function xconfigRoutes($routeProvider) {
    //    $routeProvider
    //        .when("/", {
    //            controller: "HomeCtrl",
    //            controllerAs: "vm",
    //            templateUrl: "/app-ngadmin/home/home.html"
    //        })

    //    .when("/leagues", {
    //        controller: "LeaguesCtrl",
    //        controllerAs: "vm",
    //        templateUrl: "/app-ngadmin/leagues/leagues.html",
    //        resolve: {
    //            initialData: ['eliteApi', function (eliteApi) {
    //                return eliteApi.getLeagues();
    //            }]
    //        }
    //    });

    //    $routeProvider.otherwise({ redirectTo: '/' });
    //}

    //#endregion
})();