import React from "react";

import { Heading, Button, Link, Flex } from "@chakra-ui/react";
import { Link as BrowserLink } from "react-router-dom";

export default function Home() {
  return (
    <Flex
      direction="column"
      alignItems="center"
      justify="center"
      gap="1.5em"
      h="100vh"
      bg="green.600"
    >
      <Heading as="h1" size="lg" textColor="white">
        About
      </Heading>
      <Link as={BrowserLink} to="/">
        <Button>Home</Button>
      </Link>
    </Flex>
  );
}
