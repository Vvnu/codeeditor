import React, { useState } from "react";
import { Box, Button, Text, useToast } from "@chakra-ui/react";
import { executeCode } from "../api";

const Output = ({ editorRef, language }) => {
  const toast = useToast();
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;
    try {
      setIsLoading(true);
      const { run: result } = await executeCode(language, sourceCode);
      setOutput(result.output.split("\n"));
      result.stderr ? setIsError(true) : setIsError(false);
    } catch (error) {
      console.log(error);
      toast({
        title: "An error occurred.",
        description: error.message || "Unable to run code",
        status: "error",
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box w="50%">
      <Text mb={6} fontSize="8xl" textColor="#ffffff" fontWeight="bold">
        Output
      </Text>
      <Button
        variant="solid"
        colorScheme="yellow"
        mb={4}
        isLoading={isLoading}
        onClick={runCode}
        _hover={{ bg: "#fff" }} // Change background color on hover
        _active={{ bg: "#" }} // Change background color on click
        _focus={{ outline: "none" }} // Remove focus outline
        border="1px solid"
        borderRadius="md" // Apply border radius
        boxShadow="md" // Apply box shadow
        px={4} // Apply padding on X-axis
        py={2} // Apply padding on Y-axis
        fontSize="md" // Set font size
        fontWeight="bold" // Set font weight
      >
        Run Code
      </Button>
      <Box
        height="100vh"
        p={3}
        color={isError ? "red.400" : ""}
        bg={isError ? "red.50" : "#4D4D4d"}
        border="5px solid"
        borderRadius={4}
        borderColor={isError ? "black.500" : "#000"}
        overflow="scroll" // Set overflow to scroll
      >
        {output
          ? output.map((line, i) => <Text key={i}>{line}</Text>)
          : 'Click "Run Code" to see the output here'}
      </Box>
    </Box>
  );
};

export default Output;
