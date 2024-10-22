const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const frontendURL = process.env.CLIENTURL;

app.use(cors({
    origin: frontendURL,
    methods: ['GET', 'POST']
}));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: frontendURL,
        methods: ['GET', 'POST']
    }
});

// Object to store user data, including username and avatar
const users = {};

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on('joinroom', (data) => {
        console.log(data);
        socket.join(data.roomId);

        // Store user data when they join the room
        users[socket.id] = { username: data.username, roomId: data.roomId, avatar: data.avatar };

        // Emit updated user list to all clients in the room, including avatars
        io.to(data.roomId).emit('userList', Object.values(users).filter(user => user.roomId === data.roomId));

        // Broadcast toast message to all clients in the room
        io.to(data.roomId).emit('toast', `${data.username} joined the room`);
    });

    socket.on('send', (data) => {
        console.log(data);
        io.to(data.roomId).emit('receive', data);
    });

    socket.on('disconnect', () => {
        // Get username and avatar of the disconnected user
        const { username, roomId } = users[socket.id] || {};

        console.log('User disconnected', socket.id);

        // Remove user data when they disconnect
        delete users[socket.id];

        // Emit updated user list to all clients in the room, including avatars
        if (roomId) {
            io.to(roomId).emit('userList', Object.values(users).filter(user => user.roomId === roomId));
            // Broadcast toast message to all clients in the room
            io.to(roomId).emit('toast', `${username} left the room`);
        }
    });
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
