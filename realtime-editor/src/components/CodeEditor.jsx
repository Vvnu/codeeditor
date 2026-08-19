import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import { Box, HStack, Button, Text, useToast } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import { useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";
import PropTypes from "prop-types";

import LanguageSelector from "./LanguageSelector";
import Output from "./Output";
import { CODE_SNIPPETS } from "../constants";
import { socket } from "../socket";

const CodeEditor = ({ roomId, username }) => {
    const navigate = useNavigate();
    const editorRef = useRef(null);

    const [value, setValue] = useState(
        CODE_SNIPPETS.python || ""
    );

    const [language, setLanguage] = useState("python");

    const [isReceivingUpdate, setIsReceivingUpdate] =
        useState(false);

    const toast = useToast();

    // =========================================================
    // SAVE CODE
    // =========================================================

    const saveCode = () => {
        try {
            const saveData = {
                code: value,
                language,
                roomId,
                username,
                timestamp: new Date().toISOString(),
            };

            const saveKey =
                `code_save_${roomId}_${Date.now()}`;

            localStorage.setItem(
                saveKey,
                JSON.stringify(saveData)
            );

            localStorage.setItem(
                `latest_save_${roomId}`,
                JSON.stringify(saveData)
            );

            toast({
                title: "Code Saved",
                description:
                    "Your latest code has been saved successfully.",
                status: "success",
                duration: 2000,
                isClosable: true,
                position: "bottom-right",
            });

        } catch (error) {
            console.error("Save error:", error);

            toast({
                title: "Save Failed",
                description:
                    "Could not save your code.",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "bottom-right",
            });
        }
    };

    // =========================================================
    // LOAD LATEST CODE (localStorage manual load)
    // =========================================================

    const loadLatestSave = () => {
        try {
            const saved = localStorage.getItem(
                `latest_save_${roomId}`
            );

            if (!saved) {
                toast({
                    title: "Nothing to Load",
                    description:
                        "No saved code exists for this room.",
                    status: "info",
                    duration: 2500,
                    isClosable: true,
                    position: "bottom-right",
                });

                return;
            }

            const data = JSON.parse(saved);

            setValue(data.code || "");

            if (data.language) {
                setLanguage(data.language);
            }

            toast({
                title: "Code Loaded",
                description:
                    "Latest saved version loaded.",
                status: "success",
                duration: 2000,
                isClosable: true,
                position: "bottom-right",
            });

        } catch (error) {
            console.error("Load error:", error);

            toast({
                title: "Load Failed",
                description:
                    "Could not load saved code.",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "bottom-right",
            });
        }
    };

    // =========================================================
    // SAVE HISTORY
    // =========================================================

    const showSaveHistory = () => {
        navigate(`/history/${roomId}`);
    };

    // =========================================================
    // SEND CODE TO OTHER USERS
    // =========================================================

    const debouncedSend = useCallback(
        debounce((newValue, currentLanguage) => {

            if (isReceivingUpdate) {
                return;
            }

            socket.emit("send", {
                msg: newValue,
                roomId,
                username,
                language: currentLanguage,
            });

            console.log("📤 Code synced");

        }, 500),
        [
            roomId,
            username,
            isReceivingUpdate,
        ]
    );

    // =========================================================
    // RECEIVE CODE FROM OTHER USERS (live edits)
    // =========================================================

    useEffect(() => {

        const handleReceive = (data) => {

            if (!data) {
                return;
            }

            setIsReceivingUpdate(true);

            if (typeof data.msg === "string") {
                setValue(data.msg);
            }

            if (data.language) {
                setLanguage(data.language);
            }

            setTimeout(() => {
                setIsReceivingUpdate(false);
            }, 100);

        };

        socket.on("receive", handleReceive);

        return () => {
            socket.off("receive", handleReceive);
        };

    }, []);

    // =========================================================
    // ROOM STATE FROM DATABASE (initial load / refresh)
    // FIX: server emits "roomState" on joinroom with the saved
    // code/language from MongoDB — this was never being consumed,
    // so refreshes always fell back to the default CODE_SNIPPETS.
    // =========================================================

    useEffect(() => {

        const handleRoomState = (data) => {

            if (!data) {
                return;
            }

            console.log("📥 roomState received:", {
                codeLength: data.code?.length || 0,
                language: data.language,
            });

            // Mark as receiving so this doesn't get
            // immediately re-broadcast via debouncedSend.
            setIsReceivingUpdate(true);

            if (typeof data.code === "string") {
                setValue(data.code);
            }

            if (data.language) {
                setLanguage(data.language);
            }

            setTimeout(() => {
                setIsReceivingUpdate(false);
            }, 100);

        };

        socket.on("roomState", handleRoomState);

        return () => {
            socket.off("roomState", handleRoomState);
        };

    }, []);

    // =========================================================
    // CLEAN DEBOUNCE
    // =========================================================

    useEffect(() => {

        return () => {
            debouncedSend.cancel();
        };

    }, [debouncedSend]);

    // =========================================================
    // EDITOR CHANGE
    // =========================================================

    const handleInputChange = (newValue) => {

        const nextValue = newValue || "";

        setValue(nextValue);

        if (!isReceivingUpdate) {
            debouncedSend(
                nextValue,
                language
            );
        }
    };

    // =========================================================
    // LANGUAGE CHANGE
    // =========================================================

    const onSelect = (selectedLanguage) => {

        setLanguage(selectedLanguage);

        const newCode =
            CODE_SNIPPETS[selectedLanguage] || "";

        setValue(newCode);

        socket.emit("send", {
            msg: newCode,
            roomId,
            username,
            language: selectedLanguage,
        });
    };

    // =========================================================
    // MONACO MOUNT
    // =========================================================

    const onMount = (editor) => {

        editorRef.current = editor;

        setTimeout(() => {
            editor.layout();
            editor.focus();
        }, 100);

    };

    // =========================================================
    // FILE EXTENSION
    // =========================================================

    const getFileExtension = () => {

        switch (language) {

            case "javascript":
                return "js";

            case "typescript":
                return "ts";

            case "python":
                return "py";

            case "java":
                return "java";

            case "csharp":
                return "cs";

            case "cpp":
                return "cpp";

            case "c":
                return "c";

            case "go":
                return "go";

            case "rust":
                return "rs";

            default:
                return language;
        }
    };

    return (
        <Box className="codeEditorRoot">

            {/* =================================================
                EDITOR TOOLBAR
            ================================================= */}

            <Box className="editorToolbar">

                <Box className="toolbarLeft">

                    <Box className="languageWrapper">

                        <LanguageSelector
                            language={language}
                            onSelect={onSelect}
                        />

                    </Box>

                </Box>

                <HStack
                    className="toolbarActions"
                    spacing={2}
                >

                    <Button
                        className="macActionButton runButton"
                        onClick={() => {
                            document
                                .getElementById(
                                    "run-code-button"
                                )
                                ?.click();
                        }}
                    >
                        <span className="buttonIcon">
                            ▶
                        </span>

                        Run
                    </Button>

                    <Button
                        className="macActionButton"
                        onClick={saveCode}
                    >
                        <span className="buttonIcon">
                            💾
                        </span>

                        Save
                    </Button>

                    <Button
                        className="macActionButton"
                        onClick={loadLatestSave}
                    >
                        <span className="buttonIcon">
                            📂
                        </span>

                        Load
                    </Button>

                    <Button
                        className="macActionButton"
                        onClick={showSaveHistory}
                    >
                        <span className="buttonIcon">
                            🕘
                        </span>

                        History
                    </Button>

                </HStack>

            </Box>

            {/* =================================================
                MAIN EDITOR + TERMINAL
            ================================================= */}

            <Box className="workspace">

                {/* ================= EDITOR ================= */}

                <Box className="editorPanel">

                    <Box className="panelHeader">

                        <Box className="panelHeaderLeft">

                            <Box className="trafficLights">
                                <span className="traffic red" />
                                <span className="traffic yellow" />
                                <span className="traffic green" />
                            </Box>

                            <Text className="panelTitle">
                                EDITOR
                            </Text>

                        </Box>

                        <Text className="fileName">
                            main.{getFileExtension()}
                        </Text>

                    </Box>

                    <Box className="monacoWrapper">

                        <Editor
                            height="100%"
                            width="100%"
                            theme="vs-dark"
                            language={language}
                            value={value}
                            onMount={onMount}
                            onChange={handleInputChange}

                            options={{

                                minimap: {
                                    enabled: false,
                                },

                                fontSize: 15,

                                fontFamily:
                                    "JetBrains Mono, Fira Code, Consolas, monospace",

                                lineNumbers: "on",

                                automaticLayout: true,

                                padding: {
                                    top: 16,
                                    bottom: 16,
                                },

                                scrollBeyondLastLine: false,

                                smoothScrolling: true,

                                cursorBlinking: "smooth",

                                renderWhitespace:
                                    "selection",

                                bracketPairColorization: {
                                    enabled: true,
                                },

                                guides: {
                                    indentation: true,
                                    bracketPairs: true,
                                },

                                wordWrap: "off",

                                tabSize: 4,

                                insertSpaces: true,

                                roundedSelection: false,

                                contextmenu: true,

                                folding: true,

                                renderLineHighlight:
                                    "line",

                                scrollbar: {
                                    verticalScrollbarSize: 10,
                                    horizontalScrollbarSize: 10,
                                },

                            }}
                        />

                    </Box>

                </Box>

                {/* ================= TERMINAL ================= */}

                <Box className="terminalPanel">

                    <Box className="panelHeader terminalPanelHeader">

                        <Box className="panelHeaderLeft">

                            <Text className="terminalDot">
                                ●
                            </Text>

                            <Text className="panelTitle">
                                TERMINAL
                            </Text>

                        </Box>

                        <Text className="terminalLanguage">
                            {language}
                        </Text>

                    </Box>

                    <Box className="terminalContent">

                        <Output
                            editorRef={editorRef}
                            language={language}
                        />

                    </Box>

                </Box>

            </Box>

        </Box>
    );
};

CodeEditor.propTypes = {
    roomId: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
};

export default CodeEditor;