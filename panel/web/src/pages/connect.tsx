import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase/firestore";
import { DocumentData } from "@firebase/firestore";

import { Heading, Flex, Text, CircularProgress, Image } from "@chakra-ui/react";
import { useFirebaseAuth } from "../providers/authProvider";
import Layout from "../components/layout";

export default function Connect() {
  const user = useFirebaseAuth();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState<DocumentData | null>(null);

  useEffect(() => {
    async function getUserInfo() {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserInfo(docSnap.data());
        }
      }
    }

    getUserInfo();
  }, [user, navigate]);

  return (
    <Layout requireAuth title="Connect">
      <Flex direction="column" justify="center" align="center" gap="4">
        <Heading as="h1" size="lg">
          Welcome, {user?.displayName}
        </Heading>
        <Text>Here's some interesting info about you...</Text>
        {userInfo ? (
          <Flex direction="column" justify="center" align="center" gap=".25em">
            <Text>Your Name: {userInfo.display_name}</Text>
            <Flex direction="column" justify="center" align="center">
              <Text>This you?</Text>
              <Image
                src={userInfo.profile_image_url}
                alt="Your profile image"
              />
            </Flex>
            <Text>
              Your account was created on{" "}
              {new Date(userInfo.created_at).toDateString()}
            </Text>
          </Flex>
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
