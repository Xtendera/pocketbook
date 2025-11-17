import { prisma } from '~/server/prisma';

export async function getPermission(
  userId: string | undefined,
): Promise<number> {
  const user = await prisma.user.findUnique({
    select: {
      permission: true,
    },
    where: {
      uuid: userId,
    },
  });
  if (user) {
    // Admin (or above for future use, like an owner role)
    return user.permission;
  }
  return -1;
}
