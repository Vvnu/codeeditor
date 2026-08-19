import axios from "axios";
import { LANGUAGE_VERSIONS } from "./constants";

const API = axios.create({
    baseURL: "http://localhost:5000/api/v2",
});

export const executeCode = async (language, sourceCode) => {
    const response = await API.post("/execute", {
        language: language,
        version: LANGUAGE_VERSIONS[language],
        files: [
            {
                name: `main.${getFileExtension(language)}`,
                content: sourceCode,
            },
        ],
    });

    return response.data;
};

function getFileExtension(language) {
    const extensions = {
        javascript: "js",
        typescript: "ts",
        python: "py",
        java: "java",
        csharp: "cs",
        php: "php",
    };

    return extensions[language] || "txt";
}