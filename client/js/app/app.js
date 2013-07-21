App = Ember.Application.create({});

App.ApplicationRoute = Ember.Route.extend({
    setupController: function(controller, model) {
        var context = this;
        var method = this.controllerFor;
        var call = function(controller) {
            return method.call(context, controller)
        };
        this._super(controller, model);
        App.setupSocket(call);
    }
});