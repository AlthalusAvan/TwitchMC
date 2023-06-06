import { type MinecraftUser } from "@prisma/client";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Button from "../../components/button";
import Layout from "../../components/layout";
import LoadingSpinner from "../../components/loadingSpinner";
import { trpc } from "../../utils/trpc";

const Connect: NextPage = () => {
  const { data: sessionData, status: sessionStatus } = useSession();
  const nav = useRouter();

  useEffect(() => {
    if (!sessionData && sessionStatus !== "loading") {
      nav.replace("/");
    }
  }, [sessionData, nav, sessionStatus]);

  const [error, setError] = useState("");
  const [mcUser, setMcUser] = useState<MinecraftUser | null>(null);
  const [loading, setLoading] = useState(true);

  trpc.mcUser.getMcUser.useQuery(undefined, {
    onSuccess: (data) => {
      setLoading(false);
      setMcUser(data);
    },
  });

  const connectMutation = trpc.mcUser.connectMcUser.useMutation({
    onSuccess: (data) => {
      setLoading(false);
      setMcUser(data);
    },
    onError: (error) => {
      setLoading(false);
      setError(error.message);
    },
  });

  function handleConnection(e: React.FormEvent<HTMLFormElement>) {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const code = formData.get("code");

    if (typeof code === "string") {
      connectMutation.mutate({ code: code });
    }
  }

  return (
    <Layout title="Connect">
      <div className="container flex w-full flex-col items-center justify-center gap-4 px-4 py-16">
        {loading && <LoadingSpinner />}
        {mcUser ? (
          <h2 className="text-2xl">
            You have connected your account successfully!
          </h2>
        ) : (
          <div className="flex max-w-prose flex-col gap-2">
            <h2 className="text-2xl">Connect your Account</h2>
            <p>
              Enter the code you were given when trying to join the Server, then
              click &quot;Connect&quot;. If you haven&apos;t got a code yet, you
              can use our test server at this address:
            </p>
            <code className="rounded-md bg-gray-200 p-2">
              146.59.220.221:25639
            </code>
            <form className="flex flex-col gap-4" onSubmit={handleConnection}>
              <input
                className="flex-auto rounded-md border border-gray-400 px-2 py-2"
                name="code"
                placeholder="Connection Code"
              ></input>
              <Button color="primary" size="large" formAction="submit">
                Connect
              </Button>
            </form>
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Connect;
