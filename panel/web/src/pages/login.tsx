import React, { useEffect, useState } from "react";
import {
  useSearchParams,
  useNavigate,
  useLocation,
  Location,
} from "react-router-dom";
import {
  Heading,
  Button,
  Link,
  Flex,
  Image,
  CircularProgress,
  Text,
} from "@chakra-ui/react";

import TwitchLogo from "../assets/twitch.svg";

import { signIn } from "../lib/firebase/auth";
import { getAuthToken } from "../lib/api/auth";
import { getApiBaseUrl } from "../lib/firebase/functions";
import { useFirebaseAuth } from "../providers/authProvider";
import Layout from "../components/layout";

interface LoginLocationState {
  from: Location | null;
}

export default function Login() {
  const [searchParams] = useSearchParams();

  const code = searchParams.get("code");

  const apiBaseUrl = getApiBaseUrl();

  const autoContinue = searchParams.get("autoContinue");

  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LoginLocationState;
  const redirectTo =
    searchParams.get("state") || locationState?.from?.pathname || "/connect";

  const [token, setToken] = useState("");

  const user = useFirebaseAuth();

  useEffect(() => {
    if (user) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, redirectTo]);

  useEffect(() => {
    if (autoContinue) {
      window.location.href = `${apiBaseUrl}/redirect?redirectTo=${redirectTo}`;
    }
  }, [apiBaseUrl, autoContinue, redirectTo]);

  useEffect(() => {
    if (code && token.length < 1) {
      getAuthToken(code).then((token) => {
        setToken(token);
      });
    }
  }, [code, token]);

  const [authError, setAuthError] = useState<boolean | string>(false);

  useEffect(() => {
    if (token.length > 1) {
      signIn(token)
        .then(() => {
          navigate(redirectTo);
        })
        .catch((error) => {
          setAuthError("There was an error logging in, please try again later");
          console.error(error);
        });
    }
  }, [token, navigate, redirectTo]);

  if (!code) {
    return (
      <Layout title="Log In">
        <Flex
          direction="column"
          alignItems="center"
          justify="center"
          gap="1.5em"
          minH="xl"
        >
          {authError && (
            <Text color="red.500">
              Error logging in: {authError.toString()}
            </Text>
          )}
          <Heading as="h1" size="lg" textColor="black">
            Please log in with your Twitch account to get started
          </Heading>
          <Link href={`${apiBaseUrl}/redirect?redirectTo=${redirectTo}`}>
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
      </Layout>
    );
  }

  return (
    <Layout title="Log In">
      <Flex
        direction="column"
        alignItems="center"
        justify="center"
        gap="1.5em"
        minH="xl"
      >
        <Heading as="h1" size="lg">
          Logging you in...
        </Heading>
        <CircularProgress isIndeterminate color="purple.600" />
      </Flex>
    </Layout>
  );
}
