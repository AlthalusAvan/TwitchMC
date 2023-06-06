import Head from "next/head";
import Header from "../header";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const formattedTitle = title
    ? `${title} - TwitchMC`
    : "TwitchMC - Sub-only Minecraft server made easy";

  return (
    <>
      <Head>
        <title>{formattedTitle}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen w-screen bg-slate-100">
        <Header />
        <main className="relative flex min-h-screen flex-col items-center gap-12 px-4 pt-16">
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;
