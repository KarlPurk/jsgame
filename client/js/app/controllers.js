
App.ActivePlayerController = Ember.ObjectController.extend({
    content: null,
    removeActivePlayer: function(player) {
        if (this.get('content') === player) {
            this.set('content', null);
        }
    }
});

App.ApplicationController = Ember.Controller.extend({
    needs: ['attacks', 'activePlayer', 'player', 'players', 'target'],
    attack: function(victim) {
        console.log(this.get('controllers.player.content'));
        this.get('controllers.player.content').attack(victim);
    }
});

App.AttacksController = Ember.ArrayController.extend({
    content: Ember.A([])
});

App.PlayersController = Ember.ArrayController.extend({
    needs: ['player'],
    content: Ember.A([]),
    refreshPlayers: function(players) {
        var self = this;
        this.set('content', Ember.A([]));
        players.forEach(function(player) {
            var model = App.Player.create({
                id: player.id,
                name: player.name,
                health: player.health,
                position: player.position,
                isClient: false});

            self.pushObject(model);
        });
        this.get('controllers.player').refreshPlayer()
    }
});

App.PlayerController = Ember.ObjectController.extend({
    needs: ['players'],
    content: null,
    playerId: null,
    refreshPlayer: function() {
        var player = this.get('controllers.players').findProperty('id', this.get('playerId'));
        if (!player) {
            return;
        }
        this.set('content', player);
        this.get('content').set('isClient', true);
    }
});

App.TargetController = Ember.ObjectController.extend({
    needs: ['weapons', 'player'],
    content: null,
    attack: function(weaponName) {
        var weapon = this.get('controllers.weapons').findProperty('name', weaponName);
        this.get('controllers.player.content').attack(this.get('content'), weapon);
    },
    observeTarget: function() {
        if (!this.get('content')) {
            return;
        }
        if (this.get('content').isDead()) {
            this.set('content', null);
            return;
        }
    }.observes('content')
});

App.WeaponsController = Ember.ArrayController.extend({
    content: Ember.A([])
});