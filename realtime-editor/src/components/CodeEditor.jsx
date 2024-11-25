import { useCallback, useEffect, useRef, useState } from "react";
import { Box, HStack } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "../constants";
import Output from "./Output";
import { socket } from "../socket";
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';

const CodeEditor = ({ roomId, username, onTyping, onSendMessage }) => {
  const editorRef = useRef(null);
  const [value, setValue] = useState(CODE_SNIPPETS["python"]);
  const [language, setLanguage] = useState("python");
  const initialLoad = useRef(true);

  // Debounced function to send code changes to the server
  const debouncedSend = useCallback(
    debounce((value) => {
      socket.emit("send", { msg: value, roomId }); // Emit to server with roomId and code
    }, 300), [roomId]
  );

  const handleInputChange = (newValue) => {
    setValue(newValue); // Update state with the new code
    debouncedSend(newValue); // Trigger debounced send when code is changed
  };

  // Handle language selection
  const onSelect = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setValue(CODE_SNIPPETS[selectedLanguage]); // Set default code for the selected language
  };

  // Trigger the debounced send when code is changed
  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return; // Skip first load
    }
    debouncedSend(value); // Send the current code to the server
  }, [value, debouncedSend]);

  // Handle receiving code changes from other users in the room
  useEffect(() => {
    socket.on("receive", (data) => {
      // Update the editor with the received code
      setValue(data.msg);
    });

    return () => {
      socket.off("receive");
    };
  }, []);

  return (
    <Box>
      <HStack spacing={4}>
        <Box w="50%">
          <LanguageSelector language={language} onSelect={onSelect} />
          <Editor
            options={{ minimap: { enabled: false } }} // Disable minimap for better view
            height="100vh" // Full screen editor
            theme="vs-dark" // Editor theme
            language={language} // Set editor language
            value={value} // Current code value
            onChange={handleInputChange} // Handle value change
          />
        </Box>
        <Output editorRef={editorRef} language={language} />
      </HStack>
    </Box>
  );
};

CodeEditor.propTypes = {
  roomId: PropTypes.string.isRequired, // Prop to ensure roomId is passed
};

export default CodeEditor;
