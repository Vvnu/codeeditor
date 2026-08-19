import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import CodeEditor from "../components/CodeEditor";
import { socket } from "../socket";

const EditorPage = ({ username, avatar }) => {
    const navigate = useNavigate();
    const { roomId: paramRoomId } = useParams();

    const [clients, setClients] = useState([]);

    // =========================================================
    // SOCKET / ROOM
    // =========================================================

    useEffect(() => {
        if (!username || !paramRoomId) {
            console.warn("Missing username or room ID:", {
                username,
                paramRoomId,
            });

            return;
        }

        console.log("🚀 EditorPage joining room:", {
            username,
            avatar,
            roomId: paramRoomId,
            socketId: socket.id,
        });

        // -----------------------------------------------------
        // USER LIST
        // -----------------------------------------------------

        const handleUserList = (users) => {
            console.log("👥 Received user list:", users);

            setClients(
                Array.isArray(users)
                    ? users
                    : []
            );
        };

        // -----------------------------------------------------
        // TOAST
        // -----------------------------------------------------

        const handleToast = (message) => {
            console.log("🍞 Toast received:", message);

            toast.success(message, {
                duration: 2500,
                position: "bottom-right",
            });
        };

        // -----------------------------------------------------
        // SOCKET ERROR
        // -----------------------------------------------------

        const handleSocketError = (error) => {
            console.error(
                "❌ Socket error:",
                error
            );
        };

        // -----------------------------------------------------
        // REGISTER LISTENERS FIRST
        // -----------------------------------------------------

        socket.on(
            "userList",
            handleUserList
        );

        socket.on(
            "toast",
            handleToast
        );

        socket.on(
            "error",
            handleSocketError
        );

        // -----------------------------------------------------
        // JOIN ROOM
        // -----------------------------------------------------

        socket.emit(
            "joinroom",
            {
                username,
                avatar,
                roomId: paramRoomId,
            }
        );

        console.log(
            "📤 joinroom emitted"
        );

        // -----------------------------------------------------
        // CLEANUP
        // -----------------------------------------------------

        return () => {
            console.log(
                "🧹 Removing EditorPage socket listeners"
            );

            socket.off(
                "userList",
                handleUserList
            );

            socket.off(
                "toast",
                handleToast
            );

            socket.off(
                "error",
                handleSocketError
            );
        };
    }, [
        username,
        avatar,
        paramRoomId,
    ]);

    // =========================================================
    // COPY ROOM ID
    // =========================================================

    const copyRoomId = async () => {
        if (!paramRoomId) {
            return;
        }

        try {
            if (
                navigator.clipboard &&
                window.isSecureContext
            ) {
                await navigator.clipboard.writeText(
                    paramRoomId
                );
            } else {
                const textArea =
                    document.createElement(
                        "textarea"
                    );

                textArea.value =
                    paramRoomId;

                textArea.style.position =
                    "fixed";

                textArea.style.left =
                    "-999999px";

                textArea.style.top =
                    "0";

                document.body.appendChild(
                    textArea
                );

                textArea.focus();
                textArea.select();

                document.execCommand(
                    "copy"
                );

                textArea.remove();
            }

            toast.success(
                "Room ID copied",
                {
                    duration: 2000,
                    position: "bottom-right",
                }
            );
        } catch (error) {
            console.error(
                "❌ Copy failed:",
                error
            );

            toast.error(
                "Failed to copy Room ID",
                {
                    duration: 2500,
                    position: "bottom-right",
                }
            );
        }
    };

    // =========================================================
    // LEAVE ROOM
    // =========================================================

    const handleLeaveClick = () => {
        const confirmed =
            window.confirm(
                "Do you want to leave this room?"
            );

        if (!confirmed) {
            return;
        }

        console.log(
            "🚪 Leaving room:",
            paramRoomId
        );

        socket.emit(
            "leaveRoom",
            {
                username,
                avatar,
                roomId: paramRoomId,
            }
        );

        navigate("/");
    };

    // =========================================================
    // AVATAR FALLBACK
    // =========================================================

    const getInitial = (name) => {
        return (
            name
                ?.charAt(0)
                ?.toUpperCase() ||
            "?"
        );
    };

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="editorPage">

            {/* =================================================
                LEFT SIDEBAR
            ================================================= */}

            <aside className="peopleSidebar">

                {/* SIDEBAR HEADER */}

                <div className="sidebarHeader">

                    <div className="trafficLights">

                        <span className="traffic red" />

                        <span className="traffic yellow" />

                        <span className="traffic green" />

                    </div>

                    <div className="peopleTitle">

                        <span className="peopleIcon">
                            👥
                        </span>

                        PEOPLE

                    </div>

                </div>

                {/* ROOM */}

                <div className="sidebarSection">

                    <div className="sidebarSectionTitle">
                        ROOM
                    </div>

                    <div className="roomBox">

                        <span className="roomText">
                            {paramRoomId
                                ? paramRoomId.slice(
                                      0,
                                      12
                                  )
                                : "--------"}
                        </span>

                        <button
                            className="roomCopyButton"
                            onClick={
                                copyRoomId
                            }
                            title="Copy Room ID"
                        >
                            ⧉
                        </button>

                    </div>

                </div>

                {/* COLLABORATORS */}

                <div className="sidebarSection collaboratorsSection">

                    <div className="collaboratorsTitle">

                        <span>
                            COLLABORATORS
                        </span>

                        <span className="countBadge">
                            {clients.length}
                        </span>

                    </div>

                    <div className="clientsLists">

                        {clients.length === 0 ? (
                            <div className="emptyCollaborators">
                                No collaborators
                            </div>
                        ) : (
                            clients.map(
                                (
                                    client,
                                    index
                                ) => (
                                    <div
                                        className="clientRow"
                                        key={
                                            client.socketId ||
                                            `${client.username}-${index}`
                                        }
                                    >

                                        <div className="clientAvatarWrapper">

                                            <span className="onlineDot" />

                                            {client.avatar ? (
                                                <img
                                                    src={
                                                        client.avatar
                                                    }
                                                    alt={
                                                        client.username
                                                    }
                                                    className="clientAvatar"
                                                />
                                            ) : (
                                                <div className="clientAvatarFallback">
                                                    {getInitial(
                                                        client.username
                                                    )}
                                                </div>
                                            )}

                                        </div>

                                        <div className="clientInfo">

                                            <span className="clientName">
                                                {
                                                    client.username
                                                }
                                            </span>

                                            {client.username ===
                                                username && (
                                                <span className="youBadge">
                                                    YOU
                                                </span>
                                            )}

                                        </div>

                                    </div>
                                )
                            )
                        )}

                    </div>

                </div>

                {/* SIDEBAR BOTTOM */}

                <div className="sidebarBottom">

                    <div className="connectionStatus">

                        <span className="statusDot" />

                        <span>
                            Connected
                        </span>

                    </div>

                    <button
                        className="sidebarButton"
                        onClick={
                            copyRoomId
                        }
                    >
                        <span>
                            🔗
                        </span>

                        Copy Room ID
                    </button>

                    <button
                        className="sidebarLeaveButton"
                        onClick={
                            handleLeaveClick
                        }
                    >
                        <span>
                            ⎋
                        </span>

                        Leave Room
                    </button>

                </div>

            </aside>

            {/* =================================================
                MAIN APPLICATION
            ================================================= */}

            <main className="editorMain">

                {/* MAIN HEADER */}

                <header className="mainHeader">

                    <div className="mainHeaderLeft">

                        <div className="headerBrand">
                            VAAG
                        </div>

                        <div className="headerRoom">

                            <span className="headerStatusDot" />

                            Room{" "}

                            {paramRoomId
                                ? paramRoomId.slice(
                                      0,
                                      8
                                  )
                                : "--------"}

                        </div>

                    </div>

                    <button
                        className="shareButton"
                        onClick={
                            copyRoomId
                        }
                    >
                        🔗 Share
                    </button>

                </header>

                {/* =================================================
                    CODE EDITOR
                ================================================= */}

                <div className="codeEditorContainer">

                    <CodeEditor
                        roomId={paramRoomId}
                        username={username}
                    />

                </div>

                {/* =================================================
                    STATUS BAR
                ================================================= */}

                <footer className="editorStatusBar">

                    <div className="statusLeft">

                        <div className="connectionStatus">

                            <span className="statusDot" />

                            Connected

                        </div>

                        <span className="statusSeparator">
                            |
                        </span>

                        <span>
                            {clients.length}{" "}
                            collaborator
                            {clients.length !==
                            1
                                ? "s"
                                : ""}
                        </span>

                    </div>

                    <div className="statusRight">

                        <span>
                            ● Live
                        </span>

                    </div>

                </footer>

            </main>

        </div>
    );
};

export default EditorPage;