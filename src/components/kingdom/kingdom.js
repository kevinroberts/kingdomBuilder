define(['jquery', 'underscore', 'knockout', 'utils', 'bootbox', 'bootstrap-editable', 'ruler', 'resource', 'resourcetypes', 'dataStore', 'text!./kingdom.html', 'knockout-bootstrap', 'pubsub'], function ($, _, ko, utils, bootbox, editable, Ruler, Resource, type, dataStore, templateMarkup) {

	var _persistChanges = function(self) {
		self.lastUpdated = new Date();
		dataStore.setItem("kingdom_data", self);
	};

	var _initGame = function(self) {
		if (_.isNull(dataStore.getItem("kingdom_data"))) {
			bootbox.prompt("Enter a name for your new kingdom: ", function(newName) {
				if (newName === null) {
					utils.log("New name not entered in bootbox dialog");
				} else {
					utils.log("new kingdom - " + newName);
					if (_.isString(newName) && newName.length > 0) {
						self.name(newName);
						// persist changes to local storage
						_persistChanges(self);
						_initResources(self);
						_initRuler(self);
					} else {
						if ($('.modal-body .error').length == 0)
							$('.modal-body').addClass('bg-danger').prepend('<span class="error text-danger">The name you entered was not valid. A Kingdom name is required.</span>');
						return false;
					}
				}
			});
		} else {
			self.name(dataStore.getItem("kingdom_data").name);
			if (dataStore.getItem("kingdom_data").ruler.name.length > 0) {
				self.ruler(dataStore.getItem("kingdom_data").ruler);
			} else {
				_initRuler(self);
			}
			_initResources(self);
		}
	};

	var _initRuler = function(self) {
		if (!_.isNull(dataStore.getItem("kingdom_data"))) {
			if (dataStore.getItem("kingdom_data").ruler.name.length == 0) {
				bootbox.prompt("Enter your name as the kingdom's ruler: ", function(newName) {
					if (newName === null) {
						utils.log("New name not entered in bootbox dialog");
					} else {
						utils.log("new ruler - " + newName);
						if (_.isString(newName) && newName.length > 0) {
							var newRuler = new Ruler(utils.guid(), newName);

							self.ruler(newRuler);

							// persist changes to local storage
							_persistChanges(self);
						} else {
							if ($('.modal-body .error').length == 0)
								$('.modal-body').addClass('bg-danger').prepend('<span class="error text-danger">The name you entered was not valid. A ruler\'s name is required.</span>');
							utils.showAlertMessage("The name you entered was not valid");
							return false;
						}
					}
				});
			}
		} else {
			self.ruler(dataStore.getItem("kingdom_data").ruler);
		}
	};

	var _initResources = function(self) {
		if (!_.isNull(dataStore.getItem("kingdom_data"))) {
			if (dataStore.getItem("kingdom_data").resources.length > 0) {
				utils.log("populating resources from data store");
				var initialResources = dataStore.getItem("kingdom_data").resources;
				var newResourceList =  ko.observableArray([]);

				ko.utils.arrayMap(initialResources, function(resource) {
					newResourceList.push(new Resource(resource.id, resource.name, resource.type, resource.amount, resource.maxStorage));
				});
				self.resources = newResourceList;
				return;
			}
		}
		// new game resources init
		var initialResources = ko.observableArray([
			new Resource(utils.guid(), "Gold", type.GOLD, 0, 2000),
			new Resource(utils.guid(), "Food", type.FOOD, 0, 150),
			new Resource(utils.guid(), "Wood", type.WOOD, 0, 200)
		]);
		self.resources(initialResources);
		_persistChanges(self);

	};


	function Kingdom(params) {
		var self = this;

		self.name = ko.observable('ChangeMe');
		self.ruler = ko.observable(new Ruler(utils.guid(), ''));
		self.lastSaved = new Date();
		self.resources = ko.observableArray([]);
		// initialize a new game from dataStore
		_initGame(self);

		self.mineGold = function() {
			ko.utils.arrayMap(self.resources(), function(resource) {
				if (resource.type === type.GOLD) {
					resource.addOne();
					utils.log("mining gold", resource);
				}
			});
		};
		self.gatherFood = function() {
			ko.utils.arrayMap(self.resources(), function(resource) {
				if (resource.type === type.FOOD) {
					resource.addOne();
				}
			});
		};
		self.harvestWood = function() {
			ko.utils.arrayMap(self.resources(), function(resource) {
				if (resource.type === type.WOOD) {
					resource.addOne();
					utils.log("gathered wood", resource);
				}
			});
		};


		self.gameSaveListener = ko.observable(false).sub('gamesave');
		self.gameSaveListener.subscribe(function(data) {
			utils.log("game has been saved.", data);
			_persistChanges(self);
		});

	}

	return { viewModel: Kingdom, template: templateMarkup };

});
