var loader = require('./../../loader');
var io = loader.load('server').io;
var Collection = loader.load('util/collection');

var STATE_WAITING   = 'waiting';
var STATE_STARTING  = 'starting';
var STATE_RUNNING   = 'running';
var STATE_FINISHED  = 'finished';

var DELAY_START     = 5;
var DELAY_FINISH    = 5;
var GameplayState = require('./../../gameplay-state');

var stateWaiting = new GameplayState(STATE_WAITING);
stateWaiting.conditionsMet = function() {

    // If the game is already in this state
    if (this.gameplay.state.name === STATE_WAITING) {
        return false;
    }

    // If there is more than one player in the game we don't need to wait
    if (this.gameplay.players.length > 1) {
        return false;
    }

    // If the game is currently running we need to cancel the game
    if (this.gameplay.state.name === STATE_RUNNING) {

        // Inform remaining player that the game is cancelled
        io.sockets.emit('game_cancelled');
    }

    return true;
};

var stateStarting = new GameplayState(STATE_STARTING);
stateStarting.conditionsMet = function() {

    if (this.gameplay.state.locked) {
        return false;
    }

    // We can only start a game if it is in the waiting state OR in the finished state
    if ((this.gameplay.state.name !== STATE_WAITING) &&
        (this.gameplay.state.name !== STATE_FINISHED)) {
        return false;
    }

    // If there is less than 2 players we can't start the game
    if (this.gameplay.players.length < 2) {
        return false;
    }

    return true;
};
stateStarting.enterState = function() {
    io.sockets.emit('starting_game', {remaining: DELAY_START});
    this.lock(DELAY_START);
};

var stateRunning = new GameplayState(STATE_RUNNING);
stateRunning.conditionsMet = function() {

    if (this.gameplay.name === STATE_STARTING && this.gameplay.state.locked) {
        return false;
    }

    // Condition 1: The game must be in the STARTING state
    if (this.gameplay.state.name !== STATE_STARTING) {
        return false;
    }

    // Condition 2: There must be at least two players in the game
    if (this.gameplay.players.length < 2) {
        return false;
    }

    return true;
};
stateRunning.enterState = function() {
    this.gameplay.startGame();
};

var stateFinished = new GameplayState(STATE_FINISHED);
stateFinished.conditionsMet = function() {

    // Condition 1: The game must be in the RUNNING state
    if (this.gameplay.state.name !== STATE_RUNNING) {
        return false;
    }

    // Condition 2: There must be only one player alive
    if (this.numPlayersAlive() > 1) {
        return false;
    }

    return true;
};
stateFinished.numPlayersAlive = function() {
    var alivePlayers = [];
    this.gameplay.players.forEach(function(player) {
        if (!player.isDead()) {
            alivePlayers.push(player);
        }
    });
    return alivePlayers.length;
}
stateFinished.enterState = function() {
    this.lock(DELAY_FINISH);
    this.gameplay.gameOver();
};

var collection = new Collection();
collection.splice(0, 0,
    stateWaiting,
    stateStarting,
    stateRunning,
    stateFinished);

module.exports = collection;