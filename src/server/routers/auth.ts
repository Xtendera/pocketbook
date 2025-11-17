import { prisma } from '~/server/prisma';
import { protectedProcedure, publicProcedure, router } from '~/server/trpc';
import { z } from 'zod';
import argon2 from 'argon2';
import { generateToken } from '~/utils/jwt';
import { hashPassword } from '~/utils/password';

export const authRouter = router({
  login: publicProcedure
    .input(
      z.object({
        username: z.string().min(4).max(25), // Arbritrary limits to prevent abuse
        password: z.string().min(6).max(25),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: {
          username: input.username,
        },
      });
      if (!user) {
        return {
          token: null,
          err: 'User not found!',
        };
      }
      if (!(await argon2.verify(user.passwordHash, input.password))) {
        return {
          token: null,
          err: 'Invalid password!',
        };
      }
      // Identity verification complete.

      const token = generateToken({
        sub: user.uuid,
        user: user.username,
        iat: Math.floor(Date.now() / 1000),
      });

      return {
        token: token,
        err: null,
      };
    }),
  getInfo: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: {
        uuid: ctx.userId,
      },
    });
    if (!user) {
      return {
        success: false,
        username: '',
        permission: 1,
      };
    }
    return {
      success: true,
      username: user.username,
      permission: user.permission,
    };
  }),
  resetPassword: protectedProcedure
    .input(
      z.object({
        oldPassword: z.string().min(6).max(25).nonempty(),
        newPasword: z.string().min(6).max(25).nonempty(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (process.env.DEMO === 'true') {
        return {
          success: false,
          message: 'This endpoint is disabled in DEMO mode!',
        };
      }
      const user = await prisma.user.findUnique({
        where: {
          uuid: ctx.userId,
        },
      });
      if (
        !user ||
        !(await argon2.verify(user.passwordHash, input.oldPassword))
      ) {
        return {
          success: false,
          message: 'Old password does not match!',
        };
      }
      const updatedUser = await prisma.user.update({
        where: {
          uuid: ctx.userId,
        },
        data: {
          passwordHash: await hashPassword(input.newPasword),
        },
      });
      if (!updatedUser) {
        return {
          success: false,
          message: 'Unkown error trying to update password!',
        };
      }
      return {
        success: true,
        message: '',
      };
    }),
});
