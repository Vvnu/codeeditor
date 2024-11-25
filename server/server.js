const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5006;
const frontendURL = 'http://192.168.179.199:3001';  // Change to your network IP

// Middleware to enable CORS
app.use(cors({
    origin: frontendURL, // Allow your network IP frontend
    methods: ['GET', 'POST']
}));

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: frontendURL,
        methods: ['GET', 'POST']
    }
});

// Object to store user data, including username and avatar
const users = {};

// Log frontend URL for debugging
console.log(`Frontend URL: ${frontendURL}`);

// Handle Socket.IO connections
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle user joining a room
    socket.on('joinroom', (data) => {
        const { roomId, username, avatar } = data;

        // Join the room
        socket.join(roomId);

        // Store user data
        users[socket.id] = { username, roomId, avatar };

        // Log the users object to ensure data is correctly stored
        console.log(`Users in the users object:`, users);

        // Emit updated user list to the room, including avatar
        const roomUsers = Object.values(users).filter(user => user.roomId === roomId);
        io.to(roomId).emit('userList', roomUsers); // Emit user list correctly

        // Notify room about the new user
        io.to(roomId).emit('toast', `${username} has joined the room`);

        // Log the new connection
        console.log(`${username} joined room ${roomId}`);
    });

    // Handle message content updates in the editor (code changes)
    socket.on('sendCodeUpdate', (data) => {
        const { roomId, codeContent } = data;

        // Log the code update to be broadcasted
        console.log(`Broadcasting code change in room ${roomId}`);

        // Emit the code update to all users in the room
        socket.to(roomId).emit('receiveCodeUpdate', {
            roomId, // Ensure room ID is included for correct targeting
            codeContent // Send updated code content to other users
        });
    });

    // Handle sending messages in the chat
    socket.on('sendMessage', (data) => {
        const { roomId, message } = data;

        // Log the message and broadcast it to all users in the room
        console.log(`Broadcasting message in room ${roomId}: ${message}`);

        // Emit the message to all users in the room
        socket.to(roomId).emit('receiveMessage', {
            roomId,
            username: users[socket.id].username,
            message // Broadcast the message to all users
        });
    });

    // Handle user disconnecting
    socket.on('disconnect', () => {
        const { username, roomId } = users[socket.id] || {};
        console.log(`User disconnected: ${socket.id} (${username})`);

        // Remove user data
        delete users[socket.id];

        // Emit updated user list to the room
        if (roomId) {
            const roomUsers = Object.values(users).filter(user => user.roomId === roomId);
            io.to(roomId).emit('userList', roomUsers);

            // Notify room about the user leaving (but don't show it in a toast to the user that is disconnecting)
            if (username) {
                // Broadcast to other users in the room
                socket.to(roomId).emit('toast', `${username} has left the room`);
            }
        }
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
