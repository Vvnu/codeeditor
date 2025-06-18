import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  useToast,
  Container,
  Heading,
  Badge,
  Divider,
  IconButton,
} from "@chakra-ui/react";
import { ArrowBackIcon, DeleteIcon } from "@chakra-ui/icons";

const SaveHistoryPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [savedVersions, setSavedVersions] = useState([]);

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

  // Load a specific saved version and navigate back to editor
  const loadVersion = (savedData) => {
    try {
      // Store the version to load in sessionStorage for the editor to pick up
      sessionStorage.setItem('loadVersion', JSON.stringify(savedData));
      
      toast({
        title: "Version Ready to Load!",
        description: `Navigate back to editor to load code from ${new Date(savedData.timestamp).toLocaleString()}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Navigate back to editor
      navigate(`/editor/${roomId}`);
    } catch (error) {
      console.error('❌ Error preparing version load:', error);
      toast({
        title: "Load Failed",
        description: "Could not prepare this version for loading",
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

  // Clear all saved versions for this room
  const clearAllVersions = () => {
    const confirmClear = window.confirm("Are you sure you want to delete ALL saved versions for this room? This action cannot be undone.");
    if (confirmClear) {
      try {
        // Remove all saved versions for this room
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`code_save_${roomId}_`)) {
            localStorage.removeItem(key);
          }
        }
        // Also remove the latest save
        localStorage.removeItem(`latest_save_${roomId}`);
        
        setSavedVersions([]);
        
        toast({
          title: "All Versions Deleted!",
          description: "All saved versions for this room have been removed",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('❌ Error clearing versions:', error);
        toast({
          title: "Clear Failed",
          description: "Could not clear all versions",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  useEffect(() => {
    const versions = getSavedVersions();
    setSavedVersions(versions);
  }, [roomId]);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <HStack spacing={4}>
            <IconButton
              icon={<ArrowBackIcon />}
              onClick={() => navigate(`/editor/${roomId}`)}
              aria-label="Back to editor"
              colorScheme="gray"
            />
            <Box>
              <Heading size="lg">Save History</Heading>
              <Text color="gray.600">Room: {roomId}</Text>
            </Box>
          </HStack>
          <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
            {savedVersions.length} versions
          </Badge>
        </HStack>

        <Divider />

        {/* Actions */}
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="semibold">
            Saved Versions ({savedVersions.length})
          </Text>
          {savedVersions.length > 0 && (
            <Button
              colorScheme="red"
              variant="outline"
              size="sm"
              onClick={clearAllVersions}
            >
              Clear All
            </Button>
          )}
        </HStack>

        {/* Versions List */}
        {savedVersions.length === 0 ? (
          <Box
            p={8}
            textAlign="center"
            border="2px dashed"
            borderColor="gray.200"
            borderRadius="lg"
          >
            <Text fontSize="lg" color="gray.500">
              No saved versions found for this room.
            </Text>
            <Text fontSize="sm" color="gray.400" mt={2}>
              Save some code in the editor to see it here.
            </Text>
          </Box>
        ) : (
          <VStack spacing={4} align="stretch">
            {savedVersions.map((version, index) => (
              <Box
                key={version.key}
                p={6}
                border="1px"
                borderColor="gray.200"
                borderRadius="lg"
                bg="white"
                shadow="sm"
                _hover={{ shadow: "md" }}
                transition="all 0.2s"
              >
                <HStack justify="space-between" mb={3}>
                  <HStack spacing={3}>
                    <Badge colorScheme="green" variant="subtle">
                      Version {savedVersions.length - index}
                    </Badge>
                    <Badge colorScheme="purple" variant="subtle">
                      {version.language}
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    {new Date(version.timestamp).toLocaleString()}
                  </Text>
                </HStack>

                <Text fontSize="sm" color="gray.600" mb={3}>
                  Saved by: <strong>{version.username}</strong>
                </Text>

                <Box
                  p={3}
                  bg="gray.50"
                  borderRadius="md"
                  border="1px"
                  borderColor="gray.100"
                  mb={4}
                >
                  <Text fontSize="xs" color="gray.700" fontFamily="mono" noOfLines={3}>
                    {version.code}
                  </Text>
                </Box>

                <HStack spacing={3} justify="flex-end">
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => loadVersion(version)}
                  >
                    Load Version
                  </Button>
                  <IconButton
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    icon={<DeleteIcon />}
                    onClick={() => deleteVersion(version.key)}
                    aria-label="Delete version"
                  />
                </HStack>
              </Box>
            ))}
          </VStack>
        )}
      </VStack>
    </Container>
  );
};

export default SaveHistoryPage; 