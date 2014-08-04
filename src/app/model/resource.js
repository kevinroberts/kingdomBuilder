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
		// defines how much it increments per second
		if (_.isUndefined(collectionRate)) {
			self.collectionRate = 0;
		} else {
			self.collectionRate = collectionRate;
		}

		self.formattedAmount = ko.computed(function() {
			return _.str.numberFormat(self.amount(), 0);
		});

		self.styleIcon = ko.computed(function() {
			if (self.type === type.GOLD) {
				return 'glyphicon-usd';
			} else if (self.type === type.FOOD) {
				return 'glyphicon-leaf';
			} else if (self.type === type.WOOD) {
				return 'glyphicon-tree-conifer';
			} else {
				return '';
			}
		});

		self.addOne = function() {
			if (self.maxStorage() > self.amount()) {
				self.amount(self.amount()+1);
			} else {
				utils.showAlertMessage("You've hit the maximum of " + self.maxStorage() + " " + self.name + " that you can store.");
			}
		};

	};

});