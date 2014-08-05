define("resource", ["jquery", 'resourcetypes', 'knockout', 'utils', 'underscore', 'underscore.string',  ], function( $, type, ko, utils, _ ) {
	'use strict';

	/**
	 * Resource
	 * A model of a resource - types are defined by @resourceTypes object
	 * @returns {object} Ruler
	 */
	return function (id, name, type, startingAmount, maxStorage, collectionRate) {

		var self = this;
		self.id = id;
		self.name = name;
		self.type = type;
		self.amount = ko.observable(startingAmount);
		self.maxStorage = ko.observable(maxStorage);
		self.collectionRate = ko.observable(0);
		// defines how much it increments per second
		if (!_.isUndefined(collectionRate)) {
			self.collectionRate = ko.observable(collectionRate);
		}

		self.formattedAmount = ko.computed(function() {
			return _.str.numberFormat(self.amount(), 0);
		});

		self.formattedCollectionRate = ko.computed(function() {
			return _.str.numberFormat(self.collectionRate(), 1);
		});

		self.addCollectedRate = function() {
			if (self.maxStorage() > self.amount()) {
				self.amount(self.amount()+self.collectionRate());
			}
		};

		self.addOne = function() {
			if (self.maxStorage() > self.amount()) {
				self.amount(self.amount()+1);
			} else {
				utils.showAlertMessage("You've hit the maximum of " + self.maxStorage() + " " + self.name + " that you can store.");
			}
		};

	};

});