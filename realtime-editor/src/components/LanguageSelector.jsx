import {
    Box,
    Button,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text,
  } from "@chakra-ui/react";
  import { LANGUAGE_VERSIONS } from "../constants";
  
  const languages = Object.entries(LANGUAGE_VERSIONS);
  const ACTIVE_COLOR = "blue.400";
  
  const LanguageSelector = ({ language, onSelect }) => {
    return (
      <Box ml={2} mb={4}>
        <Text mb={2} fontSize="8xl"
        textColor="#ffffff"
        fontFamily="fantasy"

        >
          Language:
        </Text>
        <Menu isLazy>
          <MenuButton   _hover={{ bg: "#E2E5DE" }} 
           border="1px solid" 
          p={3}


           as={Button}>{language}</MenuButton>
          <MenuList 
          bg="#ffffff" zIndex={999}        border="3px solid"
          variant="solid"
          colorScheme="yellow"
          mb={4}
          borderRadius="md" // Apply border radius
          boxShadow="lg" // Apply box shadow
          px={4} // Apply padding on X-axis
          py={2} // Apply padding on Y-axis
          fontSize="md" // Set font size
          fontWeight="bold" // Set font weight
 >
            {languages.map(([lang, version]) => (
              <MenuItem
                key={lang}
                color={lang === language ? ACTIVE_COLOR : ""}
                bg={lang === language ? "gray.900" : "transparent"}
                _hover={{
                  color: ACTIVE_COLOR,
                  bg: "gray.900",
                }}
                onClick={() => onSelect(lang)}
              >
                {lang}
                &nbsp;
                <Text as="span" color="gray.600" fontSize="sm">
                  ({version})
                </Text>
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </Box>
    );
  };
  export default LanguageSelector;