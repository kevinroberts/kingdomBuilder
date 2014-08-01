// require.js looks for the following global when initializing
var require = {
    baseUrl: ".",
	//"urlArgs": "bust=" + (new Date()).getTime(),
    paths: {
		"underscore":           "bower_modules/underscore/underscore",
		"underscore.string":    "bower_modules/underscore.string/dist/underscore.string",
        "bootstrap":            "bower_modules/components-bootstrap/js/bootstrap.min",
        "crossroads":           "bower_modules/crossroads/dist/crossroads.min",
        "hasher":               "bower_modules/hasher/dist/js/hasher.min",
        "jquery":               "bower_modules/jquery/dist/jquery",
        "knockout":             "bower_modules/knockout/dist/knockout",
		"bootbox":				"bower_modules/bootbox/bootbox",
        "knockout-projections": "bower_modules/knockout-projections/dist/knockout-projections",
        "signals":              "bower_modules/js-signals/dist/signals.min",
        "text":                 "bower_modules/requirejs-text/text",
		"utils":				"app/utils",
		"bootstrap-editable":	"app/vendor/bootstrap-editable/bootstrap-editable.min"
    },
    shim: {
        "bootstrap": { deps: ["jquery"] },
		"underscore" : {
			exports : "_"
		}
	}
};
