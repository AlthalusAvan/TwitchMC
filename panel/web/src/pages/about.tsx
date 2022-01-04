import React from "react";

import { Box, Heading, LinkOverlay, Button } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

export default function About() {
  return (
    <Box>
      <Heading as="h1" size="2xl">
        About
      </Heading>
      <LinkOverlay as={RouterLink} to="/">
        <Button>Home</Button>
      </LinkOverlay>
    </Box>
  );
}
