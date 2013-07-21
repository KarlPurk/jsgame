module.exports = function() {

    var sockets = require('socket.io');

    var server = function() {
        console.log('Initializing server...');
        var static = require('node-static');
        var file = new(static.Server)('./client');
        var app = require('http').createServer(function handler (req, res) {
            file.serve(req, res);
        });
        return app;
    }();

    return {
        listen: function() {
            console.log('Listening on port 1337...');
            this.io = sockets.listen(server);
            server.listen(1337);
            return this;
        },
        io: null
    };

}();