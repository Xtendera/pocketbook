import argon2 from 'argon2';

export async function hashPassword(password: string) {
  try {
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 1, // 3 iterations
      parallelism: 1, // 1 thread
    });
    return hash;
  } catch (err) {
    console.error('Error hashing password:', err);
    throw err;
  }
}
