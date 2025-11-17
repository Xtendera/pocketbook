import { adminProcedure, router } from '~/server/trpc';
import { prisma } from '~/server/prisma';
import z from 'zod';
import { hashPassword } from '~/utils/password';
import { TRPCError } from '@trpc/server';

export const adminRouter = router({
  getUsers: adminProcedure.query(async () => {
    const users = await prisma.user.findMany({
      select: {
        uuid: true,
        username: true,
        permission: true,
      },
    });

    return users.map((user) => ({
      id: user.uuid,
      username: user.username,
      permissionLevel: user.permission,
      status: 'Active', // WIP
    }));
  }),
  createUser: adminProcedure
    .input(
      z.object({
        username: z.string().min(4).max(25),
        permission: z.int().min(0).max(2),
        password: z.string().min(6).max(25).optional(),
      }),
    )
    .mutation(async (req) => {
      if (req.input.password) {
        await prisma.user.create({
          data: {
            username: req.input.username,
            passwordHash: await hashPassword(req.input.username),
            permission: req.input.permission,
          },
        });
      } else {
        await prisma.user.create({
          data: {
            username: req.input.username,
            passwordHash: '', // No password for now, will be created on user registration
            permission: req.input.permission,
            status: 2, // Unactivated
          },
        });
      }
    }),
  deleteUser: adminProcedure.mutation(() => {
    throw new TRPCError({
      code: 'NOT_IMPLEMENTED',
    });
  }),
});
