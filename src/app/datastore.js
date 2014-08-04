define("dataStore",["knockout"], function (ko) {
	'use strict';

	function hasLocalStore() {
		try {
			return 'localStorage' in window && window['localStorage'] !== null;
		} catch (e) {
			return false;
		}
	}
	;

	function hasSessionStore() {
		try {
			return 'sessionStorage' in window && window['sessionStorage'] !== null;
		} catch (e) {
			return false;
		}
	}
	;

	function setData(key, value, persist) {
		if (persist) {
			if (hasLocalStore()) {
				try {
					localStorage.setItem(key, ko.toJSON(value));
				} catch (error) {
					if (error.name && error.name === "QuotaExceededError") {
						quotaExceeded(localStorage);
					} else {
						throw error;
					}
				}
				return true;
			} else {
				return false;
			}
		} else {
			if (hasSessionStore()) {
				try {
					sessionStorage.setItem(key, ko.toJSON(value));
				} catch (error) {
					if (error.name && error.name === "QuotaExceededError") {
						quotaExceeded(sessionStorage);
					} else {
						throw error;
					}
				}
				return true;
			} else {
				return false;
			}
		}
	}
	;

	function quotaExceeded(store) {
		if (store.length > 0) {
			clearNamespace("DA"); //This will do for now, but we should add registration of modules that use storage and make callback to clear their use.
		}
	}

	function getData(key) {
		if (hasSessionStore() && sessionStorage.getItem(key)) {
			return  JSON.parse(sessionStorage.getItem(key));
		} else if (hasLocalStore() && localStorage.getItem(key)) {
			return  JSON.parse(localStorage.getItem(key));
		} else {
			return null;
		}
	}
	;

	function removeData(key) {
		if (hasSessionStore()) {
			sessionStorage.removeItem(key);
		}
		if (hasLocalStore()) {
			localStorage.removeItem(key);
		}
		return true;
	}
	;

	function clearNamespace(namespace) {
		var count = 0;
		var index = 0;
		if (hasSessionStore()) {
			var length = sessionStorage.length;
			for (var i = 0; i < length; i++) {
				var key = sessionStorage.key(index);
				if (key && key.indexOf(namespace) >= 0) {
					sessionStorage.removeItem(key);
					count += 1;
				} else {
					index++;
				}
			}
		}
		if (hasLocalStore()) {
			var length = localStorage.length;
			for (var i = 0; i < length; i++) {
				var key = localStorage.key(i);
				if (key && key.indexOf(namespace) >= 0) {
					localStorage.removeItem(key);
					count += 1;
				}
			}
		}
		return count;
	}

	function clearAll(persisted) {
		if (!persisted) {
			sessionStorage.clear();
			localStorage.clear();
		} else {
			localStorage.clear();
		}
		return true;
	}

	return {
		getItem: function(key) {
			return getData(key) === undefined ? null : getData(key);
		},
		setItem: function(key, value) {
			// default to using local storage
			return setData(key, value, true);
		},
		removeItem: function(key) {
			return removeData(key);
		},
		removeNamespace: function(namespace) {
			return clearNamespace(namespace);
		},
		removeAll: function(persisted) {
			return clearAll(persisted);
		}
	};
});
