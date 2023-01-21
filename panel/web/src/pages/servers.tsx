import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase/firestore";
import { doc, deleteDoc } from "firebase/firestore";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  QuerySnapshot,
  updateDoc,
} from "@firebase/firestore";
import { httpsCallable } from "firebase/functions";
import {
  Heading,
  Flex,
  Button,
  Input,
  Container,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { functions } from "../lib/firebase/functions";
import Layout from "../components/layout";
import { MCServer } from "../types/server";
import ServersTable from "../components/servers/serversTable";
import { useFirebaseAuth } from "../providers/authProvider";
import DeleteModal from "../components/servers/deleteModal";
import NewServerModal from "../components/servers/newServerModal";
import EditModal from "../components/servers/editModal";

export default function Servers() {
  const user = useFirebaseAuth();
  const navigate = useNavigate();

  // State for server data from Firebase
  const [serverData, setServerData] = useState<MCServer[] | null>(null);

  // State and Refs for new server form
  const newServerName = useRef<HTMLInputElement>(null);
  const [newServerError, setNewServerError] = useState("");
  const newServerDisclosure = useDisclosure();
  const [newServer, setNewServer] = useState<MCServer | null>(null);

  // Controllers for Delete Model
  const [serverToDelete, setServerToDelete] = useState<MCServer | null>(null);
  const deleteModalDisclosure = useDisclosure();

  // Controllers for Edit Modal
  const [serverToEdit, setServerToEdit] = useState<MCServer | null>(null);
  const editModalDisclosure = useDisclosure();

  // Get server data on load
  useEffect(() => {
    async function getServers() {
      if (user) {
        const serversRef = collection(db, "servers");
        const q = query(
          serversRef,
          where("user", "==", user.uid),
          orderBy("createdAt", "asc")
        );
        onSnapshot(q, (querySnapshot) => {
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
      newServerDisclosure.onOpen();
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

        setNewServer(result.data as unknown as MCServer);
      })
      .catch((error) => {
        console.error(error);
        setNewServerError(error.toString());
      });
  }

  function deleteServer(id: string, confirm = false) {
    if (confirm) {
      const docRef = doc(db, "servers", id);
      deleteDoc(docRef);
    } else {
      if (serverData) {
        const server = serverData?.find((item) => item.id === id);

        if (server) {
          setServerToDelete(server);
          deleteModalDisclosure.onOpen();
        }
      }
    }
  }

  function editServer(id: string) {
    if (serverData) {
      const server = serverData?.find((item) => item.id === id);

      if (server) {
        setServerToEdit(server);
        editModalDisclosure.onOpen();
      }
    }
  }

  function updateServer(
    id: string,
    data: MCServer,
    callback: (success: boolean) => void
  ) {
    const docRef = doc(db, "servers", id);

    updateDoc(docRef, { ...data })
      .then(() => {
        callback(true);
      })
      .catch((error) => {
        console.error(error);
        callback(false);
      });
  }

  return (
    <Layout requireAuth title="Manage Servers">
      <Container maxW="4xl">
        <Flex gap={4} direction="column">
          <Heading as="h1" size="lg" textAlign="center">
            Manage Servers
          </Heading>
          <ServersTable
            serverData={serverData}
            deleteServer={deleteServer}
            editServer={editServer}
          />
          <form onSubmit={(e) => addServer(e)}>
            <Flex gap={2}>
              <Input
                isInvalid={newServerError.length > 0}
                isDisabled={newServerDisclosure.isOpen}
                placeholder="Server Name"
                ref={newServerName}
              />
              <Button
                isLoading={newServerDisclosure.isOpen}
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
          {serverToDelete && (
            <DeleteModal
              {...deleteModalDisclosure}
              server={serverToDelete}
              deleteServer={deleteServer}
            />
          )}
          {serverToEdit && (
            <EditModal
              {...editModalDisclosure}
              server={serverToEdit}
              updateServer={updateServer}
            />
          )}

          {newServer && (
            <NewServerModal {...newServerDisclosure} newServer={newServer} />
          )}
        </Flex>
      </Container>
    </Layout>
  );
}
