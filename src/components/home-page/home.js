define(["knockout", "text!./home.html"], function (ko, homeTemplate) {

    function HomeViewModel(route) {

    }

    HomeViewModel.prototype.doSomething = function () {
    };

    return { viewModel: HomeViewModel, template: homeTemplate };

});
