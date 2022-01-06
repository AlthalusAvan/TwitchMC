import React from "react";

import { Heading, Button, Link, Flex } from "@chakra-ui/react";
import { Link as BrowserLink } from "react-router-dom";

export default function Home() {
  console.log(process.env.NODE_ENV);

  return (
    <Flex
      direction="column"
      alignItems="center"
      justify="center"
      gap="1.5em"
      h="100vh"
      bg="blue.600"
    >
      <Heading as="h1" size="lg" textColor="white">
        Hello World
      </Heading>
      <Link as={BrowserLink} to="/login">
        <Button>Login with Twitch</Button>
      </Link>
    </Flex>
  );
}
