import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { db } from "../lib/firebase/firestore";
import { auth } from "../lib/firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  QuerySnapshot,
} from "@firebase/firestore";
import { httpsCallable } from "firebase/functions";
import {
  Heading,
  Flex,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  Input,
  Skeleton,
  Container,
  Text,
} from "@chakra-ui/react";
import { functions } from "../lib/firebase/functions";
import Layout from "../components/layout";
import { MCServer } from "../types/server";
import { DeleteIcon } from "@chakra-ui/icons";

export default function Servers() {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [serverData, setServerData] = useState<MCServer[] | null>(null);
  const newServerName = useRef<HTMLInputElement>(null);
  const [newServerError, setNewServerError] = useState("");
  const [processingNewServer, setProcessingNewServer] = useState(false);

  useEffect(() => {
    async function getServers() {
      if (user) {
        const serversRef = collection(db, "servers");
        console.log(user.uid);
        const q = query(
          serversRef,
          where("user", "==", user.uid),
          orderBy("createdAt", "asc")
        );
        onSnapshot(q, (querySnapshot: QuerySnapshot) => {
          const data: any[] = [];

          querySnapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() });
          });

          setServerData(data);
        });
      }
    }

    getServers();
  }, [user, navigate]);

  function addServer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (newServerName.current && newServerName.current.value) {
      setNewServerError("");
      setProcessingNewServer(true);
    } else {
      setNewServerError("Please provide a server name");
      return;
    }

    const createServer = httpsCallable(functions, "createServer");
    createServer({ name: newServerName.current.value })
      .then((result) => {
        if (newServerName.current) {
          newServerName.current.value = "";
        }
        console.log(result);
        setProcessingNewServer(false);
      })
      .catch((error) => {
        console.log(error);
        setNewServerError(error.toString());
        setProcessingNewServer(false);
      });
  }

  function deleteServer(id: string, confirm = false) {
    if (confirm) {
      const docRef = doc(db, "servers", id);
      deleteDoc(docRef);
    }
  }

  return (
    <Layout requireAuth title="Manage Servers">
      <Container maxW="4xl">
        <Flex gap={4} direction="column">
          <Heading as="h1" size="lg" textAlign="center">
            Manage Servers
          </Heading>
          <Table variant="simple" margin={0}>
            <TableCaption placement="top">
              Here are all of the servers you manage
            </TableCaption>
            <Thead>
              <Tr>
                <Th>Server Name</Th>
                <Th>Created At</Th>
                <Th>Players Managed</Th>
                <Th>Status</Th>
                <Th>Code</Th>
                <Th>Controls</Th>
              </Tr>
            </Thead>
            <Tbody>
              {!serverData && (
                <Tr>
                  {[0, 0, 0, 0, 0].map((item) => (
                    <Td>
                      <Skeleton height="20px" />
                    </Td>
                  ))}
                </Tr>
              )}
              {serverData &&
                serverData.map((item: MCServer) => (
                  <Tr>
                    <Td>{item.name}</Td>
                    <Td>
                      {new Date(item.createdAt.seconds * 1000).toLocaleString()}
                    </Td>
                    <Td isNumeric>{item.playersManaged}</Td>
                    <Td
                      color={
                        item.status === "Verified" ? "green.500" : "orange.500"
                      }
                    >
                      {item.status}
                    </Td>
                    <Td>{item.code || ""}</Td>
                    <Td isNumeric>
                      <DeleteIcon
                        color="red.500"
                        cursor="pointer"
                        onClick={() => deleteServer(item.id, true)}
                      />
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
          <form onSubmit={(e) => addServer(e)}>
            <Flex gap={2}>
              <Input
                isInvalid={newServerError.length > 0}
                isDisabled={processingNewServer}
                placeholder="Server Name"
                ref={newServerName}
              />
              <Button
                isLoading={processingNewServer}
                loadingText="Adding..."
                type="submit"
                colorScheme="purple"
              >
                Add Server
              </Button>
            </Flex>
            {newServerError.length > 0 && (
              <Text color="red">{newServerError}</Text>
            )}
          </form>
        </Flex>
      </Container>
    </Layout>
  );
}
