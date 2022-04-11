import { Heading, Flex } from "@chakra-ui/react";
import Layout from "../components/layout";

export default function Home() {
  return (
    <Layout title="About">
      <Flex direction="column" alignItems="center" justify="center" gap="1.5em">
        <Heading as="h1" size="lg">
          About
        </Heading>
      </Flex>
    </Layout>
  );
}
