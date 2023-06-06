import { type NextPage } from "next";
import { signIn, useSession } from "next-auth/react";

import Layout from "../components/layout";
import TwitchIcon from "../components/twitchIcon";
import Button from "../components/button";

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";

const Home: NextPage = () => {
  const { data: session } = useSession();

  return (
    <Layout>
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-4">
        <div className="flex w-full max-w-prose flex-col gap-4">
          <h1 className="text-center text-4xl font-extrabold tracking-tight text-gray-800">
            Simple <span className="text-violet-500">Subscriber</span> Servers
          </h1>
          <h4 className="text-center text-2xl">Welcome to TwitchMC</h4>
          <p>
            This project is still in development - if you notice any issues,
            please let the moderators of the server you play on know! More
            information will be added to this page over time, but for now you
            can learn more on{" "}
            <a
              className="text-violet-500"
              href="https://github.com/AlthalusAvan/TwitchMC"
              target="_blank"
            >
              GitHub
              <ArrowTopRightOnSquareIcon className="ml-1 inline-block h-4 w-4" />
            </a>
            .
          </p>
        </div>
        {!session && (
          <Button onClick={() => signIn("twitch")} size="large" color="primary">
            <TwitchIcon /> Sign In With Twitch
          </Button>
        )}
      </div>
    </Layout>
  );
};

export default Home;
