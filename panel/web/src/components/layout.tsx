import { Container } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFirebaseAuth } from "../providers/authProvider";
import NavBar from "./navbar";

interface LayoutProps {
  children: React.ReactElement;
  requireAuth?: boolean;
  title: string;
}

export default function Layout({
  children,
  requireAuth = false,
  title,
}: LayoutProps) {
  const user = useFirebaseAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = `${title} - TwitchMC`;
  }, [title]);

  useEffect(() => {
    if (requireAuth && !user) {
      navigate("/login", {
        replace: true,
        state: {
          from: location,
        },
      });
    }
  }, [user, requireAuth, location, navigate]);

  return (
    <>
      <NavBar />
      <Container maxW="full" p="4" position="relative">
        {children}
      </Container>
    </>
  );
}
