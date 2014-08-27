define("resource", ["jquery", 'resourcetypes', 'knockout', 'utils', 'underscore', 'resourcetypes', 'globalize', 'pubsub'  ], function ($, type, ko, utils, _, resourcetypes) {
    'use strict';

    /**
     * Resource
     * A model of a resource - types are defined by @resourceTypes object
     * @returns {object} Resource
     */
    return function (id, name, type, startingAmount, maxStorage, collectionRate, isSpecialized) {

        var self = this;
        self.id = id;
        self.name = name;
        self.type = type;
        self.amount = ko.observable(startingAmount);
        self.maxStorage = ko.observable(maxStorage);
        self.collectionRate = ko.observable(0);
        self.isSpecialized = ko.observable(isSpecialized);
        // defines how much it increments per second
        if (!_.isUndefined(collectionRate)) {
            self.collectionRate = ko.observable(collectionRate);
        }

        self.formattedAmount = ko.computed(function () {
            if (self.amount()) {
                return Globalize.format(self.amount(), 'n0');
            } else {
                return 0;
            }
        });

        self.formattedCollectionRate = ko.computed(function () {
            if (self.collectionRate()) {
                return Globalize.format(self.collectionRate(), 'n1');
            } else {
                return 0;
            }
        });

        self.addCollectedRate = function () {
            if (self.maxStorage() > self.amount()) {
                var newAmount = self.amount() + self.collectionRate();
                if (self.amount() >= 0) {

                    if (newAmount <= 0) {
                        self.amount(0)
                    } else if (newAmount > self.maxStorage()) {
                        self.amount(self.maxStorage());
                    } else {
                        self.amount(self.amount() + self.collectionRate());
                    }
                }
            } else {
                if (self.collectionRate() < 0) {
                    self.amount(self.amount() + self.collectionRate());
                }
            }
        };

        self.mineResource = function () {
            if (self.maxStorage() > self.amount()) {
                self.amount(self.amount() + 1);
            } else {
                utils.showAlertMessage("You've hit the maximum amount of " + self.name + " that you can store. (" + self.maxStorage() + "/" + self.maxStorage() + ")");
            }
        };

        self.workerMade = ko.observable(false).sub('workerMadeOrAssigned');

        self.workerMade.subscribe(function (person) {
            // on each new worker... reflect the food cost on the resources collectionRate
            // only apply if this resource type is food...
            if (self.type === resourcetypes.FOOD) {
                self.collectionRate(self.collectionRate() - (person.foodCost() * person.numAdded));
            }
        });


    };

});