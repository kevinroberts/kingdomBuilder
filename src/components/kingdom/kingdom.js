define(['jquery', 'knockout', 'bootbox', 'bootstrap-editable', 'text!./kingdom.html'], function($, ko, bootbox, editable, templateMarkup) {

  function Kingdom(params) {
	  var self = this;

	  $('#username').editable({
		  type: 'text',
		  title: 'Enter username',
		  success: function(response, newValue) {
			  console.log('username has been updated', newValue);
		  }
	  });

	  self.message = ko.observable('Hello from the kingdom component!');

	  self.doSomething = function() {
		  bootbox.confirm("Are you sure? Are you really really sure ___ENTER_NAME_HERE____!?", function(result) {
			  if (result) {
				  console.log("confirmed");
			  }
		  });
	  };

  }

  return { viewModel: Kingdom, template: templateMarkup };

});
