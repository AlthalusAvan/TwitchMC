import {
  Button,
  Code,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { MCServer } from "../../types/server";

interface DeleteModalProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  server: MCServer;
  deleteServer: (id: string, confirm?: boolean) => void;
}

function DeleteModal({
  isOpen,
  onOpen,
  onClose,
  server,
  deleteServer,
}: DeleteModalProps) {
  const [serverName, setServerName] = useState("");
  const initialRef = useRef<HTMLInputElement>(null);

  return (
    <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={initialRef}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Are you sure?</ModalHeader>
        <ModalCloseButton />
        <ModalBody display="flex" flexDirection="column" gap={4}>
          <Text>
            To confirm you want to delete the server, please enter the name of
            the server below and click <b>Delete</b>
          </Text>
          <Text>As a reminder, your server name is:</Text>
          <Code p={2}>{server.name}</Code>
          <Input
            onChange={(e) => setServerName(e.target.value)}
            placeholder="Enter your server name to confirm"
            ref={initialRef}
          ></Input>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="red"
            mr={3}
            disabled={serverName !== server.name}
            onClick={() => {
              deleteServer(server.id, true);
              onClose();
            }}
          >
            Delete
          </Button>
          <Button colorScheme="gray" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default DeleteModal;
