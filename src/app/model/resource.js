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
			// if the underscore.string library has loaded correctly - return a formatted amount
			if (!_.isUndefined(_.str)) {
				return _.str.numberFormat(self.amount(), 0);
			} else {
				return self.amount();
			}
		});

		self.formattedCollectionRate = ko.computed(function() {
			if (!_.isUndefined(_.str)) {
				return _.str.numberFormat(self.collectionRate(), 1);
			} else {
				return self.collectionRate();
			}
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
				utils.showAlertMessage("You've hit the maximum amount of " + self.name + " that you can store. (" + self.maxStorage() + "/" + self.maxStorage() + ")" );
			}
		};

	};

});