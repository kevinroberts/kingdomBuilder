define(['jquery', 'underscore', 'knockout', 'utils', 'bootbox', 'bootstrap-editable', 'ruler', 'resource', 'resourcetypes', 'specialty', 'persontypes', 'dataStore', 'text!./kingdom.html', 'knockout-bootstrap', 'pubsub'], function ($, _, ko, utils, bootbox, editable, Ruler, Resource, resourcetypes, Specialty, persontypes, dataStore, templateMarkup) {

	var intervalId;

	var _persistChanges = function(self) {
		self.lastSaved = new Date();
		dataStore.setItem("kingdom_data", self);
	};

	var _gameLoop = function(self) {
			ko.utils.arrayMap(self.resources(), function(resource) {
				resource.addCollectedRate();
			});
	};

	var _initGame = function(self) {
		if (_.isNull(dataStore.getItem("kingdom_data"))) {
			self.maxPopulation(5);
			_initPopulation(self);
			bootbox.prompt("Enter a name for your new kingdom: ", function(newName) {
				if (newName === null) {
					utils.log("New name not entered in bootbox dialog");
				} else {
					utils.log("new kingdom - " + newName);
					if (_.isString(newName) && newName.length > 0) {
						self.name(newName);
						_initResources(self);
						_initRuler(self);
						// persist changes to local storage
						_persistChanges(self);
						intervalId = setInterval(function() { _gameLoop(self) }, 1000);
					} else {
						if ($('.modal-body .error').length == 0)
							$('.modal-body').addClass('bg-danger').prepend('<span class="error text-danger">The name you entered was not valid. A Kingdom name is required.</span>');
						return false;
					}
				}
			});
		} else {
			// retrieve all the data from storage and populate local observables
			//	TODO: update here when new properties are added to Kingdom
			self.name(dataStore.getItem("kingdom_data").name);
			self.maxPopulation(dataStore.getItem("kingdom_data").maxPopulation);
			_initPopulation(self);
			_initRuler(self);
			_initResources(self);
			// persist all changes to local storage
			_persistChanges(self);
			intervalId = setInterval(function() { _gameLoop(self) }, 1000);
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
							_persistChanges(self);
						} else {
							if ($('.modal-body .error').length == 0)
								$('.modal-body').addClass('bg-danger').prepend('<span class="error text-danger">The name you entered was not valid. A ruler\'s name is required.</span>');
							utils.showAlertMessage("The name you entered was not valid");
							return false;
						}
					}
				});
			} else {
				self.ruler(dataStore.getItem("kingdom_data").ruler);
			}
		} else {
			// kingdom data is null / create new save and try again
			_persistChanges(self);
			_initRuler(self);
		}
	};

	var _initResources = function(self) {
		if (!_.isNull(dataStore.getItem("kingdom_data"))) {
			if (dataStore.getItem("kingdom_data").resources.length > 0) {
				utils.log("populating resources from data store");
				var initialResources = dataStore.getItem("kingdom_data").resources;
				var newResourceList =  ko.observableArray([]);

				ko.utils.arrayMap(initialResources, function(resource) {
					newResourceList.push(new Resource(resource.id, resource.name, resource.type, resource.amount, resource.maxStorage, resource.collectionRate));
				});
				self.resources = newResourceList;
			} else {
				_initFreshResources(self);
			}
		} else {
			_initFreshResources(self);
		}
	};

	var _initPopulation = function(self) {
		if (!_.isNull(dataStore.getItem("kingdom_data"))) {
			if (dataStore.getItem("kingdom_data").population.length > 0) {
				utils.log("populating population from data store");
				var initialPopulation = dataStore.getItem("kingdom_data").population;
				var newPopulationList =  ko.observableArray([]);

				ko.utils.arrayMap(initialPopulation, function(specialty) {
					newPopulationList.push(new Specialty(specialty.id, specialty.name, specialty.type, specialty.quantity, specialty.collectType));
				});
				self.population = newPopulationList;
			} else {
				// start the game with one miner (shows mining at .1 gold per second)
				self.population.push(new Specialty(utils.guid(), "Miner", persontypes.MINER, 1, resourcetypes.GOLD));
			}
		} else {
			self.population.push(new Specialty(utils.guid(), "Miner", persontypes.MINER, 1, resourcetypes.GOLD));
		}
	}

	var _initFreshResources = function(self) {
		// new game resources init

		self.resources.push(new Resource(utils.guid(), "Gold", resourcetypes.GOLD, 0, 2000, .1));
		self.resources.push(new Resource(utils.guid(), "Food", resourcetypes.FOOD, 0, 150));
		self.resources.push(new Resource(utils.guid(), "Wood", resourcetypes.WOOD, 0, 200));

	};


	function Kingdom(params) {
		var self = this;

		self.name = ko.observable('ChangeMe');
		self.ruler = ko.observable(new Ruler(utils.guid(), ''));
		self.lastSaved = new Date();
		self.resources = ko.observableArray([]);
		self.population = ko.observableArray([]);
		self.maxPopulation = ko.observableArray(0);

		// initialize a new game from dataStore
		_initGame(self);

		self.populationSize = ko.computed(function() {
			var size = 0;
			ko.utils.arrayMap(self.population(), function(specialty) {
				if (specialty.quantity()) {
					size += specialty.quantity();
				}
			});

			return size;
		});

		self.mineGold = function() {
			ko.utils.arrayMap(self.resources(), function(resource) {
				if (resource.type === resourcetypes.GOLD) {
					resource.addOne();
				}
			});
		};

		self.gatherFood = function() {
			ko.utils.arrayMap(self.resources(), function(resource) {
				if (resource.type === resourcetypes.FOOD) {
					resource.addOne();
				}
			});
		};

		self.harvestWood = function() {
			ko.utils.arrayMap(self.resources(), function(resource) {
				if (resource.type === resourcetypes.WOOD) {
					resource.addOne();
				}
			});
		};


		self.gameSaveListener = ko.observable(false).sub('gamesave');
		self.gameSaveListener.subscribe(function(data) {
			_persistChanges(self);
		});

		self.createNewGame = ko.observable(false).sub('gamenew');
		self.createNewGame.subscribe(function(data) {
			dataStore.removeAll();
			// reset existing observable resources
			self.ruler(new Ruler(utils.guid(), ''));
			self.resources.removeAll();
			self.population.removeAll();
			_initGame(self);
		});


	}

	return { viewModel: Kingdom, template: templateMarkup };

});
