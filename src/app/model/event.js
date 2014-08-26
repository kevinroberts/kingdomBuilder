define("event", ["jquery", "knockout" ], function( $, ko ) {
	'use strict';

	/**
	 * Event object
	 * A model of a game event
	 * @returns {object} Event
	 */
	return function (id, message, timestamp, quantity) {
		var self = this;
		self.id = id;
		self.message = ko.observable(message);
		self.timestamp = timestamp;
		self.quantity = ko.observable(quantity);
	};

});