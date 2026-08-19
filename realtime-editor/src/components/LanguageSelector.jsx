import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

const LANGUAGES = [
  {
    value: "javascript",
    label: "JavaScript",
    version: "18.15.0",
    icon: "JS",
  },
  {
    value: "typescript",
    label: "TypeScript",
    version: "5.0.3",
    icon: "TS",
  },
  {
    value: "python",
    label: "Python",
    version: "3.12.0",
    icon: "PY",
  },
  {
    value: "java",
    label: "Java",
    version: "15.0.2",
    icon: "☕",
  },
  {
    value: "csharp",
    label: "C#",
    version: "6.12.0",
    icon: "C#",
  },
  {
    value: "php",
    label: "PHP",
    version: "8.2.3",
    icon: "PHP",
  },
];

const LanguageSelector = ({ language, onSelect }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedLanguage =
    LANGUAGES.find((item) => item.value === language) || LANGUAGES[2];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (value) => {
    onSelect(value);
    setOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "relative",
        width: "190px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        zIndex: 1000,
      }}
    >
      {/* SELECTED LANGUAGE */}
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        style={{
          width: "100%",
          height: "38px",
          padding: "0 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",

          background: "#1c1c1f",
          border: open
            ? "1px solid #8b5cf6"
            : "1px solid #343438",
          borderRadius: "8px",

          color: "#f5f5f7",
          fontSize: "13px",
          fontWeight: "500",

          cursor: "pointer",
          outline: "none",

          boxShadow: open
            ? "0 0 0 3px rgba(139, 92, 246, 0.12)"
            : "none",

          transition:
            "border-color 0.15s ease, box-shadow 0.15s ease",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
          }}
        >
          <span
            style={{
              width: "23px",
              height: "23px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              borderRadius: "6px",

              background:
                selectedLanguage.value === "python"
                  ? "#3776ab"
                  : selectedLanguage.value === "javascript"
                  ? "#f7df1e"
                  : selectedLanguage.value === "typescript"
                  ? "#3178c6"
                  : selectedLanguage.value === "java"
                  ? "#ed8b00"
                  : selectedLanguage.value === "csharp"
                  ? "#68217a"
                  : "#777bb4",

              color:
                selectedLanguage.value === "javascript"
                  ? "#111"
                  : "#fff",

              fontSize: "9px",
              fontWeight: "800",
            }}
          >
            {selectedLanguage.icon}
          </span>

          <span>{selectedLanguage.label}</span>
        </span>

        <span
          style={{
            fontSize: "11px",
            color: "#8e8e93",
            transform: open
              ? "rotate(180deg)"
              : "rotate(0deg)",
            transition: "transform 0.15s ease",
          }}
        >
          ▼
        </span>
      </button>

      {/* CUSTOM DARK DROPDOWN */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            width: "100%",

            background: "#1c1c1f",
            border: "1px solid #38383d",
            borderRadius: "9px",

            padding: "5px",

            boxShadow:
              "0 14px 35px rgba(0, 0, 0, 0.55), 0 4px 12px rgba(0, 0, 0, 0.35)",

            overflow: "hidden",
          }}
        >
          {LANGUAGES.map((item) => {
            const isSelected = item.value === language;

            return (
              <button
                type="button"
                key={item.value}
                onClick={() => handleSelect(item.value)}
                onMouseEnter={(event) => {
                  if (!isSelected) {
                    event.currentTarget.style.background =
                      "#29292e";
                  }
                }}
                onMouseLeave={(event) => {
                  if (!isSelected) {
                    event.currentTarget.style.background =
                      "transparent";
                  }
                }}
                style={{
                  width: "100%",
                  minHeight: "48px",

                  display: "flex",
                  alignItems: "center",

                  padding: "7px 9px",
                  margin: 0,

                  background: isSelected
                    ? "rgba(139, 92, 246, 0.14)"
                    : "transparent",

                  border: "none",
                  borderRadius: "6px",

                  color: "#f5f5f7",

                  cursor: "pointer",
                  textAlign: "left",

                  transition:
                    "background 0.12s ease",
                }}
              >
                {/* LANGUAGE ICON */}
                <span
                  style={{
                    width: "30px",
                    height: "30px",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    marginRight: "10px",

                    borderRadius: "7px",

                    background:
                      item.value === "python"
                        ? "#3776ab"
                        : item.value === "javascript"
                        ? "#f7df1e"
                        : item.value === "typescript"
                        ? "#3178c6"
                        : item.value === "java"
                        ? "#ed8b00"
                        : item.value === "csharp"
                        ? "#68217a"
                        : "#777bb4",

                    color:
                      item.value === "javascript"
                        ? "#111"
                        : "#fff",

                    fontSize: "10px",
                    fontWeight: "800",

                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </span>

                {/* LANGUAGE NAME + VERSION */}
                <span
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      lineHeight: "18px",
                      color: "#f5f5f7",
                    }}
                  >
                    {item.label}
                  </span>

                  <span
                    style={{
                      fontSize: "10px",
                      lineHeight: "14px",
                      color: "#77777f",
                    }}
                  >
                    {item.version}
                  </span>
                </span>

                {/* CHECK MARK */}
                {isSelected && (
                  <span
                    style={{
                      color: "#8b5cf6",
                      fontSize: "15px",
                      fontWeight: "700",
                      marginLeft: "8px",
                    }}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

LanguageSelector.propTypes = {
  language: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default LanguageSelector;