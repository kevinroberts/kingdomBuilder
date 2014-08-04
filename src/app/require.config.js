// require.js looks for the following global when initializing
var require = {
    baseUrl: ".",
	//"urlArgs": "bust=" + (new Date()).getTime(),
    paths: {
		"underscore":           "bower_modules/underscore/underscore",
		"underscore.string":    "bower_modules/underscore.string/dist/underscore.string.min",
        "bootstrap":            "bower_modules/components-bootstrap/js/bootstrap.min",
        "crossroads":           "bower_modules/crossroads/dist/crossroads.min",
        "hasher":               "bower_modules/hasher/dist/js/hasher.min",
        "jquery":               "bower_modules/jquery/dist/jquery",
        "knockout":             "bower_modules/knockout/dist/knockout",
		"knockout-bootstrap" : 	"app/vendor/knockout-bootstrap/knockout-bootstrap",
		"pubsub":				"app/pubsub",
		"bootbox":				"bower_modules/bootbox/bootbox",
        "knockout-projections": "bower_modules/knockout-projections/dist/knockout-projections",
        "signals":              "bower_modules/js-signals/dist/signals.min",
        "text":                 "bower_modules/requirejs-text/text",
		"dataStore":			"app/datastore",
		"utils":				"app/utils",
		"resourcetypes":		"app/model/resourcetypes",
		"resource":				"app/model/resource",
		"ruler":				"app/model/ruler",
		"bootstrap-editable":	"app/vendor/bootstrap-editable/bootstrap-editable.min"
    },
    shim: {
        "bootstrap": { deps: ["jquery"] },
		"underscore" : {
			exports : "_"
		},
		'underscore-string': {
			deps: ['underscore']
		},
		"knockout-bootstrap" : {
			deps: ["jquery", "bootstrap" , "knockout"]
		}
	}
};
