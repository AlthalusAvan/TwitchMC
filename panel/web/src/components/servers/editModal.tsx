import {
  Button,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { MCServer } from "../../types/server";

interface EditModalProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  server: MCServer;
  updateServer: (
    id: string,
    data: MCServer,
    callback: (success: boolean) => void
  ) => void;
}

function EditModal({
  isOpen,
  onOpen,
  onClose,
  server,
  updateServer,
}: EditModalProps) {
  const [serverData, setServerData] = useState(server);
  const initialRef = useRef<HTMLInputElement>(null);

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateData(key: string, value: unknown) {
    setServerData({ ...serverData, [key]: value });
  }

  function handleUpdateServer() {
    setProcessing(true);

    updateServer(server.id, serverData, (success) => {
      if (success) {
        setError(null);
        onClose();
      } else {
        setError(
          "Failed to update server - please try again later or report the issue to an admin if it persists"
        );
      }

      setProcessing(false);
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={initialRef}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit server {serverData.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateServer();
            }}
          >
            <Flex direction="column" gap={4}>
              <div>
                <Text>Server Name</Text>
                <Input
                  onChange={(e) => updateData("name", e.target.value)}
                  value={serverData.name}
                  placeholder="Enter your server name to confirm"
                  ref={initialRef}
                />
              </div>

              <div>
                <Text>Grace Period</Text>
                <NumberInput
                  value={serverData.gracePeriod || 0}
                  onChange={(value) =>
                    updateData("gracePeriod", parseInt(value))
                  }
                  min={0}
                  max={5}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </div>

              {error && <Text color="red.500">{error}</Text>}
            </Flex>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="green"
            mr={3}
            onClick={handleUpdateServer}
            disabled={processing}
          >
            {processing && <Spinner color="white" size="xs" mr={2} />}
            Save
          </Button>
          <Button colorScheme="gray" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default EditModal;
