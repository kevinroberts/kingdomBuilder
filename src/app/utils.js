define("utils", ["jquery", "underscore", "growl"], function ($, _) {
	'use strict';


	function _showAlertMessage(message, title) {
		/*if (!_.isUndefined(title) && title) {
			$("#errorMessageTitle").html(title);
		}
		if ($('#errorMsg').is(':visible')) {
			$("#errorMessage").html(message);
		} else {
			$("#errorMessage").html(message);
			$('#errorMsg').slideDown().delay(5000).fadeOut();
		}*/
		if (_.isUndefined(title)) {
			$.growl.error({ message: message });
		} else {
			$.growl.error({title: title, message: message });
		}
	}

	function _showSuccessMessage(message, title) {
		/*if (!_.isUndefined(title) && title) {
			$("#successMessageTitle").html(title);
		}
		if ($('#successMsg').is(':visible')) {
			$("#successMessage").html(message);
		} else {
			$("#successMessage").html(message);
			$('#successMsg').slideDown().delay(5000).fadeOut();
		}*/
		$.growl({ title: title, message: message });

	}

	function _log(message, obj) {
		// only issue console logs in development environment - configured in the startup.js
		if (window['my']) {
			if (my.common.kingdom.isDevelopmentEnvironment && typeof console !== 'undefined') {
				if (obj && typeof(obj) !== "undefined") {
					console.log(message, obj);
				} else {
					console.log(message);
				}
			}
		}
	}


	return {

		/**
		 * guid
		 * Returns a GUID / UUID -
		 * 32 randomly unique characters that stay in the ASCII range.
		 * http://www.ietf.org/rfc/rfc4122.txt
		 * @returns {string}
		 */
		guid: function () {
			var s = [];
			var hexDigits = "0123456789abcdef";
			for (var i = 0; i < 36; i++) {
				s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
			}
			s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
			s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
			s[8] = s[13] = s[18] = s[23] = "-";

			var uuid = s.join("");
			return uuid;
		},
		log: function (message, obj) {
			return _log(message, obj);
		},
		/**
		 * Show a bootstrap style alert message above the UI with
		 * the specified message and optional title.
		 * @param message - body of the alert
		 * @param title of the message
		 * @returns {*}
		 */
		showAlertMessage: function (message, title) {
			return _showAlertMessage(message, title);
		},
		showSuccessMessage: function (message, title) {
			return _showSuccessMessage(message, title);
		},
		/**
		 * Calculates the summation of elements (n...m] of the arithmetic sequence with increment "incr".
		 * @param incr
		 * @param n
		 * @param m
		 * @returns {number}
		 */
		calcArithSum: function (incr, n, m) {
			// Default to just element n+1, if m isn't given.
			if (m === undefined) { m = n + 1; }
			return (m-n)*((n*incr)+((m-1)*incr))/2;
		}
	};

});