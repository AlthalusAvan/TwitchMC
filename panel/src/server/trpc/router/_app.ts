import { router } from "../trpc";
import { authRouter } from "./auth";
import { serverRouter } from "./server";
import { mcUserRouter } from "./mcUser";

export const appRouter = router({
  auth: authRouter,
  server: serverRouter,
  mcUser: mcUserRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
