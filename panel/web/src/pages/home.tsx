import React from "react";

import { Heading, Button, LinkOverlay } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import { Link as BrowserLink } from "react-router-dom";

export default function Home() {
  return (
    <Box>
      <Heading as="h1" size="2xl">
        Hello World
      </Heading>
      <LinkOverlay as={BrowserLink} to="/about">
        <Button>About</Button>
      </LinkOverlay>
    </Box>
  );
}
