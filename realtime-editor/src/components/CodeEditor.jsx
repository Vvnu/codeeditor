import { useCallback, useEffect, useRef, useState, } from "react";
import { Box, HStack } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "../constants";
import Output from "./Output";
import { socket } from "../socket";
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
// import stripAnsi from 'strip-ansi'; // Add this line if you need stripAnsi

const CodeEditor = ({ roomId, username }) => {
  const editorRef = useRef(null);
  const [value, setValue] = useState(CODE_SNIPPETS["python"]);
  const [language, setLanguage] = useState("python");
  const initialLoad = useRef(true);
  const isReceivingUpdate = useRef(false);

  console.log('📝 CodeEditor mounted with:', { roomId, username });

  const debouncedSend = useCallback(
    debounce((value) => {
      if (!isReceivingUpdate.current) {
        const data = { msg: value, roomId, username };
        console.log('📤 Sending code update:', data);
        socket.emit("send", data);
      } else {
        console.log('⏸️ Skipping send - currently receiving update');
      }
    }, 300), [roomId, username]
  );

  const onMount = (editor) => {
    console.log('🎯 Editor mounted');
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (selectedLanguage) => {
    console.log('🔤 Language changed to:', selectedLanguage);
    setLanguage(selectedLanguage);
    setValue(CODE_SNIPPETS[selectedLanguage]);
    // Send language change to other users
    const data = { 
      msg: CODE_SNIPPETS[selectedLanguage], 
      roomId, 
      username,
      language: selectedLanguage 
    };
    console.log('📤 Sending language change:', data);
    socket.emit("send", data);
  };

  useEffect(() => {
    if (initialLoad.current) {
      console.log('🚫 Skipping initial send');
      initialLoad.current = false;
      return;
    }
    console.log('📝 Value changed, triggering debounced send');
    debouncedSend(value);
  }, [value, debouncedSend]);

  useEffect(() => {
    console.log('🎧 Setting up receive listener for room:', roomId);
    
    socket.on("receive", (data) => {
      console.log('📥 Received code update:', data);
      isReceivingUpdate.current = true;
      setValue(data.msg);
      
      // Update language if it was changed by another user
      if (data.language) {
        console.log('🔤 Updating language to:', data.language);
        setLanguage(data.language);
      }
      
      // Reset the flag after a short delay
      setTimeout(() => {
        isReceivingUpdate.current = false;
        console.log('✅ Reset receiving flag');
      }, 100);
    });

    return () => {
      console.log('🧹 Cleaning up receive listener');
      socket.off("receive");
    };
  }, [roomId]);

  const handleInputChange = (newValue) => {
    setValue(newValue);
  };

  return (
    <Box>
      <HStack spacing={4}>
        <Box w="50%">
          <LanguageSelector language={language} onSelect={onSelect} />
          <Editor
            options={{ minimap: { enabled: false } }}
            height="100vh"
            theme="vs-dark"
            language={language}
            defaultValue={CODE_SNIPPETS[language]}
            value={value}
            onMount={onMount}
            onChange={(newValue) => handleInputChange(newValue)}
          />
        </Box>
        <Output editorRef={editorRef} language={language} />
      </HStack>
    </Box>
  );
};

CodeEditor.propTypes = {
  roomId: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
};

export default CodeEditor;
