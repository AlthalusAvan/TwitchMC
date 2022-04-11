import React from "react";

import { Heading, Button, Link, Flex } from "@chakra-ui/react";
import { Link as BrowserLink } from "react-router-dom";
import Layout from "../components/layout";

export default function Home() {
  console.log(process.env.NODE_ENV);

  return (
    <Layout title="Home">
      <Flex direction="column" alignItems="center" justify="center" gap="1.5em">
        <Heading as="h1" size="lg">
          Hello World
        </Heading>
        <Link as={BrowserLink} to="/login">
          <Button>Login with Twitch</Button>
        </Link>
      </Flex>
    </Layout>
  );
}
