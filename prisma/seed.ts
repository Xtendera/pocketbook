/**
 * Adds seed data to your db
 *
 * @see https://www.prisma.io/docs/guides/database/seed-database
 */
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  try {
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,   // 64 MB
      timeCost: 1,           // 3 iterations
      parallelism: 1,        // 1 thread
    });
    return hash;
  } catch (err) {
    console.error('Error hashing password:', err);
    throw err;
  }
}

async function main() {
  
  await prisma.user.upsert({
    where: {
      username: 'admin'
    },
    create: {
      username: 'admin',
      passwordHash: await hashPassword('test123'),
      permission: 3
    },
    update: {}
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
