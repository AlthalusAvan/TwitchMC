import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heading, Flex, CircularProgress } from "@chakra-ui/react";

import { signOut } from "../lib/firebase/auth";
import Layout from "../components/layout";

export default function LogOut() {
  const navigate = useNavigate();

  useEffect(() => {
    signOut().then(() => {
      navigate("/login");
    });
  }, [navigate]);

  return (
    <Layout title="Log Out">
      <Flex
        direction="column"
        alignItems="center"
        justify="center"
        gap="1.5em"
        h="100vh"
      >
        <Heading as="h1" size="lg">
          Logging you out...
        </Heading>
        <CircularProgress isIndeterminate color="purple.600" />
      </Flex>
    </Layout>
  );
}
