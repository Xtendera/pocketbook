import { prisma } from '~/server/prisma';

export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    select: {
      permission: true,
    },
    where: {
      uuid: userId,
    },
  });
  if (user && user.permission >= 2) {
    // Admin (or above for future use, like an owner role)
    return true;
  }
  return false;
}
