import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const mcUserRouter = router({
  getMcUser: protectedProcedure.query(({ ctx }) => {
    const mcUser = ctx.prisma.minecraftUser.findUnique({
      where: {
        userId: ctx.session.user.id,
      },
    });

    return mcUser;
  }),
  connectMcUser: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const mcUser = await ctx.prisma.minecraftUser.findUnique({
        where: {
          userId: ctx.session.user.id,
        },
      });

      if (mcUser) {
        return mcUser;
      }

      const token = await ctx.prisma.uUIDVerificationToken.findUnique({
        where: {
          code: input.code,
        },
      });

      if (!token) {
        throw new Error("Invalid code");
      }

      const newUser = await ctx.prisma.minecraftUser.create({
        data: {
          id: token.UUID,
          userId: ctx.session.user.id,
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
