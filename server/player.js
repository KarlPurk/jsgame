var Weapon = require('./weapons');

/**
 * Constructor function for the Player type
 * @method Player
 * @constructor
 */
var Player = function(name) {
    name = name || 'Player';
    this.id = this.generateId();
    this.name = name;
    this.disconnecting = false;
    this.position = {
        x: 0,
        y: 0
    };
    this.weapons = {
        pistol:     new Weapon.Pistol(),
        shotgun:    new Weapon.Shotgun()
    };
    this.reset();
};

/**
 * Generates a unique id for each player
 * @method generateId
 * @return int
 */
Player.prototype.generateId = function() {
    var id = 0;
    return function() {
        return ++id;
    };
}();

/**
 * Removes health from this player
 * @method takeDamage
 * @param event
 */
Player.prototype.takeDamage = function(event) {
    var prevHealth = this.health;
    this.health = this.health - event.damage;
    if (prevHealth > 0 && this.health <= 0) {
        // Notify console
        console.log(this.name + ' has died');
    }
};

/**
 * Determines if this player is dead
 * @method isDead
 * @returns {boolean}
 */
Player.prototype.isDead = function() {
    return (this.health <= 0);
};

/**
 * Resets the player to a original state at the beginning of each game.
 */
Player.prototype.reset = function() {
    this.health = 100;
};

Player.prototype.getWeapon = function(weaponId) {
    var player = this;
    var targetWeapon = null;
    Object.keys(player.weapons).forEach(function(property) {
        if (targetWeapon) {
            return;
        }
        if (!player.weapons.hasOwnProperty(property)) {
            return;
        }
        var weapon = player.weapons[property];
        if (weapon.id === weaponId) {
            targetWeapon = weapon;
        }
    });
    return targetWeapon;
};

Player.prototype.attack = function(victim, weapon) {

    var damage = weapon.fire();

    // Notify console
    console.log(this.name + ' attacked ' + victim.name + ' with ' + weapon.name + ' taking ' + damage + ' health');

    victim.takeDamage({
        damage: damage
    });

    return damage;
}

Player.prototype.toLightweight = function() {
    var weapons = [];
    var player = this;
    Object.keys(player.weapons).forEach(function(property) {
        if (!player.weapons.hasOwnProperty(property)) {
            return;
        }
        var weapon = player.weapons[property];
        weapons.push({
            id: weapon.id,
            ammo: weapon.ammo
        });
    });
    return {
        id: this.id,
        name: this.name,
        health: this.health,
        position: this.position,
        weapons: weapons
    };
};

module.exports = Player;