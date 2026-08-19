import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const History = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();

  const [history, setHistory] = useState([]);

  // ============================================================
  // LOAD HISTORY
  // ============================================================

  useEffect(() => {
    if (!roomId) return;

    const saves = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (!key) continue;

      if (key.startsWith(`code_save_${roomId}_`)) {
        try {
          const rawData = localStorage.getItem(key);

          if (!rawData) continue;

          const data = JSON.parse(rawData);

          if (data) {
            saves.push({
              ...data,
              storageKey: key,
            });
          }
        } catch (error) {
          console.error("Failed to read save:", error);
        }
      }
    }

    // Newest first
    saves.sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    setHistory(saves);
  }, [roomId]);

  // ============================================================
  // RESTORE VERSION
  // ============================================================

  const loadVersion = (item) => {
    try {
      localStorage.setItem(
        `latest_save_${roomId}`,
        JSON.stringify(item)
      );

      toast.success("Version loaded successfully");

      navigate(`/editor/${roomId}`);
    } catch (error) {
      console.error("Load history error:", error);

      toast.error("Unable to load this version");
    }
  };

  // ============================================================
  // DELETE VERSION
  // ============================================================

  const deleteVersion = (item) => {
    try {
      localStorage.removeItem(item.storageKey);

      setHistory((previous) =>
        previous.filter(
          (save) => save.storageKey !== item.storageKey
        )
      );

      toast.success("History entry deleted");
    } catch (error) {
      console.error("Delete history error:", error);

      toast.error("Unable to delete history entry");
    }
  };

  // ============================================================
  // CLEAR HISTORY
  // ============================================================

  const clearHistory = () => {
    if (!history.length) {
      toast("History is already empty");
      return;
    }

    const confirmed = window.confirm(
      "Delete all saved versions for this room?"
    );

    if (!confirmed) return;

    try {
      history.forEach((item) => {
        localStorage.removeItem(item.storageKey);
      });

      setHistory([]);

      toast.success("History cleared");
    } catch (error) {
      console.error("Clear history error:", error);

      toast.error("Unable to clear history");
    }
  };

  // ============================================================
  // DATE FORMAT
  // ============================================================

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";

    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return "Unknown date";
    }
  };

  // ============================================================
  // LANGUAGE LABEL
  // ============================================================

  const getLanguageLabel = (language) => {
    if (!language) return "Unknown";

    return (
      language.charAt(0).toUpperCase() +
      language.slice(1)
    );
  };

  // ============================================================
  // FILE NAME
  // ============================================================

  const getFileName = (language) => {
    switch (language) {
      case "python":
        return "main.py";

      case "javascript":
        return "main.js";

      case "typescript":
        return "main.ts";

      case "java":
        return "Main.java";

      case "csharp":
        return "Program.cs";

      case "php":
        return "index.php";

      case "cpp":
        return "main.cpp";

      case "c":
        return "main.c";

      default:
        return "main.txt";
    }
  };

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#0d0d0f",
        color: "#f5f5f7",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", sans-serif',
        overflowX: "hidden",
      }}
    >

      {/* ========================================================
          MAC STYLE TOP BAR
      ======================================================== */}

      <header
        style={{
          height: "64px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 22px",
          boxSizing: "border-box",
          background:
            "linear-gradient(180deg, #19191c 0%, #121214 100%)",
          borderBottom: "1px solid #29292d",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >

        {/* LEFT SIDE */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
          }}
        >

          {/* MAC DOTS */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
            }}
          >
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#ff5f57",
                display: "block",
              }}
            />

            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#febc2e",
                display: "block",
              }}
            />

            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#28c840",
                display: "block",
              }}
            />
          </div>

          {/* BRAND */}

          <div
            style={{
              fontSize: "17px",
              fontWeight: "800",
              letterSpacing: "1px",
              color: "#ffffff",
            }}
          >
            VAAG
          </div>

          {/* SEPARATOR */}

          <div
            style={{
              width: "1px",
              height: "22px",
              background: "#303035",
            }}
          />

          {/* ROOM STATUS */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "#85858d",
            }}
          >

            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#32d74b",
                boxShadow: "0 0 8px rgba(50,215,75,0.6)",
              }}
            />

            <span>Room</span>

            <span
              style={{
                color: "#b5b5bd",
                fontFamily: "monospace",
              }}
            >
              {roomId?.slice(0, 12)}
            </span>

          </div>

        </div>

        {/* BACK BUTTON */}

        <button
          onClick={() => navigate(`/editor/${roomId}`)}
          style={{
            border: "1px solid #36363c",
            background: "#1c1c20",
            color: "#f2f2f5",
            padding: "9px 15px",
            borderRadius: "9px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#29292e";
            e.currentTarget.style.borderColor = "#55555d";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#1c1c20";
            e.currentTarget.style.borderColor = "#36363c";
          }}
        >
          ← Back to Editor
        </button>

      </header>


      {/* ========================================================
          MAIN CONTENT
      ======================================================== */}

      <main
        style={{
          width: "100%",
          maxWidth: "1250px",
          margin: "0 auto",
          padding: "45px 35px 70px",
          boxSizing: "border-box",
        }}
      >

        {/* ======================================================
            PAGE HEADER
        ====================================================== */}

        <section
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "25px",
            marginBottom: "35px",
          }}
        >

          {/* TITLE */}

          <div>

            <div
              style={{
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "2px",
                color: "#777780",
                marginBottom: "10px",
              }}
            >
              CODE HISTORY
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "36px",
                lineHeight: "1.1",
                fontWeight: "750",
                letterSpacing: "-1px",
                color: "#ffffff",
              }}
            >
              Saved Versions
            </h1>

            <p
              style={{
                margin: "12px 0 0",
                color: "#85858d",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              Browse and restore previously saved versions
              of your code.
            </p>

          </div>


          {/* HEADER ACTIONS */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >

            {/* COUNT */}

            <div
              style={{
                padding: "10px 15px",
                border: "1px solid #2c2c31",
                background: "#161619",
                borderRadius: "9px",
                fontSize: "13px",
                color: "#d4d4d8",
              }}
            >
              <strong
                style={{
                  color: "#ffffff",
                  fontSize: "15px",
                }}
              >
                {history.length}
              </strong>

              <span
                style={{
                  marginLeft: "5px",
                  color: "#777780",
                }}
              >
                {history.length === 1
                  ? "version"
                  : "versions"}
              </span>
            </div>


            {/* CLEAR */}

            <button
              onClick={clearHistory}
              disabled={!history.length}
              style={{
                border: "1px solid #4a2828",
                background: history.length
                  ? "#241617"
                  : "#161619",
                color: history.length
                  ? "#ff6961"
                  : "#55555c",
                padding: "10px 15px",
                borderRadius: "9px",
                cursor: history.length
                  ? "pointer"
                  : "not-allowed",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              Clear History
            </button>

          </div>

        </section>


        {/* ======================================================
            EMPTY STATE
        ====================================================== */}

        {history.length === 0 && (

          <div
            style={{
              width: "100%",
              minHeight: "400px",
              border: "1px solid #28282d",
              background:
                "linear-gradient(145deg, #141416, #101012)",
              borderRadius: "14px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          >

            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "16px",
                background: "#1d1d21",
                border: "1px solid #303035",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                marginBottom: "20px",
              }}
            >
              🕘
            </div>

            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "21px",
                fontWeight: "700",
              }}
            >
              No saved versions
            </h2>

            <p
              style={{
                margin: "0 0 22px",
                color: "#777780",
                fontSize: "14px",
              }}
            >
              Save your code from the editor and your
              versions will appear here.
            </p>

            <button
              onClick={() =>
                navigate(`/editor/${roomId}`)
              }
              style={{
                border: "1px solid #3b3b42",
                background: "#222226",
                color: "#ffffff",
                padding: "11px 18px",
                borderRadius: "9px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              ← Return to Editor
            </button>

          </div>

        )}


        {/* ======================================================
            HISTORY LIST
        ====================================================== */}

        {history.length > 0 && (

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >

            {history.map((item, index) => (

              <article
                key={item.storageKey}
                style={{
                  background: "#151517",
                  border: "1px solid #29292e",
                  borderRadius: "13px",
                  overflow: "hidden",
                  boxShadow:
                    "0 8px 30px rgba(0,0,0,0.18)",
                }}
              >

                {/* ==================================================
                    CARD HEADER
                ================================================== */}

                <div
                  style={{
                    minHeight: "82px",
                    padding: "16px 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "20px",
                    boxSizing: "border-box",
                    borderBottom: "1px solid #28282d",
                  }}
                >

                  {/* VERSION INFO */}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      minWidth: 0,
                    }}
                  >

                    {/* VERSION */}

                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        background: "#202024",
                        border: "1px solid #35353b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#a7a7af",
                        fontSize: "13px",
                        fontWeight: "700",
                        fontFamily: "monospace",
                        flexShrink: 0,
                      }}
                    >
                      v{history.length - index}
                    </div>


                    {/* FILE */}

                    <div
                      style={{
                        minWidth: 0,
                      }}
                    >

                      <h3
                        style={{
                          margin: "0 0 6px",
                          fontSize: "15px",
                          fontWeight: "700",
                          color: "#f4f4f6",
                        }}
                      >
                        {getFileName(item.language)}
                      </h3>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          flexWrap: "wrap",
                          fontSize: "11px",
                          color: "#6f6f77",
                        }}
                      >

                        <span
                          style={{
                            padding: "4px 7px",
                            borderRadius: "5px",
                            background: "#202024",
                            border: "1px solid #303036",
                            color: "#a8a8b0",
                            fontFamily: "monospace",
                          }}
                        >
                          {getLanguageLabel(item.language)}
                        </span>

                        <span>
                          {formatDate(item.timestamp)}
                        </span>

                        {item.username && (
                          <span>
                            by {item.username}
                          </span>
                        )}

                      </div>

                    </div>

                  </div>


                  {/* ACTIONS */}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexShrink: 0,
                    }}
                  >

                    <button
                      onClick={() =>
                        loadVersion(item)
                      }
                      style={{
                        border: "1px solid #315f3b",
                        background: "#17221a",
                        color: "#48d16b",
                        padding: "8px 13px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      ↻ Restore
                    </button>

                    <button
                      onClick={() =>
                        deleteVersion(item)
                      }
                      style={{
                        border: "1px solid #44292b",
                        background: "#211719",
                        color: "#ff6961",
                        padding: "8px 13px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      Delete
                    </button>

                  </div>

                </div>


                {/* ==================================================
                    CODE PREVIEW
                ================================================== */}

                <div
                  style={{
                    background: "#0d0d0f",
                  }}
                >

                  {/* CODE HEADER */}

                  <div
                    style={{
                      height: "38px",
                      padding: "0 15px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: "1px solid #242428",
                      color: "#686870",
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                  >

                    <span>
                      {getFileName(item.language)}
                    </span>

                    <span>
                      {item.code
                        ? `${item.code.length} characters`
                        : "Empty file"}
                    </span>

                  </div>


                  {/* CODE */}

                  <pre
                    style={{
                      margin: 0,
                      padding: "18px",
                      minHeight: "90px",
                      maxHeight: "360px",
                      overflow: "auto",
                      boxSizing: "border-box",
                      color: "#d7d7dc",
                      fontFamily:
                        '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
                      fontSize: "13px",
                      lineHeight: "1.65",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {item.code || "// Empty file"}
                  </pre>

                </div>

              </article>

            ))}

          </div>

        )}

      </main>

    </div>
  );
};

export default History;