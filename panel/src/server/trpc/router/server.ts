import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const serverRouter = router({
  getServers: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;

    return ctx.prisma?.server.findMany({
      where: {
        userId: user.id,
      },
    });
  }),
  getServer: protectedProcedure
    .input(z.object({ serverId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma?.server.findUnique({
        where: {
          id: input.serverId,
        },
      });
    }),
  createServer: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const user = ctx.session.user;

      return ctx.prisma?.server.create({
        data: {
          name: input.name,
          userId: user.id,
          createdAt: new Date(),
          verificationCode: Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase(),
        },
      });
    }),
  deleteServer: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma?.server.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
