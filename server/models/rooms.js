const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// ============================================================
// LOAD ENVIRONMENT VARIABLES
// ============================================================

dotenv.config({
    path: path.join(__dirname, "..", "atlas-credentials.env"),
});
// ============================================================
// MONGODB CONNECTION
// ============================================================

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error(
                "MONGODB_URI is missing from atlas-credentials.env"
            );
        }

        console.log("==========================================");
        console.log("🍃 Connecting to MongoDB Atlas...");
        console.log("==========================================");

        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 10000,
        });

        console.log("==========================================");
        console.log("✅ MongoDB Atlas Connected");
        console.log("==========================================");
        console.log("Host:", mongoose.connection.host);
        console.log("Port:", mongoose.connection.port);
        console.log("Database:", mongoose.connection.name);
        console.log("Ready State:", mongoose.connection.readyState);
        console.log("==========================================");

        // Connection event listeners
        mongoose.connection.on("error", (error) => {
            console.error("❌ MongoDB connection error:", error);
        });

        mongoose.connection.on("disconnected", () => {
            console.log("⚠️ MongoDB disconnected");
        });

        mongoose.connection.on("reconnected", () => {
            console.log("🔄 MongoDB reconnected");
        });

    } catch (error) {
        console.error("==========================================");
        console.error("❌ MongoDB connection FAILED");
        console.error("==========================================");
        console.error(error.message);
        console.error("==========================================");

        throw error;
    }
};

// ============================================================
// USER SUB-SCHEMA
// ============================================================

const userSchema = new mongoose.Schema(
    {
        socketId: {
            type: String,
            required: true,
        },

        username: {
            type: String,
            required: true,
        },

        avatar: {
            type: String,
            default: "",
        },
    },
    {
        _id: false,
    }
);

// ============================================================
// ROOM SCHEMA
// ============================================================
const roomSchema = new mongoose.Schema(
    {
        roomId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        code: {
            type: String,
            default: "",
        },

        language: {
            type: String,
            default: "python",
        },

        users: [
            {
                socketId: {
                    type: String,
                    required: true,
                },

                username: {
                    type: String,
                    required: true,
                },

                avatar: {
                    type: String,
                    default: "",
                },
            },
        ],
    },
    {
        collection: "rooms",
        timestamps: true,
    }
);

// ============================================================
// UPDATE TIMESTAMP
// ============================================================


// ============================================================
// MODEL
// ============================================================

const Room =
    mongoose.models.Room ||
    mongoose.model("Room", roomSchema);

// ============================================================
// GET OR CREATE ROOM
// ============================================================

const getOrCreateRoom = async (roomId) => {
    if (!roomId) {
        throw new Error("Room ID is required");
    }

    console.log("🔎 Looking for room:", roomId);

    let room = await Room.findOne({
        roomId,
    });

    if (!room) {
        console.log(
            "🏠 Room does not exist. Creating:",
            roomId
        );

        room = new Room({
            roomId,
            code: "",
            language: "python",
            users: [],
        });

        await room.save();

        console.log(
            "✅ NEW ROOM SAVED TO MONGODB"
        );

        console.log({
            id: room._id.toString(),
            roomId: room.roomId,
            database: mongoose.connection.name,
            collection: Room.collection.name,
        });

    } else {
        console.log(
            "🏠 Existing room found:",
            roomId
        );
    }

    return room;
};

// ============================================================
// UPDATE ROOM CODE
// ============================================================

const updateRoomCode = async (
    roomId,
    code,
    language
) => {
    if (!roomId) {
        throw new Error("Room ID is required");
    }

    const updateData = {
        code:
            typeof code === "string"
                ? code
                : "",
        updatedAt: new Date(),
    };

    if (language) {
        updateData.language = language;
    }

    const room =
        await Room.findOneAndUpdate(
            {
                roomId,
            },
            {
                $set: updateData,
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
            }
        );

    console.log(
        "💾 ROOM SAVED TO MONGODB"
    );

    console.log({
        roomId,
        database: mongoose.connection.name,
        collection: Room.collection.name,
        codeLength: room.code.length,
        language: room.language,
    });

    return room;
};

// ============================================================
// REMOVE USER
// ============================================================

const removeUserFromRoom = async (
    roomId,
    socketId
) => {
    if (!roomId || !socketId) {
        return null;
    }

    const room =
        await Room.findOneAndUpdate(
            {
                roomId,
            },
            {
                $pull: {
                    users: {
                        socketId,
                    },
                },
                $set: {
                    updatedAt: new Date(),
                },
            },
            {
                new: true,
            }
        );

    if (room) {
        console.log(
            "👤 User removed from room:",
            socketId
        );
    }

    return room;
};

// ============================================================
// GET ROOM
// ============================================================

const getRoom = async (roomId) => {
    if (!roomId) {
        return null;
    }

    return await Room.findOne({
        roomId,
    });
};

// ============================================================
// DATABASE TEST
// ============================================================

const testDatabase = async () => {
    console.log("==========================================");
    console.log("🧪 TESTING MONGODB");
    console.log("==========================================");

    console.log(
        "Database:",
        mongoose.connection.name
    );

    console.log(
        "Collection:",
        Room.collection.name
    );

    const testRoom = await Room.findOne({
        roomId: "__DATABASE_TEST_ROOM__",
    });

    if (!testRoom) {
        const created =
            await Room.create({
                roomId:
                    "__DATABASE_TEST_ROOM__",
                code:
                    "// MongoDB connection test",
                language:
                    "javascript",
                users: [],
            });

        console.log(
            "✅ DATABASE WRITE TEST PASSED"
        );

        console.log({
            id: created._id.toString(),
            roomId: created.roomId,
            database:
                mongoose.connection.name,
            collection:
                Room.collection.name,
        });

        await Room.deleteOne({
            _id: created._id,
        });

        console.log(
            "🧹 Test document removed"
        );
    } else {
        console.log(
            "✅ Database test document already exists"
        );
    }

    const count =
        await Room.countDocuments();

    console.log(
        "Current rooms count:",
        count
    );

    console.log("==========================================");
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
    Room,
    connectDB,
    getOrCreateRoom,
    updateRoomCode,
    removeUserFromRoom,
    getRoom,
    testDatabase,
};