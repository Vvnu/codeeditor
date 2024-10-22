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

const CodeEditor = ({ roomId }) => {
  const editorRef = useRef(null);
  const [value, setValue] = useState(CODE_SNIPPETS["python"]);
  const [language, setLanguage] = useState("python");
  const initialLoad = useRef(true);

  const debouncedSend = useCallback(
    debounce((value) => {
      socket.emit("send", { msg: value, roomId });
    }, 300), [roomId]
  );

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setValue(CODE_SNIPPETS[selectedLanguage]);
  };

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    debouncedSend(value);
  }, [value, debouncedSend]);

  useEffect(() => {
    socket.on("receive", (data) => {
      setValue(data.msg);
    });

    return () => {
      socket.off("receive");
    };
  }, []);

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
};

export default CodeEditor;
