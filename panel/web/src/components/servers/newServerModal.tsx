import {
  Button,
  Center,
  Code,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase/firestore";
import { MCServer } from "../../types/server";

interface DeleteModalProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  newServer: MCServer;
}

function NewServerModal({
  isOpen,
  onOpen,
  onClose,
  newServer,
}: DeleteModalProps) {
  const [server, setServer] = useState<MCServer | null>(null);

  useEffect(() => {
    const docRef = doc(db, "servers", newServer.id);

    onSnapshot(docRef, (snapshot) => {
      setServer({ id: snapshot.id, ...snapshot.data() } as MCServer);
    });
  }, [newServer]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>New Server Setup</ModalHeader>
        <ModalBody display="flex" flexDirection="column" gap={4}>
          {server ? (
            <>
              <Text>Creating a new server called:</Text>
              <Code p={2}>{server.name}</Code>
              <Text>
                In order to connect the server to TwitchMC, please verify by
                logging into your server and entering the following command (you
                will need operator permissions)
              </Text>
              <Code p={2}>/twitchmc register {server.code}</Code>
              {server.status === "Verified" ? (
                <Center mt={10}>
                  <Heading as="h6" size="md">
                    Server Verified!
                  </Heading>
                </Center>
              ) : (
                <>
                  <Center mt={10}>
                    <Spinner
                      color="purple"
                      speed="1.5s"
                      size="md"
                      emptyColor="gray.200"
                      mr={3}
                    />
                    <Text>Awaiting Verification</Text>
                  </Center>
                </>
              )}
            </>
          ) : (
            <>
              <Center mt={10}>
                <Spinner
                  color="purple"
                  speed="1.5s"
                  size="md"
                  emptyColor="gray.200"
                  mr={3}
                />
                <Text>Awaiting Server Information</Text>
              </Center>
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="purple"
            disabled={server !== null && server.status !== "Verified"}
            onClick={onClose}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default NewServerModal;
