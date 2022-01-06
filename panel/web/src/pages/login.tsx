import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { app } from "../lib/firebase/app";
import { getApiBaseUrl } from "../lib/firebase/functions";

import {
  Heading,
  Button,
  Link,
  Flex,
  Image,
  CircularProgress,
} from "@chakra-ui/react";
import TwitchLogo from "../assets/twitch.svg";
import { signIn } from "../lib/firebase/auth";

export default function Login() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const apiBaseUrl = getApiBaseUrl();
  const navigate = useNavigate();

  const [token, setToken] = useState("");

  useEffect(() => {
    async function getToken() {
      if (code && state && token.length < 1) {
        axios
          .get(`${apiBaseUrl}/token`, {
            params: {
              code: code,
              state: state,
            },
          })
          .then((res) => {
            setToken(res.data.token);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }

    getToken();
  }, [code, state, token, apiBaseUrl]);

  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (token.length > 1) {
      signIn(token)
        .then(() => {
          navigate("/connect");
        })
        .catch((error) => {
          setAuthError("There was an error logging in, please try again later");
          console.error(error);
        });
    }
  }, [token]);

  if (!code || !state) {
    return (
      <Flex
        direction="column"
        alignItems="center"
        justify="center"
        gap="1.5em"
        h="100vh"
      >
        <Heading as="h1" size="lg" textColor="black">
          Please log in with your Twitch account to get started
        </Heading>
        <Link href={`${apiBaseUrl}/redirect`}>
          <Button
            leftIcon={
              <Image boxSize="20px" src={TwitchLogo} alt="Twitch Logo" />
            }
            colorScheme="purple"
            textColor="white"
          >
            Login with Twitch
          </Button>
        </Link>
      </Flex>
    );
  }

  return (
    <Flex
      direction="column"
      alignItems="center"
      justify="center"
      gap="1.5em"
      h="100vh"
    >
      <Heading as="h1" size="lg">
        Logging you in...
      </Heading>
      <CircularProgress isIndeterminate color="purple.600" />
    </Flex>
  );
}
