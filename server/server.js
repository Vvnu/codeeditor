const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const frontendURL = process.env.CLIENTURL || 'http://localhost:3000';

console.log('🚀 Starting server with config:', { PORT, frontendURL });

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

// Add a simple health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
    console.log('✅ New socket connected:', socket.id);

    socket.on('joinroom', (data) => {
        console.log('🏠 User joining room:', { socketId: socket.id, ...data });
        
        if (!data.roomId || !data.username) {
            console.error('❌ Invalid joinroom data:', data);
            return;
        }
        
        socket.join(data.roomId);
        console.log('✅ User joined room:', data.roomId);

        // Store user data when they join the room
        users[socket.id] = { 
            username: data.username, 
            roomId: data.roomId, 
            avatar: data.avatar 
        };

        // Get all users in this room
        const roomUsers = Object.values(users).filter(user => user.roomId === data.roomId);
        console.log('👥 Users in room', data.roomId, ':', roomUsers);

        // Emit updated user list to all clients in the room, including avatars
        io.to(data.roomId).emit('userList', roomUsers);
        console.log('📤 Sent userList to room', data.roomId, ':', roomUsers);

        // Broadcast toast message to all clients in the room
        io.to(data.roomId).emit('toast', `${data.username} joined the room`);
        console.log('🍞 Sent toast: "', data.username, 'joined the room"');
    });

    socket.on('send', (data) => {
        console.log('📥 Code update received from', socket.id, ':', { 
            roomId: data.roomId, 
            username: data.username,
            msgLength: data.msg ? data.msg.length : 0,
            language: data.language 
        });
        
        if (!data.roomId) {
            console.error('❌ No roomId in send data:', data);
            return;
        }
        
        // Broadcast the code update to all other users in the room
        socket.to(data.roomId).emit('receive', data);
        console.log('📤 Broadcasted code update to room', data.roomId);
    });

    socket.on('disconnect', () => {
        // Get username and avatar of the disconnected user
        const { username, roomId } = users[socket.id] || {};

        console.log('🔌 User disconnected:', { socketId: socket.id, username, roomId });

        // Remove user data when they disconnect
        delete users[socket.id];

        // Emit updated user list to all clients in the room, including avatars
        if (roomId) {
            const roomUsers = Object.values(users).filter(user => user.roomId === roomId);
            io.to(roomId).emit('userList', roomUsers);
            console.log('📤 Updated userList after disconnect:', roomUsers);
            
            // Broadcast toast message to all clients in the room
            io.to(roomId).emit('toast', `${username} left the room`);
            console.log('🍞 Sent toast: "', username, 'left the room"');
        }
    });

    // Debug: Listen for any errors
    socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
    });
});

server.listen(PORT, () => {
    console.log(`🎉 Server listening on port ${PORT}`);
    console.log(`🌐 CORS enabled for origin: ${frontendURL}`);
    console.log(`🔗 Health check available at: http://localhost:${PORT}/health`);
});
