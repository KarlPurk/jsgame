App.Attack = Ember.Object.extend({
    attacker: null,
    victim: null,
    damage: null
});

App.Player = Ember.Object.extend({
    id: null,
    position: null,
    name: null,
    health: null,
    isClient: false,
    isDead: function() {
        return (this.get('health') <= 0);
    }.observes('health'),
    takeDamage: function(damage) {
        this.set('health', this.get('health') - damage);
    },
    attack: function(victim, weapon) {
        App.socket.emit('player_attack', {attackerId: this.id, victimId: victim.id, weaponId: weapon.id});
    }
});

App.Weapon = Ember.Object.extend({
    id: null,
    name: null
});