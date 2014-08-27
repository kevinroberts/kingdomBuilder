define("upgrade", ["jquery", "knockout" ], function ($, ko) {
    'use strict';

    /**
     * Upgrade object
     * A model of an upgrade
     * @returns {object} Upgrade
     */
    return function (id, name, type, researched, providedBonus, description, costDescription, goldCost, woodCost, stoneCost, ironCost, visible) {
        var self = this;
        self.id = id;
        self.name = name;
        self.type = type;
        self.researched = ko.observable(researched);
        self.providedBonus = ko.observable(providedBonus);
        self.description = description;
        self.costDescription = costDescription;
        self.goldCost = ko.observable(goldCost);
        self.woodCost = ko.observable(woodCost);
        self.stoneCost = ko.observable(stoneCost);
        self.ironCost = ko.observable(ironCost);
        self.visible = ko.observable(visible);

    };

});