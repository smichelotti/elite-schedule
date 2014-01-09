define(['plugins/http'], function (http) {
    var app = require('durandal/app');

    var contentViewModel = {
        contentUrl: "",
        activate: activate,
        leagueId: ko.observable(),
        leagueName: ko.observable(),
        contentText: ko.observable(),
        origText: "",
        contentType: "",
        isTabActive: function (tab) {
            return (tab === this.contentType ? "active" : "");
        },
        reset: function () {
            this.contentText(this.origText);
        },
        save: function () {
            http.put(contentViewModel.contentUrl, { text: contentViewModel.contentText() }).then(function (data) {
                contentViewModel.origText = data.text;
                app.showMessage('Save Complete.', 'Success');
            });
        }
    };

    contentViewModel.isDirty = ko.computed(function () {
        return contentViewModel.contentText() !== contentViewModel.origText;
    });

    return contentViewModel;

    function activate(leagueId, contentType) {
        contentViewModel.contentType = contentType;
        contentViewModel.contentUrl = "/api/leagues/" + leagueId + "/" + contentType + "-screen";
        contentViewModel.leagueId(leagueId);

        return http.get("/api/leagues/" + contentViewModel.leagueId()).then(function (data) {
            contentViewModel.leagueName(data.name);
            contentViewModel.origText = data[contentType + "Screen"];
            contentViewModel.contentText(data[contentType + "Screen"]);
        });
    }
});