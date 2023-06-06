import { ClipboardDocumentIcon } from "@heroicons/react/24/solid";
import { type Server } from "@prisma/client";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Button from "../../components/button";
import Layout from "../../components/layout";
import LoadingSpinner from "../../components/loadingSpinner";
import { trpc } from "../../utils/trpc";

const Servers: NextPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [linkModal, setLinkModal] = useState<Server | null>(null);
  const [linkError, setLinkError] = useState("");
  const [servers, setServers] = useState<Server[]>([]);

  const { data: sessionData, status: sessionStatus } = useSession();
  const utils = trpc.useContext();

  const nav = useRouter();

  useEffect(() => {
    if (!sessionData && sessionStatus !== "loading") {
      nav.replace("/");
    }
  }, [sessionData, nav, sessionStatus]);

  trpc.server.getServers.useQuery(undefined, {
    enabled: sessionData?.user !== undefined,
    onSuccess: (data) => {
      if (linkModal) {
        const updatedServer =
          data?.find((item) => item.id === linkModal.id) || null;

        if (updatedServer) {
          if (updatedServer.status === "linked") {
            setLinkModal(null);
          } else {
            setLinkModal(updatedServer);
            setLinkError("Failed to link server, please try again.");
          }
        }
      }

      setServers(data);
      setLoading(false);
    },
    refetchOnWindowFocus: false,
  });

  const createServerMutation = trpc.server.createServer.useMutation({
    onSuccess: (data) => {
      setServers((prev) => {
        return [...prev, data];
      });
      setLoading(false);
      setLinkModal(data);
    },
    onError: (e) => {
      console.error(e);
      setLoading(false);
    },
  });

  const deleteServerMutation = trpc.server.deleteServer.useMutation({
    onSuccess: (data) => {
      setServers((prev) => {
        return prev.filter((item) => item.id !== data.id);
      });
      setLoading(false);
    },
    onError: (e) => {
      console.error(e);
      setLoading(false);
    },
  });

  const refreshServers = async () => {
    setLoading(true);
    setLinkError("");
    utils.server.invalidate();
  };

  const createServer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const serverName = formData.get("serverName");

    if (!serverName) {
      setLoading(false);
      setError("Please enter a server name");
      return;
    }

    createServerMutation.mutate({
      name: serverName as string,
    });
  };

  const deleteServer = async (id: string) => {
    setLoading(true);
    deleteServerMutation.mutate({
      id: id,
    });
  };

  return (
    <Layout title="Servers">
      <div className="container flex max-w-4xl flex-col items-center gap-4 px-4 py-4">
        {loading && <LoadingSpinner />}
        <h2 className="text-2xl">Server List</h2>
        <table className="table w-full table-auto">
          <tr className="table-header-group border-separate px-8 text-center">
            {["Name", "Created At", "Status", ""].map((item) => (
              <th key={item} className="px-4">
                {item}
              </th>
            ))}
          </tr>
          {servers?.map((item) => (
            <tr key={item.id} className="table-row border text-center">
              <td>{item.name}</td>
              <td>{item.createdAt.toDateString()}</td>
              <td className="capitalize">{item.status}</td>
              <td className="py-2">
                <Button
                  color="primary"
                  size="small"
                  onClick={() => {
                    deleteServer(item.id);
                  }}
                  disabled={deleteServerMutation.isLoading}
                >
                  Delete Server
                </Button>
              </td>
            </tr>
          ))}
        </table>
        <form className="flex w-full flex-row gap-4" onSubmit={createServer}>
          <input
            type="text"
            placeholder="Server Name"
            className="flex-auto rounded-md border border-gray-400 px-2 py-2"
            name="serverName"
          />
          <Button
            color="primary"
            size="small"
            formAction="submit"
            disabled={createServerMutation.isLoading}
          >
            <p>Create Server</p>
          </Button>
        </form>
        <p className="text-red-600">{error}</p>
        {linkModal && (
          <div className="absolute top-0 left-0 z-30 flex h-full w-full flex-col items-center justify-center bg-black bg-opacity-50">
            <div className="flex max-w-prose flex-col items-center gap-4 rounded-md bg-white p-6">
              <p className="text-2xl">Creating server...</p>
              <p>Server Name: {linkModal.name}</p>
              <p>
                In order to connect the server to TwitchMC, please verify by
                logging into your server and entering the following command (you
                will need operator permissions
              </p>
              <div className="flex flex-row items-center gap-4">
                <code className="rounded-md bg-gray-200 p-2">
                  /twitchmc register {linkModal.verificationCode}
                </code>
                <ClipboardDocumentIcon
                  className="h-6 w-6 cursor-pointer text-gray-500"
                  aria-label="Copy Command"
                  title="Copy Command"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `/twitchmc register ${linkModal.verificationCode}`
                    );
                  }}
                />
              </div>
              <p>
                Once the command has succesfully completed, please press
                &quot;Complete&quot; below to finish complete the registration.
              </p>
              <div className="flex flex-row items-center gap-4">
                <Button
                  color="primary"
                  size="small"
                  onClick={() => {
                    refreshServers();
                  }}
                >
                  <p>Complete</p>
                </Button>
                <Button
                  color="danger"
                  size="small"
                  onClick={() => {
                    deleteServer(linkModal.id);
                    setLinkModal(null);
                  }}
                >
                  <p>Cancel</p>
                </Button>
              </div>
              {linkError && <p className="text-red-600">{linkError}</p>}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Servers;
