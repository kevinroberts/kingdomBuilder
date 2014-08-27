define('pubsub', ['knockout'], function (ko) {
    'use strict';
    var postbox = new ko.subscribable();

    ko.subscribable.fn.publish = function (topic) {
        this.subscribe(function (newValue) {
            postbox.notifySubscribers(newValue, topic);
        });
        return this; //support chaining
    };

    ko.subscribable.fn.sub = function (topic) {
        postbox.subscribe(this, null, topic);
        return this;  //support chaining
    };
});
