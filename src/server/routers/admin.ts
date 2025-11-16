import { publicProcedure, router } from '~/server/trpc';
import { prisma } from '~/server/prisma';

export const adminRouter = router({
  getUsers: publicProcedure.query(async () => {
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
});
