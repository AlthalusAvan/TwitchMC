import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import TwitchIcon from "../twitchIcon";
import Button from "../button";
import Link from "next/link";
import { Bars3Icon } from "@heroicons/react/24/solid";
import { useState } from "react";

const Header: React.FC = () => {
  const { data: sessionData } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-row items-center justify-between bg-violet-500 px-4 py-3">
      <Link href="/">
        <div className="flex flex-1 flex-row items-center gap-4">
          <Image
            src="/logo.png"
            alt="logo"
            className="h-8 w-8"
            width={64}
            height={64}
          />
          <h1 className="text-2xl font-bold text-white">TwitchMC</h1>
        </div>
      </Link>
      <div className="hidden flex-1 flex-row items-center justify-end gap-8 font-semibold text-white md:flex">
        <Link href="/">Home</Link>

        {sessionData && (
          <>
            <Link href="/connect">Connect</Link>
            <Link href="/servers">Manage Servers</Link>
          </>
        )}
        <Button
          onClick={sessionData ? () => signOut() : () => signIn("twitch")}
          color="dark"
          size="small"
        >
          {!sessionData && <TwitchIcon />}
          {sessionData ? "Sign out" : "Sign in with Twitch"}
        </Button>
      </div>
      <div className="flex flex-1 flex-row items-center justify-end px-4 md:hidden">
        <div
          className={`rounded-md border border-gray-100 p-1 hover:bg-white/25 ${
            menuOpen && "bg-white/25"
          }`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Bars3Icon className="h-6 w-6 text-white" />
          {menuOpen && (
            <div className="absolute right-0 top-14 flex w-full flex-col items-center justify-center gap-4 bg-violet-500 p-4 text-white">
              <Link href="/">Home</Link>
              {sessionData && (
                <>
                  <Link href="/connect">Connect</Link>
                  <Link href="/servers">Manage Servers</Link>
                </>
              )}
              <Button
                onClick={sessionData ? () => signOut() : () => signIn("twitch")}
                color="dark"
                size="small"
              >
                {!sessionData && <TwitchIcon />}
                {sessionData ? "Sign out" : "Sign in with Twitch"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
