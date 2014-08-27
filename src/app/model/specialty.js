define("specialty", ["jquery", "knockout" ], function ($, ko) {
    'use strict';

    /**
     * represents a person's specialty within a kingdom (could be unemployed worker)
     * main duty is to contributes resources to a kingdom
     * @returns {object} Specialty
     */
    return function (id, name, type, quantity, collectType, description, foodCost) {
        var self = this;
        self.id = id;
        self.name = name;
        self.type = type;
        self.quantity = ko.observable(quantity);
        self.collectType = collectType;
        self.description = description;
        self.foodCost = ko.observable(foodCost);

    };

});