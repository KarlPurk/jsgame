/**
 * Module dependencies
 */
var loader = require('./../../loader');
var io = loader.load('server').io;
var Gameplay = require('./../../gameplay');
var Map = require('./../../map');

/**
 * Constructor function for the default gameplay
 * @constructor
 */
var Default = function() {

    // Get the states for this gameplay
    var states = require('./states');

    // Call the Gameplay type constructor
    Gameplay.call(this);

    // Set the states
    this.setStates(states);

    this.activePlayer = null;

    this.map = new Map();
};

/**
 * Set up inheritance
 */
Default.prototype = Object.create(Gameplay.prototype);
Default.prototype.constructor = Gameplay;

/**
 * Factory method for creating a new player.
 * @returns {Player}
 */
Default.prototype.createPlayer = function() {
    var player = Gameplay.prototype.createPlayer.call(this);
    player.position = this.map.findPosition(player);
    player.takenTurn = false;
    return player;
};

/**
 * Called when a new game is started
 * @method startGame
 */
Default.prototype.startGame = function() {
    Gameplay.prototype.startGame.call(this);

    // Remove the existing active player when a new game starts
    this.activePlayer = null;

    // Find the player who will move next
    this.selectPlayerForNextTurn();
};

/**
 * Determines if the specified player is allowed to attack
 * @param {Player} player
 * @returns {boolean}
 */
Default.prototype.canAttack = function(player, weapon) {

    if (!Gameplay.prototype.canAttack(player, weapon)) {
        return false;
    }

    // TODO: Remove hardcoded string
    if (this.state.name !== 'running') {
        return false;
    }

    if (this.activePlayer !== player) {
        return false;
    }

    return true;
}

/**
 * Called when one player attacks another
 * @method attack
 * @param {Object} attacker
 * @param {Object} victim
 * @param {Number} damage
 */
Default.prototype.attack = function(attacker, victim, damage) {
    attacker.takenTurn = true;
    this.selectPlayerForNextTurn();
};

/**
 * Determine the winner of the game
 * @method determineWinner
 * @returns {*}
 */
Default.prototype.determineWinner = function() {

    // Determine which players are still alive
    var alivePlayers = [];
    this.players.forEach(function(player) {
        if (!player.isDead()) {
            alivePlayers.push(player);
        }
    });

    // If there is more than 1 player remaining we have a problem
    if (alivePlayers.length > 1) {
        throw {
            type: 'GameplayException',
            message: 'Unable to determine winner.'
        };
    }

    return alivePlayers.pop();
};

/**
 * Tries to find a player who can attack next
 * @method findPlayerForNextTurn
 * @returns {Player|null}
 */
Default.prototype.findPlayerForNextTurn = function() {
    var candidates = [];
    this.players.forEach(function(player) {
        if (player.disconnecting) {
            return;
        }
        if (player.isDead()) {
            return;
        }
        if (player.takenTurn) {
            return;
        }
        candidates.push(player);
    });
    // TODO: randomise the selection
    return candidates.length ? candidates.shift() : null;
};

/**
 * Selects the player that is allowed to attack next
 * @method selectPlayerForNextTurn
 */
Default.prototype.selectPlayerForNextTurn = function() {

    // If we already have a player who has not yet attacked we don't need to find another
    if (this.activePlayer && !this.activePlayer.takenTurn) {
        return;
    }

    // Try to find a suitable player
    this.activePlayer = this.findPlayerForNextTurn();

    // If we couldn't find a player
    if (!this.activePlayer) {

        // Maybe all the players have taken their turn
        // Reset every players takenTurn flag
        this.players.forEach(function(player) {
            player.takenTurn = false;
        });

        // Try to find a suitable player again
        this.activePlayer = this.findPlayerForNextTurn();
    }

    // If we managed to find a player
    if (this.activePlayer) {

        // Notify console
        console.log('It is now ' + this.activePlayer.name + '\'s turn');

        // Notify everyone else
        io.sockets.emit('player_turn', {playerId: this.activePlayer.id});
    }
}

/**
 * Called when a player leaves the game
 * @method leave
 * @param {Player} player
 */
Default.prototype.leave = function(player) {

    if (this.activePlayer === player) {
        this.activePlayer = null;
        this.selectPlayerForNextTurn();
    }

    // Free up the start position that this player occupied
    this.map.freePosition(player);
};

module.exports = Default;