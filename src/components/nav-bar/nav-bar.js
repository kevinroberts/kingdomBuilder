define(['knockout', 'text!./nav-bar.html', 'pubsub'], function (ko, template) {

	function NavBarViewModel(params) {
		var self = this;

		this.route = params.route;

		self.saved = ko.observable().publish('gamesave');
		self.newGame = ko.observable().publish('gamenew');

		self.saveGame = function () {
			// trigger save game publish event
			self.saved(new Date());
			// animate the save button with a new icon and a success background
			$("#save-game-btn").children('span').removeClass('glyphicon-floppy-save').addClass('glyphicon-floppy-saved');
			var newHtml = $("#save-game-btn").html().replace('Save game', 'Game saved');
			$("#save-game-btn").html(newHtml);
			$("#save-game-btn").addClass('btn-success');
			setTimeout(function(){
				$("#save-game-btn").removeClass('btn-success');
				$("#save-game-btn").children('span').removeClass('glyphicon-floppy-saved').addClass('glyphicon-floppy-save');
				var newHtml = $("#save-game-btn").html().replace('Game saved', 'Save game');
				$("#save-game-btn").html(newHtml);
			},600);
		};

		self.createNewGame = function() {
			self.newGame(new Date());
		};
	}

	return { viewModel: NavBarViewModel, template: template };
});
