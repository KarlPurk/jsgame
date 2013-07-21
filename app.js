var loader = require('./server/loader');
var io = loader.load('server').listen().io;
var Game = require('./server/game');
var game = new Game();

io.sockets.on('connection', function (socket) {

    // Let the client know which weapons are available
    socket.emit('weapons', {
        weapons: [
            {
                id: 0,
                name: 'pistol'
            },
            {
                id: 1,
                name: 'shotgun'
            }
        ]
    });

    /**
     * A player has joined the game.
     */
    socket.on('player_join', function() {

        socket.player = game.createPlayer();

        game.join(socket.player);

        // Send the list of players back to the client
        socket.emit('player_join_complete', {
            players: game.gameplay.players.lightweight(),
            playerId: socket.player.id});

    });

    /**
     * A player has left the game.
     */
    socket.on('disconnect', function() {
        game.leave(socket.player);
    });

    /**
     * One player has attacked another
     */
    socket.on('player_attack', function(data) {

        // Find the attacker
        var attacker = game.gameplay.players.findPlayer(data.attackerId);

        // Find the victim
        var victim = game.gameplay.players.findPlayer(data.victimId);

        // If we can't find the attacker
        if (!attacker) {

            // Notify client that the attack has failed
            socket.emit('player_attack_done', {
                success: false,
                message: 'Unable to find source player'});
            return;
        }

        // If we can't find the victim
        if (!victim) {

            // Notify client that the attack has failed
            socket.emit('player_attack_done', {
                success: false,
                message: 'Unable to find target player'});
            return;
        }

        var weapon = attacker.getWeapon(data.weaponId);

        if (!weapon) {

            // Notify client that the attack has failed
            socket.emit('player_attack_done', {
                success: false,
                message: 'Unable to find weapon'});
            return;
        }

        // Determine if we can attack first
        if (!game.gameplay.canAttack(attacker, weapon)) {
            return;
        }

        // Perform the attack
        game.attack(attacker, victim, weapon);
    })

    /**
     * A player has died.
     */
    socket.on('player_died', function(data) {
        console.log(data.player.name + ' has died');
    });
});