import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const userRouter = router({
  getUser: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    });
  }),
  connectMcAccount: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
      });

      if (user && user.UUID) {
        return user;
      }

      const token = await ctx.prisma.uUIDVerificationToken.findUnique({
        where: {
          code: input.code,
        },
      });

      if (!token) {
        throw new Error("Invalid code");
      }

      const newUser = await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          UUID: token.UUID,
        },
      });

      await ctx.prisma.uUIDVerificationToken.delete({
        where: {
          code: input.code,
        },
      });

      return newUser;
    }),
});
