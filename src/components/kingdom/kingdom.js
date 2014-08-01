define(['jquery', 'underscore', 'knockout', 'utils', 'bootbox', 'bootstrap-editable', 'text!./kingdom.html'], function ($, _, ko, utils, bootbox, editable, templateMarkup) {

	function Kingdom(params) {
		var self = this;
		self.name = ko.observable('KeVille');
		self.resources = ko.observableArray([]);

	}

	return { viewModel: Kingdom, template: templateMarkup };

});
