/**
 * The Gameplay module provides an abstract Gameplay type.
 * This type can be extended to provide concrete gameplay implementations.
 * @module Gameplay
 */

/**
 * Module dependencies
 */
var Player = require('./player');
var Players = require('./players');
var loader = require('./loader');
var io = loader.load('server').io;

/**
 * The Gameplay type provides an abstract object to represent a gameplay.
 * This object should be extended to provide specific functionality.
 * @class Gameplay
 */

/**
 * Constructor function for Gameplay type.
 * @method Gameplay
 * @constructor
 */
var Gameplay = function() {

    var Players = require('./players.js');
    var StateManager = require('./gameplay-state-manager');
    var GameplayState = require('./gameplay-state');

    this.state = new GameplayState('unknown');

    // Each gameplay requires it's own state manager
    this.stateManager = new StateManager();

    /**
     * We need to observe the state manager for state changes,
     * When a state changes, we need to update our locate state reference
     */
    this.stateManager.observe(this, function(event, data) {
        if (event === 'state_changed') {
            this.state = data;
        };
    });

    // Create a new players collection
    this.players = new Players();
};

/**
 * Set the states that are associated with this gameplay.
 * @param states
 */
Gameplay.prototype.setStates = function(states) {

    // Set's the states that are valid for this gameplay mode
    this.stateManager.setStates(states, this);

    // Ask the state manager to check the states and change state if required
    this.stateManager.check();
}

/**
 * Called when a new game is started
 */
Gameplay.prototype.startGame = function() {

    // Reset players health, etc.
    this.players.forEach(function(player) {
        player.reset();
    })

    io.sockets.emit('game_started', {players: this.players.lightweight()});

    // Notify console
    console.log('The game has started');
};

/**
 * Called when a game is over
 */
Gameplay.prototype.gameOver = function() {

    var winner = this.determineWinner();

    console.log('The game has finished');

    console.log(winner.name + ' has won the game');

    io.sockets.emit('game_over', {player: winner});
};

/**
 * Determines the winner of the game
 * @method determineWinner
 * @returns {*}
 */
Gameplay.prototype.determineWinner = function() {
    throw {
        type: 'GameplayException',
        message: 'You must implement determineWinner.'
    };
};

/**
 * Determines if the specified player can attack
 * @param {Player} player
 * @returns {boolean}
 */
Gameplay.prototype.canAttack = function(player, weapon) {
    if (player.isDead()) {
        return false;
    }
    if (weapon.ammo === 0) {
        return false;
    }
    return true;
}

/**
 * Factory method for creating a new player.
 * @returns {Player}
 */
Gameplay.prototype.createPlayer = function() {
    var player = new Player();
    player.name = 'Player ' + player.id;
    return player;
};

/**
 * Called when a player leaves the game
 * @param {Player} player
 */
Gameplay.prototype.leave = function(player) {
};

/**
 * Called when one player attacks another
 * @param {Player} attacker
 * @param {Player} victim
 * @param {Player} damage
 */
Gameplay.prototype.attack = function(attacker, victim, damage) {
};

module.exports = Gameplay;

