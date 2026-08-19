const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");

// ============================================================
// DATABASE
// ============================================================

const {
    Room,
    connectDB,
    getOrCreateRoom,
    updateRoomCode,
    removeUserFromRoom,
} = require("./models/rooms");

// ============================================================
// LOAD ENVIRONMENT VARIABLES
// ============================================================

dotenv.config({
    path: path.join(__dirname, "atlas-credentials.env"),
});

// ============================================================
// APP SETUP
// ============================================================

const app = express();
const server = http.createServer(app);

// ============================================================
// CONFIGURATION
// ============================================================

const PORT = process.env.PORT || 5000;

const frontendURL =
    process.env.CLIENTURL || "http://localhost:3000";

const PISTON_URL =
    process.env.PISTON_URL || "http://localhost:2000";

console.log("==========================================");
console.log("🚀 Starting Code Editor Server");
console.log("==========================================");
console.log("PORT:", PORT);
console.log("Frontend:", frontendURL);
console.log("Piston:", PISTON_URL);
console.log(
    "MongoDB URI:",
    process.env.MONGODB_URI ? "Loaded" : "Missing"
);
console.log("==========================================");

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(
    cors({
        origin: frontendURL,
        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS",
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],
        credentials: true,
    })
);

app.use(
    express.json({
        limit: "1mb",
    })
);

app.use(
    express.urlencoded({
        extended: true,
    })
);

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        server: "Code Editor Server",
        timestamp: new Date().toISOString(),
        piston: PISTON_URL,
        database: "MongoDB Atlas",
        mongodbConnected:
            require("mongoose").connection.readyState === 1,
        mongodbDatabase:
            require("mongoose").connection.name || null,
    });
});

// ============================================================
// TEST MONGODB
// ============================================================

app.get("/test-db", async (req, res) => {
    try {
        console.log("==========================================");
        console.log("🧪 TESTING MONGODB");

        const room = await getOrCreateRoom(
            "TEST-ROOM-123"
        );

        console.log(
            "✅ MongoDB test room created/found"
        );

        console.log(
            "Database:",
            require("mongoose").connection.name
        );

        console.log(
            "Collection:",
            Room.collection.name
        );

        console.log(
            "Room:",
            room
        );

        console.log("==========================================");

        res.json({
            success: true,
            message: "MongoDB is working",

            database:
                require("mongoose").connection.name,

            collection:
                Room.collection.name,

            room,
        });

    } catch (error) {
        console.error(
            "❌ TEST DB ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// ============================================================
// PISTON EXECUTE PROXY
// ============================================================

app.post(
    "/api/v2/execute",
    async (req, res) => {

        console.log(
            "=========================================="
        );

        console.log(
            "▶️ Code execution request received"
        );

        console.log(
            "Language:",
            req.body?.language
        );

        console.log(
            "Version:",
            req.body?.version
        );

        console.log(
            "Code length:",
            req.body?.files?.[0]?.content?.length || 0
        );

        try {

            if (!req.body) {
                return res.status(400).json({
                    error:
                        "Request body is missing",
                });
            }

            if (!req.body.language) {
                return res.status(400).json({
                    error:
                        "Language is required",
                });
            }

            if (!req.body.version) {
                return res.status(400).json({
                    error:
                        "Version is required",
                });
            }

            if (
                !Array.isArray(req.body.files) ||
                req.body.files.length === 0
            ) {
                return res.status(400).json({
                    error:
                        "At least one source file is required",
                });
            }

            const pistonResponse =
                await fetch(
                    `${PISTON_URL}/api/v2/execute`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify(
                            req.body
                        ),
                    }
                );

            const responseText =
                await pistonResponse.text();

            console.log(
                "Piston HTTP status:",
                pistonResponse.status
            );

            if (!pistonResponse.ok) {

                console.error(
                    "❌ Piston returned an error:",
                    responseText
                );

                return res
                    .status(
                        pistonResponse.status
                    )
                    .json({
                        error:
                            "Piston execution failed",

                        details:
                            responseText,
                    });
            }

            let pistonData;

            try {

                pistonData =
                    JSON.parse(
                        responseText
                    );

            } catch (error) {

                console.error(
                    "❌ Could not parse Piston response:",
                    responseText
                );

                return res.status(500).json({
                    error:
                        "Invalid response received from Piston",

                    details:
                        responseText,
                });
            }

            console.log(
                "✅ Piston execution completed"
            );

            if (pistonData.run) {

                console.log(
                    "stdout:",
                    pistonData.run.stdout
                );

                console.log(
                    "stderr:",
                    pistonData.run.stderr
                );

                console.log(
                    "exit code:",
                    pistonData.run.code
                );
            }

            console.log(
                "=========================================="
            );

            return res.json(
                pistonData
            );

        } catch (error) {

            console.error(
                "❌ Piston proxy error:",
                error.message
            );

            return res.status(500).json({
                error:
                    "Unable to connect to Piston",

                message:
                    error.message,
            });
        }
    }
);

// ============================================================
// PISTON RUNTIMES
// ============================================================

app.get(
    "/api/v2/runtimes",
    async (req, res) => {

        try {

            const pistonResponse =
                await fetch(
                    `${PISTON_URL}/api/v2/runtimes`
                );

            const data =
                await pistonResponse.json();

            return res
                .status(
                    pistonResponse.status
                )
                .json(data);

        } catch (error) {

            console.error(
                "❌ Failed to get Piston runtimes:",
                error.message
            );

            return res.status(500).json({
                error:
                    "Unable to connect to Piston",

                message:
                    error.message,
            });
        }
    }
);

// ============================================================
// SOCKET.IO
// ============================================================

const io = new Server(server, {
    cors: {
        origin: frontendURL,

        methods: [
            "GET",
            "POST",
        ],

        credentials: true,
    },
});

// ============================================================
// DATABASE SAVE DEBOUNCE
// ============================================================

const saveTimers = new Map();

const scheduleRoomSave = (
    roomId,
    code,
    language
) => {

    if (saveTimers.has(roomId)) {

        clearTimeout(
            saveTimers.get(roomId)
        );
    }

    const timer = setTimeout(
        async () => {

            try {

                await updateRoomCode(
                    roomId,
                    code,
                    language
                );

                console.log(
                    "💾 MongoDB autosave completed:",
                    roomId
                );

            } catch (error) {

                console.error(
                    "❌ MongoDB autosave failed:",
                    error.message
                );
            }

            saveTimers.delete(
                roomId
            );

        },
        700
    );

    saveTimers.set(
        roomId,
        timer
    );
};

// ============================================================
// FORCE SAVE
// ============================================================

const forceRoomSave = async (
    roomId,
    code,
    language
) => {

    if (!roomId) {
        return;
    }

    if (saveTimers.has(roomId)) {

        clearTimeout(
            saveTimers.get(roomId)
        );

        saveTimers.delete(
            roomId
        );
    }

    try {

        await updateRoomCode(
            roomId,
            code,
            language
        );

        console.log(
            "💾 MongoDB forced save:",
            roomId
        );

    } catch (error) {

        console.error(
            "❌ MongoDB forced save failed:",
            error.message
        );
    }
};

// ============================================================
// SOCKET CONNECTION
// ============================================================

io.on(
    "connection",
    (socket) => {

        console.log(
            "✅ New socket connected:",
            socket.id
        );

        // ====================================================
        // JOIN ROOM
        // ====================================================

        socket.on(
            "joinroom",
            async (data) => {

                try {

                    console.log(
                        "=========================================="
                    );

                    console.log(
                        "👤 JOIN ROOM"
                    );

                    console.log(
                        "Socket:",
                        socket.id
                    );

                    console.log(
                        "Data:",
                        data
                    );

                    // ------------------------------------------------
                    // Validate
                    // ------------------------------------------------

                    if (
                        !data ||
                        !data.roomId ||
                        !data.username
                    ) {

                        console.error(
                            "❌ Invalid joinroom data:",
                            data
                        );

                        return;
                    }

                    const {
                        roomId,
                        username,
                        avatar,
                    } = data;

                    // ------------------------------------------------
                    // Prevent duplicate join
                    // ------------------------------------------------

                    if (
                        socket.data.roomId ===
                        roomId
                    ) {

                        console.log(
                            "⚠️ Socket already in room:",
                            roomId
                        );

                        const existingRoom =
                            await Room.findOne({
                                roomId,
                            });

                        if (existingRoom) {

                            socket.emit(
                                "userList",
                                existingRoom.users
                            );

                            socket.emit(
                                "roomState",
                                {
                                    code:
                                        existingRoom.code,

                                    language:
                                        existingRoom.language,
                                }
                            );
                        }

                        return;
                    }

                    // ------------------------------------------------
                    // Leave previous room
                    // ------------------------------------------------

                    if (
                        socket.data.roomId
                    ) {

                        const oldRoomId =
                            socket.data.roomId;

                        console.log(
                            "🚪 Moving from old room:",
                            oldRoomId
                        );

                        const oldRoom =
                            await Room.findOne({
                                roomId:
                                    oldRoomId,
                            });

                        if (oldRoom) {

                            const oldUser =
                                oldRoom.users.find(
                                    (user) =>
                                        user.socketId ===
                                        socket.id
                                );

                            // Force save old room
                            await forceRoomSave(
                                oldRoomId,
                                oldRoom.code,
                                oldRoom.language
                            );

                            // Remove user
                            oldRoom.users =
                                oldRoom.users.filter(
                                    (user) =>
                                        user.socketId !==
                                        socket.id
                                );

                            await oldRoom.save();

                            socket.leave(
                                oldRoomId
                            );

                            io.to(
                                oldRoomId
                            ).emit(
                                "userList",
                                oldRoom.users
                            );

                            if (oldUser) {

                                io.to(
                                    oldRoomId
                                ).emit(
                                    "toast",
                                    `${oldUser.username} left the room`
                                );
                            }
                        }

                        socket.data.roomId =
                            null;
                    }

                    // ------------------------------------------------
                    // Find/create room
                    // ------------------------------------------------

                    const room =
                        await getOrCreateRoom(
                            roomId
                        );

                    console.log(
                        "🏠 Room loaded:",
                        room.roomId
                    );

                    console.log(
                        "📦 Current code length:",
                        room.code.length
                    );

                    // ------------------------------------------------
                    // Join Socket.IO room
                    // ------------------------------------------------

                    socket.join(
                        roomId
                    );

                    socket.data.roomId =
                        roomId;

                    socket.data.username =
                        username;

                    socket.data.avatar =
                        avatar || "";

                    // ------------------------------------------------
                    // Check duplicate socket
                    // ------------------------------------------------

                    const alreadyExists =
                        room.users.some(
                            (user) =>
                                user.socketId ===
                                socket.id
                        );

                    // ------------------------------------------------
                    // Add user
                    // ------------------------------------------------

                    if (
                        !alreadyExists
                    ) {

                        room.users.push({
                            socketId:
                                socket.id,

                            username:
                                username,

                            avatar:
                                avatar || "",
                        });

                        await room.save();

                        console.log(
                            "✅ User saved:",
                            username
                        );

                        socket
                            .to(roomId)
                            .emit(
                                "toast",
                                `${username} joined the room`
                            );
                    }

                    // ------------------------------------------------
                    // Send user list
                    // ------------------------------------------------

                    io.to(
                        roomId
                    ).emit(
                        "userList",
                        room.users
                    );

                    // ------------------------------------------------
                    // Send saved code
                    // ------------------------------------------------

                    socket.emit(
                        "roomState",
                        {
                            code:
                                room.code,

                            language:
                                room.language,
                        }
                    );

                    console.log(
                        "📤 Room state sent:",
                        {
                            roomId:
                                roomId,

                            username:
                                username,

                            codeLength:
                                room.code.length,

                            language:
                                room.language,
                        }
                    );

                    console.log(
                        "👥 Users:",
                        room.users.map(
                            (user) =>
                                user.username
                        )
                    );

                    console.log(
                        "=========================================="
                    );

                } catch (error) {

                    console.error(
                        "❌ Join room error:",
                        error
                    );

                    socket.emit(
                        "error",
                        {
                            message:
                                "Unable to join room",
                        }
                    );
                }
            }
        );

        socket.on("send", async (data) => {
    console.log("==========================================");
    console.log("📨 SEND EVENT RECEIVED");
    console.log("DATA FROM FRONTEND:");
    console.dir(data, { depth: null });

    try {
        if (!data) {
            console.error("❌ data is undefined");
            return;
        }

        const {
            roomId,
            msg,
            language,
            username,
        } = data;

        console.log("roomId:", roomId);
        console.log("username:", username);
        console.log("language:", language);
        console.log("code:", msg);
        console.log("code length:", msg?.length);

        if (!roomId) {
            console.error("❌ roomId missing");
            return;
        }

        if (typeof msg !== "string") {
            console.error("❌ msg is not a string");
            return;
        }

        // Find room
        const room = await Room.findOne({
            roomId,
        });

        if (!room) {
            console.error(
                "❌ ROOM NOT FOUND:",
                roomId
            );

            return;
        }

        console.log(
            "✅ ROOM FOUND:",
            room.roomId
        );

        // Update
        room.code = msg;

        if (language) {
            room.language = language;
        }

        // SAVE DIRECTLY
        await room.save();

        console.log(
            "✅ CODE SAVED TO MONGODB"
        );

        console.log({
            roomId: room.roomId,
            codeLength: room.code.length,
            language: room.language,
        });

        // Broadcast
        socket.to(roomId).emit(
            "receive",
            {
                msg: room.code,
                language: room.language,
            }
        );

        console.log(
            "📤 CODE BROADCASTED"
        );

    } catch (error) {
        console.error(
            "❌ SEND HANDLER ERROR:"
        );

        console.error(error);
    }

    console.log("==========================================");
});// ====================================================
        // CODE UPDATE
        // ====================================================






        // socket.on(
        //     "send",
        //     async (data) => {

        //         try {

        //             if (
        //                 !data ||
        //                 !data.roomId
        //             ) {

        //                 console.error(
        //                     "❌ Invalid send data:",
        //                     data
        //                 );

        //                 return;
        //             }

        //             const {
        //                 roomId,
        //                 msg,
        //                 language,
        //                 username,
        //             } = data;

        //             // ------------------------------------------------
        //             // Verify room
        //             // ------------------------------------------------

        //             const room =
        //                 await Room.findOne({
        //                     roomId,
        //                 });

        //             if (!room) {

        //                 console.warn(
        //                     "⚠️ Room does not exist:",
        //                     roomId
        //                 );

        //                 return;
        //             }

        //             // ------------------------------------------------
        //             // Update code
        //             // ------------------------------------------------

        //             if (
        //                 typeof msg ===
        //                 "string"
        //             ) {

        //                 room.code =
        //                     msg;
        //             }

        //             // ------------------------------------------------
        //             // Update language
        //             // ------------------------------------------------

        //             if (
        //                 language
        //             ) {

        //                 room.language =
        //                     language;
        //             }

        //             // ------------------------------------------------
        //             // Broadcast immediately
        //             // ------------------------------------------------

        //             socket
        //                 .to(roomId)
        //                 .emit(
        //                     "receive",
        //                     {
        //                         msg:
        //                             room.code,

        //                         language:
        //                             room.language,
        //                     }
        //                 );

        //             // ------------------------------------------------
        //             // Save after 700ms
        //             // ------------------------------------------------

        //             scheduleRoomSave(
        //                 roomId,
        //                 room.code,
        //                 room.language
        //             );

        //             console.log(
        //                 "📥 CODE UPDATE",
        //                 {
        //                     socketId:
        //                         socket.id,

        //                     username:
        //                         username,

        //                     roomId:
        //                         roomId,

        //                     language:
        //                         room.language,

        //                     codeLength:
        //                         room.code.length,
        //                 }
        //             );

        //         } catch (error) {

        //             console.error(
        //                 "❌ Code update error:",
        //                 error
        //             );
        //         }
        //     }
        // );

        // ====================================================
        // MANUAL LEAVE
        // ====================================================

        socket.on(
            "leaveRoom",
            async (data) => {

                try {

                    const roomId =
                        data?.roomId ||
                        socket.data.roomId;

                    if (!roomId) {
                        return;
                    }

                    console.log(
                        "🚪 MANUAL LEAVE:",
                        roomId
                    );

                    const room =
                        await Room.findOne({
                            roomId,
                        });

                    if (!room) {
                        return;
                    }

                    // ------------------------------------------------
                    // Save latest code
                    // ------------------------------------------------

                    await forceRoomSave(
                        roomId,
                        room.code,
                        room.language
                    );

                    // ------------------------------------------------
                    // Find user
                    // ------------------------------------------------

                    const user =
                        room.users.find(
                            (item) =>
                                item.socketId ===
                                socket.id
                        );

                    // ------------------------------------------------
                    // Remove user
                    // ------------------------------------------------

                    if (
                        removeUserFromRoom
                    ) {

                        await removeUserFromRoom(
                            roomId,
                            socket.id
                        );

                    } else {

                        room.users =
                            room.users.filter(
                                (item) =>
                                    item.socketId !==
                                    socket.id
                            );

                        await room.save();
                    }

                    // ------------------------------------------------
                    // Leave Socket.IO room
                    // ------------------------------------------------

                    socket.leave(
                        roomId
                    );

                    socket.data.roomId =
                        null;

                    console.log(
                        "👋 User left:",
                        user?.username
                    );

                    // ------------------------------------------------
                    // Get updated room
                    // ------------------------------------------------

                    const updatedRoom =
                        await Room.findOne({
                            roomId,
                        });

                    // ------------------------------------------------
                    // Notify users
                    // ------------------------------------------------

                    io.to(
                        roomId
                    ).emit(
                        "userList",
                        updatedRoom
                            ? updatedRoom.users
                            : []
                    );

                    if (user) {

                        io.to(
                            roomId
                        ).emit(
                            "toast",
                            `${user.username} left the room`
                        );
                    }

                } catch (error) {

                    console.error(
                        "❌ Leave room error:",
                        error
                    );
                }
            }
        );

        // ====================================================
        // DISCONNECT
        // ====================================================

        socket.on(
            "disconnect",
            async (reason) => {

                try {

                    const roomId =
                        socket.data.roomId;

                    const username =
                        socket.data.username;

                    console.log(
                        "🔌 DISCONNECT:",
                        {
                            socketId:
                                socket.id,

                            username:
                                username,

                            roomId:
                                roomId,

                            reason:
                                reason,
                        }
                    );

                    if (!roomId) {
                        return;
                    }

                    const room =
                        await Room.findOne({
                            roomId,
                        });

                    if (!room) {
                        return;
                    }

                    // ------------------------------------------------
                    // Check membership
                    // ------------------------------------------------

                    const wasMember =
                        room.users.some(
                            (user) =>
                                user.socketId ===
                                socket.id
                        );

                    if (!wasMember) {

                        console.log(
                            "ℹ️ User already removed:",
                            socket.id
                        );

                        return;
                    }

                    // ------------------------------------------------
                    // Save latest code
                    // ------------------------------------------------

                    await forceRoomSave(
                        roomId,
                        room.code,
                        room.language
                    );

                    // ------------------------------------------------
                    // Remove socket user
                    // ------------------------------------------------

                    if (
                        removeUserFromRoom
                    ) {

                        await removeUserFromRoom(
                            roomId,
                            socket.id
                        );

                    } else {

                        room.users =
                            room.users.filter(
                                (user) =>
                                    user.socketId !==
                                    socket.id
                            );

                        await room.save();
                    }

                    // ------------------------------------------------
                    // Get updated room
                    // ------------------------------------------------

                    const updatedRoom =
                        await Room.findOne({
                            roomId,
                        });

                    // ------------------------------------------------
                    // Notify remaining users
                    // ------------------------------------------------

                    io.to(
                        roomId
                    ).emit(
                        "userList",
                        updatedRoom
                            ? updatedRoom.users
                            : []
                    );

                    if (username) {

                        io.to(
                            roomId
                        ).emit(
                            "toast",
                            `${username} left the room`
                        );
                    }

                    console.log(
                        "📤 User removed after disconnect"
                    );

                } catch (error) {

                    console.error(
                        "❌ Disconnect error:",
                        error
                    );
                }
            }
        );

        // ====================================================
        // SOCKET ERROR
        // ====================================================

        socket.on(
            "error",
            (error) => {

                console.error(
                    "❌ Socket error:",
                    error
                );
            }
        );
    }
);

// ============================================================
// PRODUCTION REACT BUILD
// ============================================================

const buildPath =
    path.join(
        __dirname,
        "build"
    );

if (
    fs.existsSync(
        buildPath
    )
) {

    console.log(
        "📦 React build detected:",
        buildPath
    );

    app.use(
        express.static(
            buildPath
        )
    );

    app.get(
        "*",
        (req, res) => {

            res.sendFile(
                path.join(
                    buildPath,
                    "index.html"
                )
            );
        }
    );

} else {

    console.log(
        "⚠️ React build directory not found."
    );
}

// ============================================================
// 404 HANDLER
// ============================================================

app.use(
    (req, res) => {

        res.status(404).json({
            error:
                "Route not found",

            path:
                req.originalUrl,
        });
    }
);

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(
    (
        err,
        req,
        res,
        next
    ) => {

        console.error(
            "❌ Server error:",
            err
        );

        res.status(500).json({
            error:
                "Internal server error",

            message:
                err.message,
        });
    }
);

// ============================================================
// START SERVER
// ============================================================

const startServer =
    async () => {

        try {

            // ------------------------------------------------
            // Connect MongoDB FIRST
            // ------------------------------------------------

            await connectDB();

            const mongoose =
                require("mongoose");

            console.log(
                "=========================================="
            );

            console.log(
                "🍃 MongoDB CONNECTION VERIFIED"
            );

            console.log(
                "Host:",
                mongoose.connection.host
            );

            console.log(
                "Database:",
                mongoose.connection.name
            );

            console.log(
                "Collection:",
                Room.collection.name
            );

            console.log(
                "=========================================="
            );

            // ------------------------------------------------
            // Start HTTP server
            // ------------------------------------------------

            server.listen(
                PORT,
                () => {

                    console.log("");

                    console.log(
                        "=========================================="
                    );

                    console.log(
                        "🚀 SERVER STARTED"
                    );

                    console.log(
                        "=========================================="
                    );

                    console.log(
                        `🌐 Server: http://localhost:${PORT}`
                    );

                    console.log(
                        `❤️ Health: http://localhost:${PORT}/health`
                    );

                    console.log(
                        `🧪 MongoDB Test: http://localhost:${PORT}/test-db`
                    );

                    console.log(
                        `⚡ Execute: http://localhost:${PORT}/api/v2/execute`
                    );

                    console.log(
                        `📚 Runtimes: http://localhost:${PORT}/api/v2/runtimes`
                    );

                    console.log(
                        `🧠 Piston: ${PISTON_URL}`
                    );

                    console.log(
                        `🔐 CORS: ${frontendURL}`
                    );

                    console.log(
                        "🍃 Database: MongoDB Atlas"
                    );

                    console.log(
                        "📁 Collection:",
                        Room.collection.name
                    );

                    console.log(
                        "💾 Autosave: 700ms debounces"
                    );

                    console.log(
                        "=========================================="
                    );
                }
            );

        } catch (error) {

            console.error(
                "❌ Failed to start server:"
            );

            console.error(
                error
            );

            process.exit(1);
        }
    };

startServer();