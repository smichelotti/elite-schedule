define(['plugins/router'], function (router) {

    var childRouter = router.createChildRouter()
        .makeRelative({ moduleId: 'admin', fromParent: true })
        .map([
            { route: '', moduleId: 'viewmodels/adminhome', title: 'Admin Home' },
            { route: 'leagues', moduleId: 'viewmodels/leagues', title: 'Leagues', nav: true },
            { route: 'locations', moduleId: 'viewmodels/locations', title: 'Locations', nav: true },
            { route: 'teams', moduleId: 'viewmodels/teams', title: 'Teams', nav: true },
            { route: 'games', moduleId: 'viewmodels/games', title: 'Games', nav: true }
        ]).buildNavigationModel();

    console.log("***childRouter", childRouter.navigationModel());


    return {
        router: childRouter
    };
});