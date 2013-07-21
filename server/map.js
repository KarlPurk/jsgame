var Map = function() {
    this.positions = [
        {x: 100, y: 50, player: null},
        {x: 200, y: 50, player: null},
        {x: 300, y: 50, player: null},
        {x: 400, y: 50, player: null},
        {x: 500, y: 50, player: null},
        {x: 100, y: 150, player: null},
        {x: 200, y: 150, player: null},
        {x: 300, y: 150, player: null},
        {x: 400, y: 150, player: null},
        {x: 500, y: 150, player: null},
        {x: 100, y: 250, player: null},
        {x: 200, y: 250, player: null},
        {x: 300, y: 250, player: null},
        {x: 400, y: 250, player: null},
        {x: 500, y: 250, player: null},
        {x: 100, y: 350, player: null},
        {x: 200, y: 350, player: null},
        {x: 300, y: 350, player: null},
        {x: 400, y: 350, player: null},
        {x: 500, y: 350, player: null},
    ];
};

Map.prototype.findPosition = function(player) {
    var targetPosition = null;
    this.positions.forEach(function(position) {

        if (targetPosition !== null) {
            return;
        }

        if (position.player !== null) {
            return;
        }

        position.player = player;

        targetPosition = {
            x: position.x,
            y: position.y
        };
    });
    if (targetPosition === null) {
        throw {
            type: 'MapException',
            message: 'No positions available'
        };
    }
    return targetPosition;
};

Map.prototype.freePosition = function(player) {
    var freed = false;
    this.positions.forEach(function(position) {
        if (freed) {
            return;
        }
        if (!position.player) {
            return;
        }
        if (position.player.id === player.id) {
            position.player = null;
            freed = true;
        }
    });
    return freed;
}

module.exports = Map;