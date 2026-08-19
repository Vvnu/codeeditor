import React, { useState } from "react";

import {
    Box,
    Button,
    Text,
    useToast,
} from "@chakra-ui/react";

import { executeCode } from "../api";

const Output = ({ editorRef, language }) => {

    const toast = useToast();

    const [output, setOutput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [hasRun, setHasRun] = useState(false);

    const runCode = async () => {

        const sourceCode =
            editorRef.current?.getValue();

        if (!sourceCode || !sourceCode.trim()) {

            toast({
                title: "No code",
                description:
                    "Write some code before running it.",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "bottom-right",
            });

            return;
        }

        try {

            setIsLoading(true);
            setIsError(false);
            setHasRun(true);
            setOutput("");

            console.log(
                "▶ Running:",
                language
            );

            const response =
                await executeCode(
                    language,
                    sourceCode
                );

            console.log(
                "Piston response:",
                response
            );

            const result =
                response?.run;

            if (!result) {
                throw new Error(
                    "Invalid response received from execution server."
                );
            }

            const stdout =
                result.stdout || "";

            const stderr =
                result.stderr || "";

            const compileOutput =
                result.output || "";

            /*
             * Piston can expose output through
             * stdout/stderr and some API wrappers
             * expose result.output.
             */

            if (stderr) {

                setIsError(true);
                setOutput(stderr);

            } else if (stdout) {

                setIsError(false);
                setOutput(stdout);

            } else if (compileOutput) {

                setIsError(false);
                setOutput(compileOutput);

            } else {

                setIsError(false);
                setOutput(
                    "Program finished successfully with no output."
                );
            }

        } catch (error) {

            console.error(
                "Execution error:",
                error
            );

            setIsError(true);
            setHasRun(true);

            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Unable to run code.";

            setOutput(message);

            toast({
                title: "Execution failed",
                description: message,
                status: "error",
                duration: 6000,
                isClosable: true,
                position: "bottom-right",
            });

        } finally {

            setIsLoading(false);

        }
    };

    return (
        <Box className="terminalOutput">

            {/* Hidden/compact execution button.
                The top Run button triggers this button. */}

            <Button
                id="run-code-button"
                onClick={runCode}
                isLoading={isLoading}
                loadingText="Running"
                className="hiddenRunButton"
            >
                Run
            </Button>

            {/* Terminal body */}

            <Box
                className={
                    isError
                        ? "terminalScreen terminalError"
                        : "terminalScreen"
                }
            >

                {!hasRun ? (

                    <Box className="terminalWelcome">

                        <Text className="terminalPrompt">
                            $
                        </Text>

                        <Text className="terminalHint">
                            Click Run to execute your code
                        </Text>

                    </Box>

                ) : (

                    <Box className="terminalResult">

                        <Box className="terminalCommand">

                            <Text className="terminalPrompt">
                                $
                            </Text>

                            <Text>
                                {language}
                            </Text>

                        </Box>

                        <Box className="terminalOutputText">

                            <Text
                                as="pre"
                                className="outputText"
                            >
                                {output}
                            </Text>

                        </Box>

                    </Box>

                )}

            </Box>

        </Box>
    );
};

export default Output;