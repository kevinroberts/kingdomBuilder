define("building", ["jquery", "knockout" ], function( $, ko ) {
	'use strict';

	/**
	 * Building object
	 * A model of a building
	 * @returns {object} Ruler
	 */
	return function (id, name, type, quantity, providedPopulation, description, cost) {
		var self = this;
		self.id = id;
		self.name = name;
		self.type = type;
		self.quantity = ko.observable(quantity);
		self.providedPopulation = ko.observable(providedPopulation);
		self.description = description;
		self.cost = cost;

	};

});