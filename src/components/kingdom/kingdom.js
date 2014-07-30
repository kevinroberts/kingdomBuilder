define(['knockout', 'bootbox' , 'text!./kingdom.html'], function(ko, bootbox ,templateMarkup) {

  function Kingdom(params) {
	  var self = this;

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
