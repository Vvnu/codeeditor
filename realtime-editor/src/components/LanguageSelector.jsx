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
        <Text mb={6} fontSize="8xl"
        textColor="#ffffff"
        fontWeight="bold"
        >
          Language
        </Text>
        <Menu isLazy>
          <MenuButton color={'#fff'} _hover={{ bg: "#fff", color: '#3A3A3B' }} 
           border="1px solid" fontWeight="bold" 
          p={3}


           as={Button}>{language[0].toUpperCase()+language.slice(1, language.length)}</MenuButton>
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