define("building", ["jquery", "knockout" ], function ($, ko) {
    'use strict';

    /**
     * Building object
     * A model of a building
     * @returns {object} Building
     */
    return function (id, name, type, landCost, quantity, providedBonus, description, costDescription, goldCost, woodCost, stoneCost, ironCost, visible) {
        var self = this;
        self.id = id;
        self.name = name;
        self.type = type;
        self.landCost = landCost;
        self.quantity = ko.observable(quantity);
        self.providedBonus = ko.observable(providedBonus);
        self.description = description;
        self.costDescription = costDescription;
        self.goldCost = ko.observable(goldCost);
        self.woodCost = ko.observable(woodCost);
        self.stoneCost = ko.observable(stoneCost);
        self.ironCost = ko.observable(ironCost);
        self.visible = ko.observable(visible);

        self.addOne = function () {
            self.quantity(self.quantity() + 1);
        };

    };

});