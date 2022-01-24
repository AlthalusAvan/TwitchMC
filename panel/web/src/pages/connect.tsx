import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase/firestore";
import { auth } from "../lib/firebase/auth";
import { DocumentData } from "@firebase/firestore";

import {
  Heading,
  Flex,
  Text,
  CircularProgress,
  Image,
  Button,
} from "@chakra-ui/react";

export default function Connect() {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState<DocumentData | null>(null);

  useEffect(() => {
    async function getUserInfo() {
      if (user) {
        console.log(user);

        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserInfo(docSnap.data());
          console.log(docSnap.data());
        }
      } else {
        navigate("/login");
      }
    }

    getUserInfo();
  }, [user, navigate]);

  async function handleSignOut() {
    await auth.signOut();
    navigate("/login");
  }

  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      h="100vh"
      gap="2em"
    >
      <Heading as="h1" size="lg">
        Welcome, {user?.displayName}
      </Heading>
      <Text>Here's some interesting info about you...</Text>
      {userInfo ? (
        <Flex direction="column" justify="center" align="center" gap=".25em">
          <Text>Your Name: {userInfo.display_name}</Text>
          <Flex direction="column" justify="center" align="center">
            <Text>This you?</Text>
            <Image src={userInfo.profile_image_url} alt="Your profile image" />
          </Flex>
          <Text>
            Your account was created on{" "}
            {new Date(userInfo.created_at).toDateString()}
          </Text>
          <Text>Yeehaw</Text>
          <Button onClick={handleSignOut}>Log Out</Button>
        </Flex>
      ) : (
        <>
          <Text>Loading...</Text>
          <CircularProgress isIndeterminate color="purple.600" />
        </>
      )}
    </Flex>
  );
}
