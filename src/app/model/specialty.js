define("specialty", ["jquery", "knockout" ], function( $, ko ) {
	'use strict';

	/**
	 * person's specialty object
	 * A model of a person - contributes resources to a kingdom
	 * @returns {object} Person
	 */
	return function (id, name, type, quantity, collectType, description) {
		var self = this;
		self.id = id;
		self.name = name;
		self.type = type;
		self.quantity = ko.observable(quantity);
		self.collectType = collectType;
		self.description = description;
	};

});