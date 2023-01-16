import React from "react";

import { Heading, Button, Link, Flex, Text, Container } from "@chakra-ui/react";
import { Link as BrowserLink } from "react-router-dom";
import Layout from "../components/layout";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useFirebaseAuth } from "../providers/authProvider";

export default function Home() {
  const user = useFirebaseAuth();

  console.log(import.meta.env.NODE_ENV);

  return (
    <Layout title="Home">
      <Container maxW="2xl">
        <Flex
          direction="column"
          alignItems="center"
          justify="center"
          gap="1.5em"
        >
          <Heading as="h1" size="lg">
            Welcome to TwitchMC
          </Heading>
          <Text>
            This project is still in development - if you notice any issues,
            please let the moderators of the server you play on know! More
            information will be added to this page over time, but for now you
            can learn more on{" "}
            <Link
              color="purple.500"
              href="https://github.com/AlthalusAvan/TwitchMC"
              target="_blank"
            >
              Github <ExternalLinkIcon fontSize=".8em" />
            </Link>
            .
          </Text>
          {!user && (
            <Link as={BrowserLink} to="/login?autoContinue=true">
              <Button>Login with Twitch</Button>
            </Link>
          )}
        </Flex>
      </Container>
    </Layout>
  );
}
