import { useCallback, useEffect, useRef, useState, } from "react";
import { useNavigate } from "react-router-dom";
import { Box, HStack, Button, useToast, Center } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "../constants";
import Output from "./Output";
import { socket } from "../socket";
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
// import stripAnsi from 'strip-ansi'; // Add this line if you need stripAnsi

const CodeEditor = ({ roomId, username }) => {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [value, setValue] = useState(CODE_SNIPPETS["python"]);
  const [language, setLanguage] = useState("python");
  const [savedVersions, setSavedVersions] = useState([]);
  const initialLoad = useRef(true);
  const isReceivingUpdate = useRef(false);
  const toast = useToast();

  console.log('📝 CodeEditor mounted with:', { roomId, username });

  // Get all saved versions for this room
  const getSavedVersions = () => {
    const versions = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`code_save_${roomId}_`)) {
        try {
          const savedData = JSON.parse(localStorage.getItem(key));
          versions.push({
            key: key,
            ...savedData
          });
        } catch (error) {
          console.error('Error parsing saved version:', error);
        }
      }
    }
    // Sort by timestamp (newest first)
    return versions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  // Load a specific saved version
  const loadVersion = (savedData) => {
    try {
      setValue(savedData.code);
      setLanguage(savedData.language);
      
      toast({
        title: "Version Loaded!",
        description: `Loaded code from ${new Date(savedData.timestamp).toLocaleString()}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      console.log('📂 Loaded specific version:', savedData);
    } catch (error) {
      console.error('❌ Error loading version:', error);
      toast({
        title: "Load Failed",
        description: "Could not load this version",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Delete a saved version
  const deleteVersion = (key) => {
    try {
      localStorage.removeItem(key);
      setSavedVersions(getSavedVersions());
      
      toast({
        title: "Version Deleted!",
        description: "Saved version has been removed",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('❌ Error deleting version:', error);
      toast({
        title: "Delete Failed",
        description: "Could not delete this version",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Check for version to load from sessionStorage
  useEffect(() => {
    const loadVersionData = sessionStorage.getItem('loadVersion');
    if (loadVersionData) {
      try {
        const savedData = JSON.parse(loadVersionData);
        setValue(savedData.code);
        setLanguage(savedData.language);
        
        toast({
          title: "Version Loaded!",
          description: `Loaded code from ${new Date(savedData.timestamp).toLocaleString()}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Clear the sessionStorage
        sessionStorage.removeItem('loadVersion');
        console.log('📂 Loaded version from sessionStorage:', savedData);
      } catch (error) {
        console.error('❌ Error loading version from sessionStorage:', error);
        sessionStorage.removeItem('loadVersion');
      }
    }
  }, [toast]);

  // Save code to localStorage
  const saveCode = () => {
    try {
      const saveData = {
        code: value,
        language: language,
        roomId: roomId,
        timestamp: new Date().toISOString(),
        username: username
      };
      
      // Create a unique key for this save
      const saveKey = `code_save_${roomId}_${Date.now()}`;
      
      // Save to localStorage
      localStorage.setItem(saveKey, JSON.stringify(saveData));
      
      // Also save the latest save for this room
      localStorage.setItem(`latest_save_${roomId}`, JSON.stringify(saveData));
      
      toast({
        title: "Code Saved!",
        description: `Code saved to localStorage at ${new Date().toLocaleTimeString()}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      console.log('💾 Code saved to localStorage:', saveKey);
    } catch (error) {
      console.error('❌ Error saving code:', error);
      toast({
        title: "Save Failed",
        description: "Could not save code to localStorage",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Load the latest saved code for this room
  const loadLatestSave = () => {
    try {
      const latestSaveKey = `latest_save_${roomId}`;
      const savedData = localStorage.getItem(latestSaveKey);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setValue(parsedData.code);
        setLanguage(parsedData.language);
        
        toast({
          title: "Code Loaded!",
          description: `Loaded code from ${new Date(parsedData.timestamp).toLocaleString()}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        console.log('📂 Loaded saved code:', parsedData);
      } else {
        toast({
          title: "No Saved Code",
          description: "No saved code found for this room",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('❌ Error loading saved code:', error);
      toast({
        title: "Load Failed",
        description: "Could not load saved code",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Navigate to save history page
  const showSaveHistory = () => {
    navigate(`/history/${roomId}`);
  };

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
      <Center mb={6}>
        <HStack spacing={6}>
          <Button
            colorScheme="blue"
            onClick={saveCode}
            size="lg"
            px={8}
            py={3}
            fontSize="md"
            fontWeight="semibold"
            borderRadius="lg"
            boxShadow="md"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
              bg: "blue.600",
            }}
            _active={{
              transform: "translateY(0px)",
              boxShadow: "md",
            }}
            transition="all 0.2s ease-in-out"
          >
            💾 Save Code
          </Button>
          <Button
            colorScheme="green"
            onClick={loadLatestSave}
            size="lg"
            px={8}
            py={3}
            fontSize="md"
            fontWeight="semibold"
            borderRadius="lg"
            boxShadow="md"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
              bg: "green.600",
            }}
            _active={{
              transform: "translateY(0px)",
              boxShadow: "md",
            }}
            transition="all 0.2s ease-in-out"
          >
            📂 Load Latest
          </Button>
          <Button
            colorScheme="purple"
            onClick={showSaveHistory}
            size="lg"
            px={8}
            py={3}
            fontSize="md"
            fontWeight="semibold"
            borderRadius="lg"
            boxShadow="md"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
              bg: "purple.600",
            }}
            _active={{
              transform: "translateY(0px)",
              boxShadow: "md",
            }}
            transition="all 0.2s ease-in-out"
          >
            📋 Save History
          </Button>
        </HStack>
      </Center>

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
