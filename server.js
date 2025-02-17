
// Import dependencies
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files (for Replit hosting)
app.use(express.static(__dirname + '/public'));

// Store connected players
let players = {};

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Initialize new player
    players[socket.id] = { x: 0, z: 0 };

    // Send updated player data to all clients
    io.emit('playerMoved', { id: socket.id, x: 0, z: 0 });

    // Handle player movement
    socket.on('movePlayer', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].z = data.z;
            io.emit('playerMoved', { id: socket.id, x: data.x, z: data.z });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        delete players[socket.id];
        io.emit('playerLeft', { id: socket.id });
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
