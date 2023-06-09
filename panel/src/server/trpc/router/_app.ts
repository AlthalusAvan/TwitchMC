import { router } from "../trpc";
import { authRouter } from "./auth";
import { serverRouter } from "./server";
import { userRouter } from "./user";

export const appRouter = router({
  auth: authRouter,
  server: serverRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
