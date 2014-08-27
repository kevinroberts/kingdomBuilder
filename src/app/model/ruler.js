define("ruler", ["jquery" ], function ($) {
    'use strict';

    /**
     * Ruler object
     * A model of a Ruler - one per kingdom
     * @returns {object} Ruler
     */
    return function (id, name) {
        var self = this;
        self.id = id;
        self.name = name;
    };

});