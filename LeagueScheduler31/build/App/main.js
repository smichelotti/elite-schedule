requirejs.config({paths:{text:"../Scripts/text",durandal:"../Scripts/durandal",plugins:"../Scripts/durandal/plugins",transitions:"../Scripts/durandal/transitions",lodash:"../Scripts/lodash"},shim:{lodash:{exports:"_"}}}),define("jquery",function(){return jQuery}),define("knockout",ko),define(["durandal/system","durandal/app","durandal/viewLocator"],function(t,e,n){t.debug(!0),e.title="HC Middle School JV",e.configurePlugins({router:!0,dialog:!0,widget:!0,observable:!0}),e.start().then(function(){n.useConvention(),e.setRoot("viewmodels/shell","entrance")})});