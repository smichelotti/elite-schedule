define(['plugins/router', 'durandal/app', 'data/leagueData'], function (router, app, leagueData) {

    return {
        router: router,
        search: function() {
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

            ko.bindingHandlers.markdown = {
                update: function (element, valueAccessor) {
                    var markdownValue = ko.utils.unwrapObservable(valueAccessor());
                    var htmlValue = markdownValue && new Showdown.converter().makeHtml(markdownValue);
                    $(element).html(htmlValue || "");
                }
            };



            router.map([
                { route: '', title: 'Home', moduleId: 'viewmodels/home', nav: true },
                { route: '!fullschedule', title: 'Full Schedule', moduleId: 'viewmodels/fullschedule', nav: true },
                { route: '!standings', title: 'Standings', moduleId: 'viewmodels/standings', nav: true },
                { route: '!teams', title: 'Teams', moduleId: 'viewmodels/teams', nav: true },
                { route: '!teams/:name', title: 'Teams', moduleId: 'viewmodels/teamschedule', nav: false },
                { route: '!locations', title: 'Locations', moduleId: 'viewmodels/locations', nav: true },
                { route: '!locations/:name', title: 'Locations', moduleId: 'viewmodels/locationschedule', nav: false },
                { route: '!rules', title: 'Rules', moduleId: 'viewmodels/rules', nav: true },
                { route: '/leagues', hash: '/', title: 'Switch Leagues', nav: true }
                //{ route: 'admin*details', title: 'Admin', moduleId: 'admin/index', nav: false, hash: "#admin" }
                //{ route: '!admin', title: 'Admin', moduleId: 'admin/index', nav: true }

                //{ route: '!admin/teams', title: 'Teams', moduleId: 'admin/viewmodels/teams', nav: true, adminLink: true },
                //{ route: '!admin/locations', title: 'Locations', moduleId: 'admin/viewmodels/locations', nav: true, adminLink: true },
                //{ route: '!admin/leagues', title: 'Leagues', moduleId: 'admin/viewmodels/leagues', nav: true, adminLink: true },
                //{ route: '!admin/games', title: 'Games', moduleId: 'admin/viewmodels/games', nav: true, adminLink: true }
            ]).buildNavigationModel();
            
            //return router.activate();
            var segments = document.location.pathname.split("/");
            var leagueId = segments[1];
            var isPreview = (segments.length === 3 && segments[2] === "preview");

            return leagueData.primeData(leagueId, isPreview).then(function () {
                return router.activate();
            });
        }
    };
});