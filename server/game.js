var loader = require('./loader');
var io = loader.load('server').io;
var Gameplay = require('./gameplays/default/gameplay');


/**
 * The game type provides a convenient interface for interacting with the core components.
 * Generally speaking it will be used within socket event handlers.
 * @class Game
 */
var Game = function() {

    /**
     * @type Gameplay
     */
    this.gameplay = new Gameplay();
}

Game.prototype.createPlayer = function() {
        return this.gameplay.createPlayer();
    };

/**
     * Called when a new player joins the game
     * @param player
     */
Game.prototype.join = function(player) {

    // If the game has already started the new player is dead
    // and must wait for the current game to finish
    // TODO: Remove hardcoded string
    if (this.gameplay.state.name === 'running') {
        player.health = 0;
    }

    // Add player to game
    this.gameplay.players.push(player);

    // Notify everyone that a new player has joined the game
    io.sockets.emit('player_joined', {
        player: {
            id: player.id,
            name: player.name,
            health: player.health,
            position: player.position
        }
    });

    // Notify console
    console.log(player.name + ' has joined the game');
    console.log('There is now ' + this.gameplay.players.length + ' players in the game');

    // Check gameplay status
    this.gameplay.stateManager.check();
};

/**
 * Called when an existing player leaves the game
 * @param player
 */
Game.prototype.leave = function(player) {

    player.disconnecting = true;

    this.gameplay.leave(player);

    // Let the other players know the player has left
    io.sockets.emit('player_left', {playerId: player.id });

    // Remove the player from the game
    this.gameplay.players.remove(player);

    // Notify console
    console.log(player.name + ' has left the game');
    console.log('There is now ' + this.gameplay.players.length + ' players in the game');

    // Check the status of the game
    this.gameplay.stateManager.check();
};

/**
 * Called when one player attacks another
 * @param attacker
 * @param victim
 * @returns {Number} The amount of damage caused by the attack
 */
Game.prototype.attack = function(attacker, victim, weapon) {

    if (!this.gameplay.canAttack(attacker, weapon)) {
        throw {
            type: 'GameException',
            message: 'Attacked failed - ' + attacker.name + ' is not allowed to attack'
        };
    }

    // Perform the attack and get the damage inflicted
    var damage = attacker.attack(victim, weapon);

    // Notify everyone that the attack has taken place
    io.sockets.emit('player_attack_done', {
        success: true,
        attackerId: attacker.id,
        victimId: victim.id,
        weaponId: weapon.id,
        damage: damage});

    // Let the gameplay know an attack occurred
    this.gameplay.attack(attacker, victim, damage);

    // If the victim was killed
    if (victim.isDead()) {
        io.sockets.emit('player_died', {
            player: victim});
    }

    // Check if the state has changed
    this.gameplay.stateManager.check();

    // Returned the amount of damage inflicted on the victim
    return damage;
};

module.exports = Game;