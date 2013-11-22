define(['plugins/router', 'durandal/app', 'plugins/http', 'user-data'], function (router, app, http, userData) {
    var self = this;
    self.user = ko.observable();

    var reqVer = document.getElementsByName("__RequestVerificationToken")[0].value;
    self.requestVer = reqVer;


    return {
        router: router,
        search: function () {
            //It's really easy to show a message box.
            //You can add custom options too. Also, it returns a promise for the user's response.
            app.showMessage('Search not yet implemented...');
        },

        adminLinks: ko.computed(function () {
            return ko.utils.arrayFilter(router.navigationModel(), function (route) {
                return route.adminLink === true;
            });
        }),

        regularLinks: ko.computed(function () {
            return ko.utils.arrayFilter(router.navigationModel(), function (route) {
                return (route.adminLink !== true);
            });
        }),

        activate: function () {
            //TODO: move this code to central code file for re-use

            ko.bindingHandlers.shortDate = {
                init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    var value = valueAccessor();
                    $(element).text(moment(value).format('MMMM Do YYYY'));
                }
            };

            ko.bindingHandlers.shortTime = {
                init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    var value = valueAccessor();
                    $(element).text(moment(value).format('h:mm a'));
                }
            };

            ko.bindingHandlers.dateTime = {
                init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    var value = valueAccessor();
                    var valueUnwrapped = ko.unwrap(value);
                    //console.log("dateTime handler", valueUnwrapped);
                    $(element).text(moment(valueUnwrapped).format('MM/DD/YYYY h:mm a'));
                }
            };

            ko.bindingHandlers.datepicker = {
                init: function (element, valueAccessor, allBindingsAccessor) {
                    //initialize datepicker with some optional options
                    var options = allBindingsAccessor().datepickerOptions || {};
                    $(element).datetimepicker(options);

                    //when a user changes the date, update the view model
                    ko.utils.registerEventHandler(element, "changeDate", function (event) {
                        var value = valueAccessor();
                        if (ko.isObservable(value)) {
                            value(event.date);
                        }
                    });
                },
                update: function (element, valueAccessor) {
                    var widget = $(element).data("datetimepicker");
                    //when the view model is updated, update the widget
                    if (widget) {
                        var value = ko.utils.unwrapObservable(valueAccessor());
                        if (value) {
                            widget.date = new Date(ko.utils.unwrapObservable(valueAccessor()));
                            widget.setValue();
                        }
                    }
                }
            };

            router.map([
                { route: '', title: 'Home', moduleId: 'viewmodels/adminhome', nav: true },
                { route: 'leagues', moduleId: 'viewmodels/leagues', title: 'Leagues', nav: true },
                { route: 'locations', moduleId: 'viewmodels/locations', title: 'Locations', nav: true },
                { route: 'leagues/:leagueId/teams', moduleId: 'viewmodels/teams', title: 'Teams', nav: false },
                { route: 'leagues/:leagueId/games', moduleId: 'viewmodels/games', title: 'Games', nav: false }
            ]).buildNavigationModel();


            return http.get("/api/identity/info").then(function (data) {
                userData.setUserData(data);

                self.user(data);


                return router.activate();
            });
            
            //return router.activate();
        },

        user: self.user,
        requestVer: self.requestVer
    };
});