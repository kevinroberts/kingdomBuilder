define(['jquery', 'underscore', 'knockout', 'utils', 'bootbox', 'bootstrap-editable', 'ruler', 'resource', 'resourcetypes',
	'specialty', 'persontypes', 'building', 'buildingtypes', 'dataStore', 'text!./kingdom.html', 'knockout-bootstrap', 'pubsub'],
	function ($, _, ko, utils, bootbox, editable, Ruler, Resource, resourcetypes, Specialty, persontypes, Building, buildingtypes, dataStore, templateMarkup) {

	var intervalId;
	var _startingMaxPopulation = 3;
	var _workerFoodCost = 20;

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
			self.maxPopulation(_startingMaxPopulation);
			_initPopulation(self);
			bootbox.prompt("Enter a name for your new kingdom: ", function(newName) {
				if (newName === null) {
					utils.log("New name not entered in bootbox dialog");
				} else {
					utils.log("new kingdom - " + newName);
					if (_.isString(newName) && newName.length > 0) {
						self.name(newName);
						_initResources(self);
						_initBuildings(self);
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
			_initBuildings(self);
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
					newPopulationList.push(new Specialty(specialty.id, specialty.name, specialty.type, specialty.quantity, specialty.collectType, specialty.description));
				});
				self.population = newPopulationList;
			} else {
				_initInitialPopulation(self);
			}
		} else {
			_initInitialPopulation(self);
		}
	};

	var _initBuildings = function(self) {
		if (!_.isNull(dataStore.getItem("kingdom_data"))) {
			if (dataStore.getItem("kingdom_data").buildings.length > 0) {
				utils.log("populating buildings from data store");
				var initialBuildings = dataStore.getItem("kingdom_data").buildings;
				var newbuildings =  ko.observableArray([]);

				ko.utils.arrayMap(initialBuildings, function(building) {
					newbuildings.push(new Building(building.id, building.name, building.type, building.quantity, building.providedPopulation, building.description, building.cost));
				});
				self.buildings = newbuildings;
			} else {
				_initInitialBuildings(self);
			}
		} else {
			_initInitialBuildings(self);
		}
	}


	var _initInitialBuildings = function(self) {
		self.buildings.push(new Building(utils.guid(), "Hut", buildingtypes.HOUSING, 0, 1, "Basic hut, provides +1 population", "2 gold, 5 wood"));
	}

	var _initInitialPopulation = function(self) {
		self.population.push(new Specialty(utils.guid(), "Farmer", persontypes.FARMER, 0, resourcetypes.FOOD, "Automatically creates food."));
		self.population.push(new Specialty(utils.guid(), "Miner", persontypes.MINER, 0, resourcetypes.GOLD, "Automatically mines gold."));
		self.population.push(new Specialty(utils.guid(), "Worker", persontypes.WORKER, 0, resourcetypes.NONE, "Currently unemployed members of the population."));
	}

	var _initFreshResources = function(self) {
		// new game resources init
		self.resources.push(new Resource(utils.guid(), "Gold", resourcetypes.GOLD, 0, 300, 0));
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
		self.buildings = ko.observableArray([]);
		self.maxPopulation = ko.observable(0);

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

		self.workersAvailable = ko.computed(function() {
			var size = 0;
			ko.utils.arrayMap(self.population(), function(specialty) {
				if (specialty.type == persontypes.WORKER) {
					size += specialty.quantity();
				}
			});

			return size;
		});

		self.goldAvailable = ko.computed(function() {
			var gold = 0;
			ko.utils.arrayMap(self.resources(), function(resource) {
				if (resource.type == resourcetypes.GOLD) {
					gold = resource.amount();
				}
			});

			return gold;
		});

		self.foodAvailable = ko.computed(function() {
			var food = 0;
			ko.utils.arrayMap(self.resources(), function(resource) {
				if (resource.type == resourcetypes.FOOD) {
					food = resource.amount();
				}
			});

			return food;
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

		self.createWorker = function() {
			ko.utils.arrayMap(self.resources(), function(resource) {
				if (resource.type === resourcetypes.FOOD) {
					if (resource.amount() >= _workerFoodCost) {
						var hasWorker = false;
						ko.utils.arrayMap(self.population(), function(specialty) {
							if (specialty.type == persontypes.WORKER) {
								hasWorker = true;
								if (self.populationSize() < self.maxPopulation()) {
									resource.amount(resource.amount() - _workerFoodCost);
									specialty.quantity(specialty.quantity()+1);
								} else {
									utils.showAlertMessage("Cannot create new worker until you have more population room.");
								}
							}
						});
						if (!hasWorker) {
							if (self.populationSize() < self.maxPopulation()) {
								resource.amount(resource.amount() - _workerFoodCost);
								self.population.push(new Specialty(utils.guid(), "Worker", persontypes.WORKER, 1, resourcetypes.NONE, "Unemployed worker."));
							} else {
								utils.showAlertMessage("Cannot create new worker until you have more population room.");
							}
						}

					} else {
						utils.showAlertMessage("You do not have enough food to create a new worker.");
					}
				}
			});
		};

		self.removeSpecialty = function(specialty) {
			specialty.quantity(specialty.quantity() - 1);

			if (specialty.collectType === resourcetypes.GOLD) {
				ko.utils.arrayMap(self.resources(), function(resource) {
					if (resource.type === resourcetypes.GOLD) {
						if (resource.collectionRate() > 0)
							resource.collectionRate(resource.collectionRate() - .1);
					}
				});
			}

			// add one to the worker pool
			ko.utils.arrayMap(self.population(), function(specialty) {
				if (specialty.type === persontypes.WORKER) {
					if (self.populationSize() < self.maxPopulation()) {
						specialty.quantity(specialty.quantity()+1);
					}
				}
			});

		};

		self.addSpecialty = function(specialty) {
			// only add if there are workers available
			if (self.workersAvailable() > 0) {
				specialty.quantity(specialty.quantity() + 1);
				// add collection rate increase
				if (specialty.collectType === resourcetypes.GOLD) {
					ko.utils.arrayMap(self.resources(), function(resource) {
						if (resource.type === resourcetypes.GOLD) {
							resource.collectionRate(resource.collectionRate() + .1);
						}
					});
				}
			}
			// remove one from the worker pool
			ko.utils.arrayMap(self.population(), function(specialty) {
				if (specialty.type === persontypes.WORKER) {
					specialty.quantity(specialty.quantity()-1);
				}
			});
		};

		// set-up global game listeners
		self.renameKingdomListener = ko.observable(false).sub('kingdom.rename');
		self.renameKingdomListener.subscribe(function(data) {
			bootbox.prompt("Enter a new name for your kingdom: ", function(newName) {
				if (newName === null) {
					utils.log("New name not entered in bootbox dialog");
				} else {
					if (_.isString(newName) && newName.length > 0) {
						self.name(newName);
						// persist changes to local storage
						_persistChanges(self);
					} else {
						if ($('.modal-body .error').length == 0)
							$('.modal-body').addClass('bg-danger').prepend('<span class="error text-danger">The name you entered was not valid.</span>');
						return false;
					}
				}
			});
		});
		self.renameRulerListener = ko.observable(false).sub('ruler.rename');
		self.renameRulerListener.subscribe(function(data) {
			bootbox.prompt("Enter a new name for your ruler: ", function(newName) {
				if (newName === null) {
					utils.log("New ruler not entered in bootbox dialog");
				} else {
					if (_.isString(newName) && newName.length > 0) {
						var newRuler = new Ruler(utils.guid(), newName);
						self.ruler(newRuler);
						_persistChanges(self);
					} else {
						if ($('.modal-body .error').length == 0)
							$('.modal-body').addClass('bg-danger').prepend('<span class="error text-danger">The name you entered was not valid.</span>');
						return false;
					}
				}
			});
		});

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
			self.buildings.removeAll();
			_initGame(self);
		});


	}

	return { viewModel: Kingdom, template: templateMarkup };

});
