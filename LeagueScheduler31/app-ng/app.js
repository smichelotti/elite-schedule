// Create the leagueApp module
angular.module("leagueApp", ['ngRoute', 'ngAnimate', 'ngSanitize', 'common']);

(function () {

    angular.module('leagueApp').config(['$routeProvider', routeConfigurator]);
        
    function routeConfigurator($routeProvider) {
        console.log("about to configure routes");
        $routeProvider
            .when("/", {
                templateUrl: "/app-ng/home/home.html",
                resolve: {
                    leagueApi: ['leagueApi', function (leagueApi) {
                        return preloadData(leagueApi);
                    }]
                }
            })
            .when("/fullschedule", {
                //controller: "fullschedule",
                templateUrl: "/app-ng/fullschedule/fullschedule.html",
                //resolve: preloadOptions
                resolve: {
                    leagueApi: ['leagueApi', function (leagueApi) {
                        return preloadData(leagueApi);
                    }]
                }
            })
            .when("/standings", {
                templateUrl: "/app-ng/standings/standings.html",
                resolve: {
                    leagueApi: ['leagueApi', function (leagueApi) {
                        return preloadData(leagueApi);
                    }]
                }
            })
            .when("/teams", {
                templateUrl: "/app-ng/teams/teams.html",
                resolve: {
                    leagueApi: ['leagueApi', function (leagueApi) {
                        return preloadData(leagueApi);
                    }]
                }
            })
            .when("/teams/:id", {
                templateUrl: "/app-ng/teamschedule/teamschedule.html",
                resolve: {
                    leagueApi: ['leagueApi', function (leagueApi) {
                        return preloadData(leagueApi);
                    }]
                }
            })
            .when("/locations", {
                templateUrl: "/app-ng/locations/locations.html",
                resolve: {
                    leagueApi: ['leagueApi', function (leagueApi) {
                        return preloadData(leagueApi);
                    }]
                }
            })
            .when("/locations/:id", {
                templateUrl: "/app-ng/locations/locationSchedule.html",
                resolve: {
                    leagueApi: ['leagueApi', function (leagueApi) {
                        return preloadData(leagueApi);
                    }]
                }
            })
            .when("/rules", {
                templateUrl: "/app-ng/rules/rules.html",
                resolve: {
                    leagueApi: ['leagueApi', function (leagueApi) {
                        return preloadData(leagueApi);
                    }]
                }
            });



        var preloadOptions = {
            leagueApi: ['leagueApi', function (leagueApi) {
                return preloadData(leagueApi);
            }]
        };

        function preloadData(leagueApi) {
            console.log("***in preloadData");
            var segments = document.location.pathname.split("/");
            var leagueId = segments[1];
            var isPreview = (segments.length === 3 && segments[2] === "preview");
            console.log("primeData() values", segments, leagueId, isPreview, document.location.pathname);
            //return leagueApi.primeData(leagueId, isPreview);
            return leagueApi.primeData(1, false);
        };

    }

    angular.module('leagueApp').run(['$route', 'leagueApi', function ($route, leagueApi) {
        // Include $route to kick start the router.
        // leagueApi.primeData(1, false);
    }]);
})();