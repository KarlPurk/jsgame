var loader = require('./../../../../../server/loader');
var Player = loader.load('player');

/**
 * Overload the server dependency and return a stub instead.
 * This allows us to prevent the tests from trying to emit
 * events or start any servers.
 */
loader.setHandler('server', function() {
    return {
        io: {
            sockets: {

                // Stub the emit method to prevent events from being emitted
                emit: function(event, data) {
                    console.log('Event caught: ' + event);
                }
            }
        }
    }
});

var createOnePlayerGame = function() {

    // Get dependencies
    var game = new (loader.load('game'));

    // Join new player to game
    game.join(new Player('Karl'));

    // Get starting state object
    var startingState = game.gameplay.stateManager.states.findProperty('name', 'starting');
    var finishingState = game.gameplay.stateManager.states.findProperty('name', 'finished');

    // Spy on the starting state object's enterState() method and prevent original method from firing
    // This prevents the lock from triggering which is a good thing for testing - the lock is mainly
    // used to prevent a state from changing too quickly.
    spyOn(startingState, 'lock').andReturn(function() { });
    spyOn(finishingState, 'lock').andReturn(function() { });

    return game;
};

var createTwoPlayerGame = function() {

    var game = createOnePlayerGame();

    game.join(new Player('Bob'));

    expect(game.gameplay.stateManager.states.findProperty('name', 'starting').lock).toHaveBeenCalled();

    return game;
};

var createThreePlayerGame = function() {

    var game = createTwoPlayerGame();
    game.join(new Player('Joe'));
    return game;
};

var progressGameToNextRound = function(game) {
    var i;

    // Make sure we're in the running state
    game.gameplay.stateManager.check();
    expect(game.gameplay.state.name).toBe('running');

    // Force players to attack each other until the game is finished
    for (i = 0; i < (game.gameplay.players + 1); i++) {
        game.gameplay.players.forEach(function(player) {
            if (player === game.gameplay.activePlayer) {
                return;
            }
            try {
                game.attack(game.gameplay.activePlayer, player, player.weapons.shotgun);
            }
            catch (e) {

            }
        });
        if (game.gameplay.state.name === 'finished') {
            break;
        }
    }
    expect(game.gameplay.state.name).toBe('finished');

    // Move to starting
    game.gameplay.stateManager.check();
    expect(game.gameplay.state.name).toBe('starting');

    // Move to running
    game.gameplay.stateManager.check();
    expect(game.gameplay.state.name).toBe('running');

}

describe('default gameplay', function() {

    it('should be in the "waiting" state when there is only one player', function() {

        var game = createOnePlayerGame();

        // Verify results
        expect(game.gameplay.state.name).toEqual('waiting');
        expect(game.gameplay.players.length).toEqual(1);
    });

    it('should move to the "starting" state when there are two players and the game is in the "waiting" state', function() {

        var game = createTwoPlayerGame();

        // Verify results
        expect(game.gameplay.state.name).toEqual('starting');
        expect(game.gameplay.players.length).toEqual(2);
    });

    it('should move to the "running" state when in the "starting" state', function() {

        var game = createTwoPlayerGame();

        // Force the stateManager to check the states again.  Usually this would happen
        // when the lock flag on the starting state is removed, but because we've mocked
        // the enterState() method and prevented it from firing this won't happen.
        game.gameplay.stateManager.check();

        // Verify results
        expect(game.gameplay.state.name).toEqual('running');
        expect(game.gameplay.players.length).toEqual(2);
    });

    it('should move to the "waiting" state if a game is "running" and all but one player disconnects', function() {

        var game = createTwoPlayerGame();

        // Force the stateManager to check the states again.  Usually this would happen
        // when the lock flag on the starting state is removed, but because we've mocked
        // the enterState() method and prevented it from firing this won't happen.
        game.gameplay.stateManager.check();

        // Now we want a player to leave the game
        game.leave(game.gameplay.players[0]);

        // Verify results
        expect(game.gameplay.state.name).toEqual('waiting');
        expect(game.gameplay.players.length).toEqual(1);
    });

});

describe('default gameplay players', function() {

    it('should be dead when joining a running game', function() {

        var game = createTwoPlayerGame();
        game.gameplay.stateManager.check();

        // Create player objects
        var playerThree = new Player('Joe');

        // Join the third player to the game
        game.join(playerThree);

        expect(playerThree.health).toEqual(0);
        expect(playerThree.isDead()).toBe(true);
    });

    it('should lose active flag when they leave the game', function() {
        var game = createTwoPlayerGame();
        game.gameplay.stateManager.check();
        var prevActivePlayer = game.gameplay.activePlayer;
        game.leave(game.gameplay.activePlayer);
        expect(game.gameplay.activePlayer).not.toEqual(prevActivePlayer);
        expect(game.gameplay.activePlayer).not.toBe(null);
    });

    it('should not be able to attack dead players', function() {
        var game = createThreePlayerGame();
        game.gameplay.stateManager.check();

        var killPlayer = null;
        game.gameplay.players.forEach(function(player) {
            if (player === game.gameplay.activePlayer) {
                return;
            }
            killPlayer = player;
        });

        var weaponMock = { fire: function() { return 100; }}
        var damage = 0;

        expect(killPlayer.isDead()).toEqual(false);
        damage = game.attack(game.gameplay.activePlayer, killPlayer, weaponMock);
        expect(damage).toEqual(100);
        expect(killPlayer.isDead()).toEqual(true);
        expect(killPlayer.health).toEqual(0);

        // Second attack should not work
        damage = game.attack(game.gameplay.activePlayer, killPlayer, weaponMock);
        expect(damage).toEqual(100);
        expect(killPlayer.health).toEqual(0);

    });
});

describe('default gameplay weapons', function() {

    it('should have restocked ammo each game', function() {

        var game = createTwoPlayerGame();

        game.gameplay.players

        progressGameToNextRound(game);


    });
});