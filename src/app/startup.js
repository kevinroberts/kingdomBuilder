define(['jquery', 'knockout', './router', 'bootstrap', 'knockout-projections'], function ($, ko, router) {
    'use strict';
    // define common name spacing utility
    (function (ns, window, undefined) {
        var base = (function (window) {
            var _use = function () {
                var a = arguments, o = null, i, j, d;
                for (i = 0; i < a.length; i = i + 1) {
                    d = a[i].split(".");
                    o = window;
                    for (j = 0; j < d.length; j = j + 1) {
                        o[d[j]] = o[d[j]] || {};
                        o = o[d[j]];
                    }
                }
                return o;
            };
            var _exists = function (v) {
                var a = window, b, c, d, e;
                b = d = e = 0;
                if (v) {
                    c = v.split(".");
                    d = c.length;
                    while (a && e < d) {
                        a = a[c[e++]];
                    }
                    b = (a ? 1 : 0);
                }
                return !!b;
            };
            return {
                use: _use,
                exists: _exists
            };
        })(window);
        if (!base.exists(ns)) {
            var target = base.use(ns);
            for (var item in base) {
                target[item] = base[item];
            }
        }
    })('my.common.namespace', window);
    // define namespace constants
    (function (ns) {
        ns.isDevelopmentEnvironment = true;
    })(my.common.namespace.use('my.common.kingdom'));

    // Components can be packaged as AMD modules, such as the following:
    ko.components.register('nav-bar', { require: 'components/nav-bar/nav-bar' });
    ko.components.register('home-page', { require: 'components/home-page/home' });

    // ... or for template-only components, you can just point to a .html file directly:
    ko.components.register('about-page', {
        template: { require: 'text!components/about-page/about.html' }
    });

    ko.components.register('kingdom', { require: 'components/kingdom/kingdom' });

    // [Scaffolded component registrations will be inserted here. To retain this feature, don't remove this comment.]

    // Start the application
    ko.applyBindings({ route: router.currentRoute });
});
