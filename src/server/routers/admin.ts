import { adminProcedure, router } from '~/server/trpc';
import { prisma } from '~/server/prisma';
import z from 'zod';
import { hashPassword } from '~/utils/password';
import { User } from '@prisma/client';
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
      let user: User;
      if (req.input.password) {
        user = await prisma.user.create({
          data: {
            username: req.input.username,
            passwordHash: await hashPassword(req.input.username),
            permission: req.input.permission,
          },
        });
      } else {
        user = await prisma.user.create({
          data: {
            username: req.input.username,
            passwordHash: '', // No password for now, will be created on user registration
            permission: req.input.permission,
            status: 2, // Unactivated
          },
        });
      }
      return {
        newUserId: user.uuid,
      };
    }),
  deleteUser: adminProcedure
    .input(z.string().length(36))
    .mutation(async (req) => {
      const user = await prisma.user.delete({
        where: {
          uuid: req.input,
        },
      });
      if (!user) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid User ID',
        });
      }
    }),
  changeUserStatus: adminProcedure
    .input(
      z.object({
        userId: z.string().length(36),
        status: z.int().min(0).max(1), // Disabled or enabled; The "unactivated" status is internal-only
      }),
    )
    .mutation((req) => {
      const user = prisma.user.update({
        where: {
          uuid: req.input.userId,
        },
        data: {
          status: req.input.status,
        },
      });
      if (!user) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid User ID',
        });
      }
    }),
  changeUserPermission: adminProcedure
    .input(
      z.object({
        userId: z.string().length(36),
        permission: z.int().min(0).max(2),
      }),
    )
    .mutation((req) => {
      const user = prisma.user.update({
        where: {
          uuid: req.input.userId,
        },
        data: {
          permission: req.input.permission,
        },
      });
      if (!user) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid User ID',
        });
      }
    }),
});
