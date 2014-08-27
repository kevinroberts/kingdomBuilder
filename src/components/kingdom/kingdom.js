define(['jquery', 'underscore', 'knockout', 'utils', 'bootbox', 'bootstrap-editable', 'ruler', 'resource', 'resourcetypes',
    'specialty', 'event', 'persontypes', 'building', 'upgrade', 'upgradetypes', 'buildingtypes', 'dataStore', 'chance', 'mousetrap', 'text!./kingdom.html', 'knockout-bootstrap', 'globalize', 'pubsub'],
    function ($, _, ko, utils, bootbox, editable, Ruler, Resource, resourcetypes, Specialty, Event, persontypes, Building, Upgrade, upgradetypes, buildingtypes, dataStore, Chance, Mousetrap, templateMarkup) {
        'use strict';

        var chance = new Chance(),
            _intervalId,
            _startingMaxPopulation = 3,
            _startingLand = 1000,
            _autoSaveTrigger = 0,
            _foodCostPerPerson = 1;

        var _persistChanges = function (self) {
            self.lastSaved = new Date();
            dataStore.setItem("kingdom_data", self);
        };

        var _initFreshUpgrades = function (self) {
            self.upgrades.push(new Upgrade(utils.guid(), "Iron plow", upgradetypes.FARMING, false, 1.1, "Improved farming efficiency", "20 gold, 40 iron, 20 wood", 20, 20, 0, 40, true));
            self.upgrades.push(new Upgrade(utils.guid(), "Trading Post", upgradetypes.TRADING, false, 0, "Unlock trading gold for resources", "100 gold, 20 wood", 100, 20, 0, 0, true));
        };

        var _initInitialBuildings = function (self) {
            self.buildings.push(new Building(utils.guid(), "Wood Hut", buildingtypes.HOUSING, 1, 0, 1, "Basic hut, provides +1 population", "2 gold, 5 wood", 2, 5, 0, 0, true));
            self.buildings.push(new Building(utils.guid(), "Cottage", buildingtypes.HOUSING, 1, 0, 3, "Cottage provides +3 population", "10 gold, 5 wood, 30 stone", 10, 5, 30, 0, true));
            self.buildings.push(new Building(utils.guid(), "House", buildingtypes.HOUSING, 2, 0, 5, "provides +5 population", "25 gold, 50 stone, 50 wood", 25, 50, 50, 0, true));
            self.buildings.push(new Building(utils.guid(), "Mansion", buildingtypes.HOUSING, 4, 0, 20, "provides +20 population", "50 gold, 300 stone, 300 wood", 50, 300, 300, 0, false));
            self.buildings.push(new Building(utils.guid(), "Castle", buildingtypes.HOUSING, 10, 0, 100, "provides +100 population", "500 gold, 500 stone, 300 wood", 500, 300, 500, 0, false));
            self.buildings.push(new Building(utils.guid(), "Grain Silo", buildingtypes.STORAGE, 1, 0, 200, "provides +200 food storage", "10 gold, 100 wood", 10, 100, 0, 0, true));
            self.buildings.push(new Building(utils.guid(), "Wood Shed", buildingtypes.STORAGE, 1, 0, 200, "provides +200 wood storage", "10 gold, 100 wood", 10, 100, 0, 0, true));
            self.buildings.push(new Building(utils.guid(), "Stone pile", buildingtypes.STORAGE, 1, 0, 200, "provides +200 stone storage", "10 gold, 100 wood", 10, 100, 0, 0, true));
        };

        var _initInitialPopulation = function (self) {
            self.population.push(new Specialty(utils.guid(), "Farmer", persontypes.FARMER, 0, resourcetypes.FOOD, "Automatically creates food.", _foodCostPerPerson));
            self.population.push(new Specialty(utils.guid(), "Miner", persontypes.MINER, 0, resourcetypes.STONE, "Automatically mines ore.", _foodCostPerPerson));
            self.population.push(new Specialty(utils.guid(), "Woodcutter", persontypes.WOODCUTTER, 0, resourcetypes.WOOD, "Automatically collects wood.", _foodCostPerPerson));
            self.population.push(new Specialty(utils.guid(), "Worker", persontypes.WORKER, 0, resourcetypes.NONE, "Currently unemployed members of the population.", _foodCostPerPerson));
        };

        var _initFreshResources = function (self) {
            // new game resources init
            self.resources.push(new Resource(utils.guid(), "Gold", resourcetypes.GOLD, 0, 99999999, 0, true));
            self.resources.push(new Resource(utils.guid(), "Iron", resourcetypes.IRON, 0, 99999999, 0, true));
            self.resources.push(new Resource(utils.guid(), "Stone", resourcetypes.STONE, 0, 200, 0, false));
            self.resources.push(new Resource(utils.guid(), "Food", resourcetypes.FOOD, 0, 150, 0, false));
            self.resources.push(new Resource(utils.guid(), "Wood", resourcetypes.WOOD, 0, 200, 0, false));
        };

        var _initRuler = function (self) {
            if (!_.isNull(dataStore.getItem("kingdom_data"))) {
                if (dataStore.getItem("kingdom_data").ruler.name.length === 0) {
                    bootbox.prompt("Enter your name as the kingdom's ruler: ", function (newName) {
                        if (newName === null) {
                            utils.log("New name not entered in bootbox dialog");
                        } else {
                            utils.log("new ruler - " + newName);
                            if (_.isString(newName) && newName.length > 0) {
                                var newRuler = new Ruler(utils.guid(), newName);
                                self.ruler(newRuler);
                                _persistChanges(self);
                            } else {
                                if ($('.modal-body .error').length === 0) {
                                    $('.modal-body').addClass('bg-danger').prepend('<span class="error text-danger">The name you entered was not valid. A ruler\'s name is required.</span>');
                                }
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

        var _initResources = function (self) {
            if (!_.isNull(dataStore.getItem("kingdom_data"))) {
                if (dataStore.getItem("kingdom_data").resources.length > 0) {
                    utils.log("populating resources from data store");
                    var initialResources = dataStore.getItem("kingdom_data").resources;
                    var newResourceList = ko.observableArray([]);

                    ko.utils.arrayMap(initialResources, function (resource) {
                        newResourceList.push(new Resource(resource.id, resource.name, resource.type, resource.amount, resource.maxStorage, resource.collectionRate, resource.isSpecialized));
                    });
                    self.resources = newResourceList;
                } else {
                    _initFreshResources(self);
                }
            } else {
                _initFreshResources(self);
            }
        };

        var _initUpgrades = function (self) {
            if (!_.isNull(dataStore.getItem("kingdom_data"))) {
                if (dataStore.getItem("kingdom_data").upgrades.length > 0) {
                    utils.log("populating upgrades from data store");
                    var initialUpgrades = dataStore.getItem("kingdom_data").upgrades;
                    var newUpgradesList = ko.observableArray([]);

                    ko.utils.arrayMap(initialUpgrades, function (upgrade) {
                        newUpgradesList.push(new Upgrade(upgrade.id, upgrade.name, upgrade.type, upgrade.researched, upgrade.providedBonus, upgrade.description, upgrade.costDescription, upgrade.goldCost, upgrade.woodCost, upgrade.stoneCost, upgrade.ironCost, upgrade.visible));
                    });
                    self.upgrades = newUpgradesList;

                } else {
                    _initFreshUpgrades(self);
                }
            } else {
                _initFreshUpgrades(self);
            }
        };

        var _initEvents = function (self) {
            if (!_.isNull(dataStore.getItem("kingdom_data"))) {
                if (dataStore.getItem("kingdom_data").gameEvents.length > 0) {
                    var initialEvents = dataStore.getItem("kingdom_data").gameEvents;
                    var newGameEvents = ko.observableArray([]);

                    ko.utils.arrayMap(initialEvents, function (event) {
                        newGameEvents.push(new Event(event.id, event.message, event.timestamp, event.quantity));
                    });
                    self.gameEvents = newGameEvents;
                }
            }
        };

        var _initPopulation = function (self) {
            if (!_.isNull(dataStore.getItem("kingdom_data"))) {
                if (dataStore.getItem("kingdom_data").population.length > 0) {
                    utils.log("populating population from data store");
                    var initialPopulation = dataStore.getItem("kingdom_data").population;
                    var newPopulationList = ko.observableArray([]);

                    ko.utils.arrayMap(initialPopulation, function (specialty) {
                        newPopulationList.push(new Specialty(specialty.id, specialty.name, specialty.type, specialty.quantity, specialty.collectType, specialty.description, specialty.foodCost));
                    });
                    self.population = newPopulationList;
                } else {
                    _initInitialPopulation(self);
                }
            } else {
                _initInitialPopulation(self);
            }
        };

        var _initBuildings = function (self) {
            if (!_.isNull(dataStore.getItem("kingdom_data"))) {
                if (dataStore.getItem("kingdom_data").buildings.length > 0) {
                    utils.log("populating buildings from data store");
                    var initialBuildings = dataStore.getItem("kingdom_data").buildings;
                    var newBuildings = ko.observableArray([]);

                    ko.utils.arrayMap(initialBuildings, function (building) {
                        newBuildings.push(new Building(building.id, building.name, building.type, building.landCost, building.quantity, building.providedBonus, building.description, building.costDescription, building.goldCost, building.woodCost, building.stoneCost, building.ironCost, building.visible));
                    });
                    self.buildings = newBuildings;
                } else {
                    _initInitialBuildings(self);
                }
            } else {
                _initInitialBuildings(self);
            }
        };

        var _processHousingUpgrades = function (self) {
            if (self.maxPopulation() > 30 && self.maxPopulation() < 40) {
                ko.utils.arrayMap(self.buildings(), function (existing) {
                    if (existing.name === 'Mansion') {
                        existing.visible(true);
                    }
                    if (existing.name === 'Wood Hut') {
                        existing.visible(false);
                    }
                });
            } else if (self.maxPopulation() > 100 && self.maxPopulation() < 150) {
                ko.utils.arrayMap(self.buildings(), function (existing) {
                    if (existing.name === 'Castle') {
                        existing.visible(true);
                    }
                });
            }
        };

        var _initGame = function (self) {
            if (_.isNull(dataStore.getItem("kingdom_data"))) {
                self.maxPopulation(_startingMaxPopulation);
                self.totalLand(_startingLand);
                self.landUsed(0);
                _initPopulation(self);
                bootbox.prompt("Enter a name for your new kingdom: ", function (newName) {
                    if (newName === null) {
                        utils.log("New name not entered in bootbox dialog");
                    } else {
                        utils.log("new kingdom - " + newName);
                        if (_.isString(newName) && newName.length > 0) {
                            self.name(newName);
                            _initResources(self);
                            _initBuildings(self);
                            _initRuler(self);
                            _initUpgrades(self);
                            // persist changes to local storage
                            _persistChanges(self);
                            setTimeout(function () {
                                self.initialized(true);
                            }, 2000);

                        } else {
                            if ($('.modal-body .error').length === 0) {
                                $('.modal-body').addClass('bg-danger').prepend('<span class="error text-danger">The name you entered was not valid. A Kingdom name is required.</span>');
                            }
                            return false;
                        }
                    }
                });
            } else {
                // retrieve all the data from storage and populate local observables
                // TODO: update here when new properties are added to the Kingdom view model
                self.name(dataStore.getItem("kingdom_data").name);
                self.maxPopulation(dataStore.getItem("kingdom_data").maxPopulation);
                self.totalLand(dataStore.getItem("kingdom_data").totalLand);
                self.autosaveEnabled(dataStore.getItem("kingdom_data").autosaveEnabled);
                self.landUsed(dataStore.getItem("kingdom_data").landUsed);
                self.goldShortage(dataStore.getItem("kingdom_data").goldShortage);
                self.goldCollectRateBeforeShortage = dataStore.getItem("kingdom_data").goldCollectRateBeforeShortage;
                _initEvents(self);
                _initPopulation(self);
                _initRuler(self);
                _initResources(self);
                _initUpgrades(self);
                _initBuildings(self);
                // persist all changes to local storage

                setTimeout(function () {
                    self.initialized(true);
                }, 2000);
            }
        };

        function Kingdom(params) {
            var self = this;

            self.name = ko.observable('ChangeMe');
            self.ruler = ko.observable(new Ruler(utils.guid(), ''));
            self.lastSaved = new Date();
            self.resources = ko.observableArray([]);
            self.population = ko.observableArray([]);
            self.buildings = ko.observableArray([]);
            self.gameEvents = ko.observableArray([]);
            self.upgrades = ko.observableArray([]);
            self.maxPopulation = ko.observable(0);
            self.landUsed = ko.observable(0);
            self.totalLand = ko.observable(0);
            self.initialized = ko.observable(false);
            self.autosaveEnabled = ko.observable(true);
            self.workerMadeOrAssigned = ko.observable().publish('workerMadeOrAssigned');
            self.goldShortage = ko.observable(false);
            self.goldCollectRateBeforeShortage = 0;

            // initialize a new game from dataStore
            _initGame(self);

            self.initialized.subscribe(function (isInit) {
                if (isInit) {
                    utils.log("Game initialized...");
                    _intervalId = setInterval(function () {
                        self.gameLoop();
                    }, 1000);
                } else {
                    if (_intervalId) {
                        clearInterval(_intervalId);
                    }
                }
            });

            // Main game loop :: this whole function is run every second to process main game logic
            self.gameLoop = function () {

                ko.utils.arrayMap(self.resources(), function (resource) {
                    // implement gold shortages after first 10,000 gold mined
                    if (resource.type === resourcetypes.GOLD && resource.amount() >= 10000) {
                        if (self.goldShortage() === false) {
                            self.goldCollectRateBeforeShortage = resource.collectionRate();
                        }
                        self.goldShortage(true);
                        resource.collectionRate(0.1);
                    } else if (resource.type === resourcetypes.GOLD && resource.amount() < 10000) {
                        if (self.goldCollectRateBeforeShortage > resource.collectionRate()) {
                            resource.collectionRate(self.goldCollectRateBeforeShortage);
                            self.goldCollectRateBeforeShortage = 0;
                            self.goldShortage(false);
                        }
                    }
                    resource.addCollectedRate();
                    if (resource.type === resourcetypes.FOOD && resource.amount() <= 0) {
                        self.starvationEvent();
                    }

                });
                _autoSaveTrigger++;
                // trigger auto save every 10 seconds unless disabled
                if (_autoSaveTrigger % 10 === 0 && self.autosaveEnabled()) {
                    _persistChanges(self);
                    self.logGameEvent("Auto saved.");
                }

            };

            self.toggleAutosaveEnable = function () {
                var rType = true;
                if (self.autosaveEnabled()) {
                    utils.log("stopping auto save");
                    self.autosaveEnabled(false);
                } else {
                    utils.log("starting auto save ");
                    self.autosaveEnabled(true);
                }
                return rType;
            };

            self.logGameEvent = function (msg) {
                // only maintain at most 5 events
                if (self.gameEvents().length > 5) {
                    self.gameEvents.pop();
                }

                var time = "0.00";
                //get the current date, extract the current time in HH.MM format
                var d = new Date();
                if (d.getMinutes() < 10) {
                    time = d.getHours() + ".0" + d.getMinutes();
                } else {
                    time = d.getHours() + "." + d.getMinutes();
                }

                var insert = true;
                var first = true;
                _.each(self.gameEvents(), function (event) {
                    if (first) {
                        if (msg === event.message()) {
                            event.quantity(event.quantity() + 1);
                            insert = false;
                        }
                        first = false;
                    }
                });

                if (insert) {
                    self.gameEvents.unshift(new Event(utils.guid(), msg, time, 1));
                }

            };

            self.populationSize = ko.computed(function () {
                var size = 0;
                ko.utils.arrayMap(self.population(), function (specialty) {
                    if (specialty.quantity()) {
                        size += specialty.quantity();
                    }
                });
                return size;
            });

            self.availableLand = ko.computed(function () {
                return self.totalLand() - self.landUsed();
            });

            self.calculateWorkerCost = function (num, curPop) {
                return (20 * num) + utils.calcArithSum(0.01, curPop, curPop + num);
            };

            self.calculateWorkerCostPretty = function (num, curPop) {
                return Globalize.format((20 * num) + utils.calcArithSum(0.01, curPop, curPop + num), 'n0');
            };

            self.isTradingEnabled = ko.computed(function () {
                var isEnabled = false;
                ko.utils.arrayMap(self.upgrades(), function (upgrade) {
                    if (upgrade.type === upgradetypes.TRADING && upgrade.researched()) {
                        isEnabled = true;
                    }
                });
                return isEnabled;
            });

            self.workersAvailable = ko.computed(function () {
                var size = 0;
                ko.utils.arrayMap(self.population(), function (specialty) {
                    if (specialty.type === persontypes.WORKER) {
                        size += specialty.quantity();
                    }
                });
                return size;
            });

            self.goldAvailable = ko.computed(function () {
                var gold = 0;
                ko.utils.arrayMap(self.resources(), function (resource) {
                    if (resource.type === resourcetypes.GOLD) {
                        gold = resource.amount();
                    }
                });
                return gold;
            });

            self.ironAvailable = ko.computed(function () {
                var iron = 0;
                ko.utils.arrayMap(self.resources(), function (resource) {
                    if (resource.type === resourcetypes.IRON) {
                        iron = resource.amount();
                    }
                });
                return iron;
            });

            self.stoneAvailable = ko.computed(function () {
                var stone = 0;
                ko.utils.arrayMap(self.resources(), function (resource) {
                    if (resource.type === resourcetypes.STONE) {
                        stone = resource.amount();
                    }
                });
                return stone;
            });

            self.woodAvailable = ko.computed(function () {
                var wood = 0;
                ko.utils.arrayMap(self.resources(), function (resource) {
                    if (resource.type === resourcetypes.WOOD) {
                        wood = resource.amount();
                    }
                });
                return wood;
            });

            self.foodAvailable = ko.computed(function () {
                var food = 0;
                ko.utils.arrayMap(self.resources(), function (resource) {
                    if (resource.type === resourcetypes.FOOD) {
                        food = resource.amount();
                    }
                });
                return food;
            });

            self.mineOre = function () {
                var goldChance = chance.bool({likelihood: 30});
                var ironChance = chance.bool({likelihood: 40});
                ko.utils.arrayMap(self.resources(), function (resource) {
                    if (resource.type === resourcetypes.STONE) {
                        resource.mineResource();
                    }
                    if (resource.type === resourcetypes.GOLD && goldChance) {
                        resource.mineResource();
                    }
                    if (resource.type === resourcetypes.IRON && ironChance) {
                        resource.mineResource();
                    }
                });
            };

            self.gatherFood = function () {
                ko.utils.arrayMap(self.resources(), function (resource) {
                    if (resource.type === resourcetypes.FOOD) {
                        resource.mineResource();
                    }
                });
            };

            self.harvestWood = function () {
                ko.utils.arrayMap(self.resources(), function (resource) {
                    if (resource.type === resourcetypes.WOOD) {
                        resource.mineResource();
                    }
                });
            };

            var _createWorkers = function (num) {
                ko.utils.arrayMap(self.resources(), function (resource) {
                    if (resource.type === resourcetypes.FOOD) {
                        var cost = self.calculateWorkerCost(num, self.populationSize());
                        if (resource.amount() >= cost) {
                            ko.utils.arrayMap(self.population(), function (specialty) {
                                if (specialty.type === persontypes.WORKER) {
                                    if ((self.populationSize() + num) <= self.maxPopulation()) {
                                        resource.amount(resource.amount() - cost);
                                        specialty.quantity(specialty.quantity() + num);
                                        specialty.numAdded = num;
                                        self.workerMadeOrAssigned(specialty);
                                    } else {
                                        utils.showAlertMessage("Cannot create new workers until you have more population room.");
                                    }

                                }
                            });

                        } else {
                            utils.showAlertMessage("You do not have enough food to create new workers.");
                        }
                    }
                });
            };

            self.createWorker = function () {
                _createWorkers(1);
            };

            self.createTenWorkers = function () {
                _createWorkers(10);
            };

            self.createHundredWorkers = function () {
                _createWorkers(100);
            };

            self.createThousandWorkers = function () {
                _createWorkers(1000);
            };

            var _buildBuildings = function (num, building) {
                var landCost = building.landCost * num;

                if (self.availableLand() >= landCost) {
                    building.quantity(building.quantity() + num);
                    var providedBonus = building.providedBonus() * num;

                    // if this is a housing type then increase the max population
                    if (building.type === buildingtypes.HOUSING) {
                        self.maxPopulation(self.maxPopulation() + providedBonus);
                    } else if (building.type === buildingtypes.STORAGE) {
                        // else if this is storage increase the relevant resource max
                        if (building.description.indexOf("food storage") > -1) {
                            ko.utils.arrayMap(self.resources(), function (resource) {
                                if (resource.type === resourcetypes.FOOD) {
                                    resource.maxStorage(resource.maxStorage() + providedBonus);
                                }
                            });
                        } else if (building.description.indexOf("wood storage") > -1) {
                            ko.utils.arrayMap(self.resources(), function (resource) {
                                if (resource.type === resourcetypes.WOOD) {
                                    resource.maxStorage(resource.maxStorage() + providedBonus);
                                }
                            });
                        } else if (building.description.indexOf("stone storage") > -1) {
                            ko.utils.arrayMap(self.resources(), function (resource) {
                                if (resource.type === resourcetypes.STONE) {
                                    resource.maxStorage(resource.maxStorage() + providedBonus);
                                }
                            });
                        }
                    }

                    _processHousingUpgrades(self);

                    self.landUsed(self.landUsed() + landCost);
                    // subtract resource costs
                    ko.utils.arrayMap(self.resources(), function (resource) {
                        if (resource.type === resourcetypes.GOLD) {
                            resource.amount(resource.amount() - (building.goldCost() * num));
                        } else if (resource.type === resourcetypes.WOOD) {
                            resource.amount(resource.amount() - (building.woodCost() * num));
                        } else if (resource.type === resourcetypes.STONE) {
                            resource.amount(resource.amount() - (building.stoneCost() * num));
                        } else if (resource.type === resourcetypes.IRON) {
                            resource.amount(resource.amount() - (building.ironCost() * num));
                        }
                    });

                } else {
                    utils.showAlertMessage("You do not have enough free land to build this. It requires " + landCost + " free pieces of land.");
                }
            };

            self.buildOneBuilding = function (building) {
                _buildBuildings(1, building);
            };
            self.buildTenBuildings = function (building) {
                _buildBuildings(10, building);
            };
            self.buildHundredBuildings = function (building) {
                _buildBuildings(100, building);
            };

            var _removeSpecialties = function (num, specialty) {
                specialty.quantity(specialty.quantity() - num);

                if (specialty.type === persontypes.MINER) {
                    ko.utils.arrayMap(self.resources(), function (resource) {
                        if (resource.type === resourcetypes.STONE) {
                            resource.collectionRate(resource.collectionRate() - (0.2 * num));
                        }
                        if (resource.type === resourcetypes.GOLD) {
                            resource.collectionRate(resource.collectionRate() - (0.1 * num));
                        }
                    });
                } else if (specialty.type === persontypes.FARMER) {
                    var bonuses = 0;
                    ko.utils.arrayMap(self.upgrades(), function (upgrade) {
                        if (upgrade.type === upgradetypes.FARMING && upgrade.researched()) {
                            bonuses += upgrade.providedBonus();
                        }
                    });

                    ko.utils.arrayMap(self.resources(), function (resource) {
                        if (resource.type === resourcetypes.FOOD) {
                            resource.collectionRate(resource.collectionRate() - ((1.2 * num) + (bonuses * num)));
                        }
                    });
                } else if (specialty.type === persontypes.WOODCUTTER) {
                    ko.utils.arrayMap(self.resources(), function (resource) {
                        if (resource.type === resourcetypes.WOOD) {
                            resource.collectionRate(resource.collectionRate() - (0.5 * num));
                        }
                    });
                }

                // add removed back to the worker pool
                ko.utils.arrayMap(self.population(), function (specialty) {
                    if (specialty.type === persontypes.WORKER) {
                        if (self.populationSize() < self.maxPopulation()) {
                            specialty.quantity(specialty.quantity() + num);
                        }
                    }
                });
            };

            var _addSpecialties = function (num, specialty) {
                // only add if there are workers available
                if (self.workersAvailable() > 0) {
                    specialty.quantity(specialty.quantity() + num);
                    // add collection rate increase
                    if (specialty.type === persontypes.MINER) {
                        ko.utils.arrayMap(self.resources(), function (resource) {
                            if (resource.type === resourcetypes.STONE) {
                                resource.collectionRate(resource.collectionRate() + (0.2 * num));
                            }
                            if (resource.type === resourcetypes.GOLD) {
                                resource.collectionRate(resource.collectionRate() + (0.1 * num));
                            }
                        });
                    } else if (specialty.type === persontypes.FARMER) {
                        // add up farming bonuses
                        var bonuses = 0;
                        ko.utils.arrayMap(self.upgrades(), function (upgrade) {
                            if (upgrade.type === upgradetypes.FARMING && upgrade.researched()) {
                                bonuses += upgrade.providedBonus();
                            }
                        });

                        ko.utils.arrayMap(self.resources(), function (resource) {
                            if (resource.type === resourcetypes.FOOD) {
                                resource.collectionRate(resource.collectionRate() + ((1.2 * num) + (bonuses * num)));
                            }
                        });
                    } else if (specialty.type === persontypes.WOODCUTTER) {
                        ko.utils.arrayMap(self.resources(), function (resource) {
                            if (resource.type === resourcetypes.WOOD) {
                                resource.collectionRate(resource.collectionRate() + (0.5 * num));
                            }
                        });
                    }
                    // remove from the worker pool the number specified
                    ko.utils.arrayMap(self.population(), function (specialty) {
                        if (specialty.type === persontypes.WORKER) {
                            specialty.quantity(specialty.quantity() - num);
                        }
                    });
                }
            };

            self.removeSpecialty = function (specialty) {
                _removeSpecialties(1, specialty);
            };
            self.removeTenSpecialty = function (specialty) {
                _removeSpecialties(10, specialty);
            };
            self.removeHundredSpecialty = function (specialty) {
                _removeSpecialties(100, specialty);
            };
            self.removeAllSpecialty = function (specialty) {
                _removeSpecialties(specialty.quantity(), specialty);
            };

            self.addSpecialty = function (specialty) {
                _addSpecialties(1, specialty);
            };
            self.addTenSpecialty = function (specialty) {
                _addSpecialties(10, specialty);
            };
            self.addHundredSpecialty = function (specialty) {
                _addSpecialties(100, specialty);
            };
            self.addMaxSpecialty = function (specialty) {
                // add the max available workers to this specialty
                ko.utils.arrayMap(self.population(), function (person) {
                    if (person.type === persontypes.WORKER) {
                        _addSpecialties(person.quantity(), specialty);
                    }
                });
            };

            self.researchUpgrade = function (upgrade) {
                // toggle visibility
                upgrade.visible(false);
                upgrade.researched(true);
                // subtract resource costs
                ko.utils.arrayMap(self.resources(), function (resource) {
                    if (resource.type === resourcetypes.GOLD) {
                        resource.amount(resource.amount() - upgrade.goldCost());
                    } else if (resource.type === resourcetypes.WOOD) {
                        resource.amount(resource.amount() - upgrade.woodCost());
                    } else if (resource.type === resourcetypes.STONE) {
                        resource.amount(resource.amount() - upgrade.stoneCost());
                    } else if (resource.type === resourcetypes.IRON) {
                        resource.amount(resource.amount() - upgrade.ironCost());
                    }
                });

                // add upgrade bonus to applicable resource
                if (upgradetypes.FARMING === upgrade.type) {
                    ko.utils.arrayMap(self.resources(), function (resource) {
                        if (resourcetypes.FOOD === resource.type) {
                            resource.collectionRate(resource.collectionRate() + (self.populationSize() * upgrade.providedBonus()));
                        }
                    });
                }
            };

            self.starvationEvent = function () {
                var deathChance = chance.bool({likelihood: 50});
                var killOff = 1;
                if (self.workersAvailable() > 50) {
                    killOff = Math.floor(self.workersAvailable() / 10);
                }

                var numKilled = 0;
                ko.utils.arrayMap(self.population(), function (specialty) {

                    if (specialty.type === persontypes.WORKER && deathChance) {
                        if (specialty.quantity() >= killOff) {
                            specialty.quantity(specialty.quantity() - killOff);
                            if (killOff > 1) {
                                self.logGameEvent(killOff + " workers have starved to death.");
                            } else {
                                self.logGameEvent("A worker has starved to death.");
                            }
                            numKilled += killOff;
                        }
                    }

                });
                // for each death adjust the food collection rate
                ko.utils.arrayMap(self.resources(), function (resource) {
                    if (resourcetypes.FOOD === resource.type) {
                        resource.collectionRate(resource.collectionRate() + (_foodCostPerPerson * numKilled));
                    }
                });

            };

            // set-up global game listeners
            self.renameKingdomListener = ko.observable(false).sub('kingdom.rename');
            self.renameKingdomListener.subscribe(function (data) {
                bootbox.prompt("Enter a new name for your kingdom: ", function (newName) {
                    if (newName === null) {
                        utils.log("New name not entered in bootbox dialog");
                    } else {
                        if (_.isString(newName) && newName.length > 0) {
                            self.name(newName);
                            self.logGameEvent("Kingdom changed to " + newName + ".");
                            // persist changes to local storage
                            _persistChanges(self);
                        } else {
                            if ($('.modal-body .error').length === 0) {
                                $('.modal-body').addClass('bg-danger').prepend('<span class="error text-danger">The name you entered was not valid.</span>');
                            }
                            return false;
                        }
                    }
                });
            });
            self.renameRulerListener = ko.observable(false).sub('ruler.rename');
            self.renameRulerListener.subscribe(function (data) {
                bootbox.prompt("Enter a new name for your ruler: ", function (newName) {
                    if (newName === null) {
                        utils.log("New ruler not entered in bootbox dialog");
                    } else {
                        if (_.isString(newName) && newName.length > 0) {
                            var newRuler = new Ruler(utils.guid(), newName);
                            self.ruler(newRuler);
                            self.logGameEvent("Ruler changed to " + newName + ".");
                            _persistChanges(self);
                        } else {
                            if ($('.modal-body .error').length === 0) {
                                $('.modal-body').addClass('bg-danger').prepend('<span class="error text-danger">The name you entered was not valid.</span>');
                            }
                            return false;
                        }
                    }
                });
            });

            self.gameSaveListener = ko.observable(false).sub('gamesave');
            self.gameSaveListener.subscribe(function (data) {
                self.logGameEvent("Manual Save.");
                _persistChanges(self);
            });

            self.createNewGame = ko.observable(false).sub('gamenew');
            self.createNewGame.subscribe(function (data) {
                dataStore.removeAll();
                // reset existing observable resources
                self.ruler(new Ruler(utils.guid(), ''));
                self.resources.removeAll();
                self.upgrades.removeAll();
                self.population.removeAll();
                self.buildings.removeAll();
                self.gameEvents.removeAll();
                self.initialized(false);
                _initGame(self);
            });
            // add a cheat binding for testing purposes
            Mousetrap.bind(['ctrl+p'], function (e) {
                self.logGameEvent("Cheat Activated");
                ko.utils.arrayMap(self.resources(), function (resource) {
                    resource.maxStorage(resource.maxStorage() + 1000);
                    resource.amount(resource.amount() + 1000);
                });

            });

        }

        return { viewModel: Kingdom, template: templateMarkup };

    });
