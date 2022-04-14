import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  Skeleton,
} from "@chakra-ui/react";
import { MCServer } from "../../types/server";
import { DeleteIcon } from "@chakra-ui/icons";

interface ServersTableProps {
  serverData: MCServer[] | null;
  deleteServer: (id: string, confirm?: boolean) => void;
}

function ServersTable({ serverData, deleteServer }: ServersTableProps) {
  return (
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
                color={item.status === "Verified" ? "green.500" : "orange.500"}
              >
                {item.status}
              </Td>
              <Td isNumeric>
                <DeleteIcon
                  color="red.500"
                  cursor="pointer"
                  onClick={() => deleteServer(item.id)}
                />
              </Td>
            </Tr>
          ))}
      </Tbody>
    </Table>
  );
}

export default ServersTable;
