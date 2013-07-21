var Players = function() {};
Players.prototype = Array.prototype;
Players.prototype.findPlayer = function(id) {
    var foundPlayer;
    this.forEach(function(player) {
        if (foundPlayer) {
            return;
        }
        if (player.id === id) {
            foundPlayer = player;
        }
    });
    return foundPlayer;
};

Players.prototype.lightweight = function() {
    // Create lightweight list of current players to send back to client
    var players = [];
    this.forEach(function(player) {
        players.push(player.toLightweight());
    });
    return players;
};

Players.prototype.remove = function(player) {
    this.splice(this.indexOf(player), 1);
}

module.exports = Players;