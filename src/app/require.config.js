// require.js looks for the following global when initializing
var require = {
    baseUrl: ".",
    //"urlArgs": "bust=" + (new Date()).getTime(),
    paths: {
        "underscore": "bower_modules/underscore/underscore",
        "globalize": "bower_modules/globalize/lib/globalize",
        "bootstrap": "bower_modules/components-bootstrap/js/bootstrap.min",
        "crossroads": "bower_modules/crossroads/dist/crossroads.min",
        "hasher": "bower_modules/hasher/dist/js/hasher.min",
        "jquery": "bower_modules/jquery/dist/jquery",
        "knockout": "bower_modules/knockout/dist/knockout",
        "knockout-bootstrap": "app/vendor/knockout-bootstrap/knockout-bootstrap",
        "bootbox": "bower_modules/bootbox/bootbox",
        "knockout-projections": "bower_modules/knockout-projections/dist/knockout-projections",
        "signals": "bower_modules/js-signals/dist/signals.min",
        "text": "bower_modules/requirejs-text/text",
        "chance": "bower_modules/chance/chance",
        "growl": "app/vendor/jquery-growl/jquery.growl",
        "pubsub": "app/pubsub",
        "dataStore": "app/datastore",
        "utils": "app/utils",
        "event": "app/model/event",
        "upgrade": "app/model/upgrade",
        "upgradetypes": "app/model/upgradetypes",
        "resourcetypes": "app/model/resourcetypes",
        "persontypes": "app/model/persontypes",
        "buildingtypes": "app/model/buildingtypes",
        "tradingValues": "app/model/tradingValues",
        "resource": "app/model/resource",
        "specialty": "app/model/specialty",
        "building": "app/model/building",
        "ruler": "app/model/ruler",
        "mousetrap": "app/vendor/mousetrap.min"
    },
    shim: {
        "bootstrap": { deps: ["jquery"] },
        "growl": { deps: ["jquery"] },
        "underscore": {
            exports: "_"
        },
        "knockout-bootstrap": {
            deps: ["jquery", "bootstrap", "knockout"]
        }
    }
};
