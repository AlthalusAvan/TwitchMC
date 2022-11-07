import React, { FormEvent, useEffect, useRef, useState } from "react";
import {
  doc,
  onSnapshot,
  getDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase/firestore";
import { DocumentData } from "@firebase/firestore";

import {
  Heading,
  Flex,
  Text,
  CircularProgress,
  Container,
  Input,
  Button,
  Box,
  Code,
} from "@chakra-ui/react";
import { useFirebaseAuth } from "../providers/authProvider";
import Layout from "../components/layout";
import { remoteConfig } from "../lib/firebase/config";
import { getValue } from "firebase/remote-config";

export default function Connect() {
  const user = useFirebaseAuth();

  const [userInfo, setUserInfo] = useState<DocumentData | null>(null);

  useEffect(() => {
    async function getUserInfo() {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        onSnapshot(docRef, (doc) => {
          if (doc.exists()) {
            setUserInfo(doc.data());
          }
        });
      }
    }

    getUserInfo();
  }, [user]);

  const [verifyError, setVerifyError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const codeRef = useRef<HTMLInputElement>(null);

  async function verifyAccount(e: FormEvent) {
    e.preventDefault();

    setVerifying(true);

    if (codeRef.current && codeRef.current.value) {
      setVerifyError("");

      const verificationRef = doc(
        db,
        "userVerifications",
        codeRef.current.value.toUpperCase()
      );

      const verification = await getDoc(verificationRef).catch((e) => {
        console.error(e);
        return null;
      });

      if (verification && verification.exists()) {
        const verificationData = verification.data();

        const uuid = verificationData.uuid;

        if (!uuid) {
          await deleteDoc(verificationRef);
          setVerifyError(
            "The verification request was malformed and you'll need to get a new code - please try connecting to a server again to get a new code. If this issue persists please contact a TwitchMC admin."
          );
          setVerifying(false);
          return;
        }

        if (!user) {
          setVerifyError(
            "There's an error with your user data - please log out and back in again. If this issue persists please contact a TwitchMC admin."
          );
          setVerifying(false);
          return;
        }

        const userRef = doc(db, "users", user.uid);

        await updateDoc(userRef, { uuid: uuid });
        await deleteDoc(verificationRef);
      }

      setVerifyError(
        "That verification code doesn't exist - please try again with a valid code!"
      );
      setVerifying(false);
      return;
    }

    setVerifyError("Please provide a verification code");
    setVerifying(false);
    return;
  }

  return (
    <Layout requireAuth title="Connect">
      <Flex direction="column" justify="center" align="center" gap="4">
        <Heading as="h1" size="lg">
          Welcome, {user?.displayName}
        </Heading>
        {userInfo ? (
          <Container maxW="2xl">
            {userInfo.uuid ? (
              <Text align="justify">
                You have linked your Minecraft account successfully! You can now
                connect to the server.
              </Text>
            ) : (
              <Flex direction="column" gap={4}>
                <Text align="justify">
                  You have not linked your Minecraft account yet. Please connect
                  to a TwitchMC enabled server - you will be prompted with a
                  code to connect your account. Enter it below to link your
                  account!
                </Text>
                <form onSubmit={(e) => verifyAccount(e)}>
                  <Flex gap={2}>
                    <Input
                      isInvalid={verifyError.length > 0}
                      isDisabled={verifying}
                      placeholder="Verification Code"
                      ref={codeRef}
                    />
                    <Button
                      loadingText="Adding..."
                      type="submit"
                      colorScheme="purple"
                      isDisabled={verifying}
                    >
                      Verify
                    </Button>
                  </Flex>
                  {verifyError.length > 0 && (
                    <Text align="left" mt={1} color="red">
                      {verifyError}
                    </Text>
                  )}
                </form>

                <Box
                  shadow="lg"
                  mt="10"
                  p="4"
                  border="1px"
                  borderColor="gray.50"
                  rounded="md"
                >
                  <Flex direction="column" gap="2">
                    <Heading as="h2" size="md">
                      Don't have a code yet?
                    </Heading>
                    <Text>
                      If you haven't been given a code yet by a TwitchMC-enabled
                      server, you can use our test server here:
                    </Text>
                    <Code p="2">
                      {getValue(remoteConfig, "testServerAddress").asString()}
                    </Code>
                  </Flex>
                </Box>
              </Flex>
            )}
          </Container>
        ) : (
          <>
            <Text>Loading...</Text>
            <CircularProgress isIndeterminate color="purple.600" />
          </>
        )}
      </Flex>
    </Layout>
  );
}
