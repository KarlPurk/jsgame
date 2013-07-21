App.setupSocket = function(controllers) {

    App.socket = io.connect('http://localhost:1337');

    /**
     * Called when this player connects to the server
     */
    App.socket.on('connect', function () {
        console.log('Connected to server');
        controllers('players').set('content', []);
        App.socket.emit('player_join', {name: 'Karl'});
    });

    App.socket.on('weapons', function(data) {
        data.weapons.forEach(function(weapon) {
            var weapon = App.Weapon.create({
                id: weapon.id,
                name: weapon.name
            });
            controllers('weapons').pushObject(weapon);
        });
    });

    /**
     * Called when this player disconnects from the server
     */
    App.socket.on('disconnect', function () {
        console.log('Disconnected from server');
    });

    /**
     * Called when the game is starting
     */
    App.socket.on('starting_game', function(data) {
        console.log('The game will begin in ' + data.remaining + ' seconds');
        var interval = setInterval(function() {
            data.remaining--;
            console.log('The game will begin in ' + data.remaining + ' seconds');
            if (data.remaining === 1) {
                clearInterval(interval);
            }
        }, 1000);
    });

    /**
     * Called when it is a new players turn
     */
    App.socket.on('player_turn', function(data) {
        var player = controllers('players').findProperty('id', data.playerId);
        controllers('activePlayer').set('content', player);
        console.log('It is now ' + player.name + '\'s turn');
    });

    /**
     * Called when a game has started
     */
    App.socket.on('game_started', function(data) {
        console.log('The game has started');
        controllers('players').refreshPlayers(data.players);
    });

    /**
     * Called when a player has died
     */
    App.socket.on('player_died', function(data) {
        console.log(data.player.name + ' has died');
    });

    /**
     * Called when the game is over
     */
    App.socket.on('game_over', function(data) {
        console.log('The game is now over.  ' + data.player.name + ' won the game.');
    });

    /**
     * Called after this player has successfully joined the game.
     */
    App.socket.on('player_join_complete', function(data) {
        controllers('player').set('playerId', data.playerId);
        controllers('players').refreshPlayers(data.players);
    });

    /**
     * Called when a new player joins the game
     */
    App.socket.on('player_joined', function(data) {
        var player = App.Player.create({
            id: data.player.id,
            name: data.player.name,
            health: data.player.health,
            position: data.player.position
        });
        if (!controllers('players').findProperty('id', player.id)) {
            controllers('players').pushObject(player);
        }
        console.log(player.name + ' has joined the game');
    });

    /**
     * Called when a player leaves the game
     */
    App.socket.on('player_left', function(data) {
        var player = controllers('players').findProperty('id', data.playerId);
        console.log(player.name + ' has left the game');
        controllers('players').removeObject(player);
    })

    /**
     * Called when a player attack is complete
     */
    App.socket.on('player_attack_done', function(data) {
        if (!data.success) {
            console.log('Player attack failed: ' + data.message);
            return;
        }
        var damage = data.damage;
        var attacker = controllers('players').findProperty('id', data.attackerId);
        var victim = controllers('players').findProperty('id', data.victimId);
        var weapon = controllers('weapons').findProperty('id', data.weaponId);
        controllers('activePlayer').removeActivePlayer(attacker);
        if (!damage) {
            console.log(attacker.name + ' attacked ' + victim.name + ' and missed!');
            return;
        }
        victim.takeDamage(damage)
        controllers('attacks').pushObject(App.Attack.create({
            attacker: attacker,
            victim: victim,
            damage: damage
        }));
        console.log(attacker.name + ' attacked ' + victim.name + ' with ' + weapon.name + ' and took ' + damage + ' health points');
    });
};