define(['knockout', 'text!./nav-bar.html', 'pubsub'], function (ko, template) {
    'use strict';

    function NavBarViewModel(params) {
        var self = this;

        this.route = params.route;

        self.saved = ko.observable().publish('gamesave');
        self.newGame = ko.observable().publish('gamenew');
        self.renameKingdomEvent = ko.observable().publish('kingdom.rename');
        self.renameRulerEvent = ko.observable().publish('ruler.rename');

        self.saveGame = function () {
            // trigger save game publish event
            self.saved(new Date());
            // animate the save button with a new icon and a success background
            $("#save-game-btn").children('span').removeClass('glyphicon-floppy-save').addClass('glyphicon-floppy-saved');
            var newHtml = $("#save-game-btn").html().replace('Save game', 'Game saved');
            $("#save-game-btn").html(newHtml);
            $("#save-game-btn").addClass('btn-success');
            setTimeout(function () {
                $("#save-game-btn").removeClass('btn-success');
                $("#save-game-btn").children('span').removeClass('glyphicon-floppy-saved').addClass('glyphicon-floppy-save');
                var newHtml = $("#save-game-btn").html().replace('Game saved', 'Save game');
                $("#save-game-btn").html(newHtml);
            }, 600);
        };

        self.createNewGame = function () {
            self.newGame(new Date());
        };
        self.renameKingdom = function () {
            self.renameKingdomEvent(new Date());
        };
        self.renameRuler = function () {
            self.renameRulerEvent(new Date());
        };
    }

    return { viewModel: NavBarViewModel, template: template };
});
