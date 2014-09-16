define("tradingValues", ["jquery", "knockout" ], function ($, ko) {
    'use strict';

    /**
     * Trading Values object
     * A model of a trading stand
     * @returns {object} Event
     */
    return function (ironPrice, stonePrice, foodPrice, woodPrice, ironQuantity, stoneQuantity, foodQuantity, woodQuantity) {
        var self = this;
        self.ironPrice = ko.observable(ironPrice);
        self.stonePrice = ko.observable(stonePrice);
        self.foodPrice = ko.observable(foodPrice);
        self.woodPrice = ko.observable(woodPrice);

        self.ironQuantity = ko.observable(ironQuantity);
        self.stoneQuantity = ko.observable(stoneQuantity);
        self.foodQuantity = ko.observable(foodQuantity);
        self.woodQuantity = ko.observable(woodQuantity);
    };

});