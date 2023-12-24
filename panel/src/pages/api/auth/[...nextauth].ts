import NextAuth, { type NextAuthOptions } from "next-auth";
import TwitchProvider from "next-auth/providers/twitch";
// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Prisma } from "@prisma/client";

import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db/client";

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async signIn({ account }) {
      if (account) {
        try {
          await prisma.account.update({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              }
            },
            data: account,
          })
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError) {
            // No account to update, continue
            if (e.code === "P2025") {
              return true;
            }
          }

          throw e;
        }
      }
      return true;
    }
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    TwitchProvider({
      clientId: env.TWITCH_CLIENT_ID,
      clientSecret: env.TWITCH_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid user:read:email user:read:subscriptions",
        },
      },
    }),
    // ...add more providers here
  ],
};

export default NextAuth(authOptions);
