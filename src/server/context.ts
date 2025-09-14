/* eslint-disable @typescript-eslint/no-unused-vars */
import type * as trpcNext from '@trpc/server/adapters/next';

interface CreateContextOptions {
  userId?: string;
  username?: string;
}

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock Next.js' request/response
 */
export async function createContextInner(opts: CreateContextOptions) {
  return {
    userId: opts.userId,
    username: opts.username,
  };
}

export type Context = Awaited<ReturnType<typeof createContextInner>>;

/**
 * Creates context for an incoming request
 * @see https://trpc.io/docs/v11/context
 */
export async function createContext(
  opts: trpcNext.CreateNextContextOptions,
): Promise<Context> {
  // Extract user info from headers set by middleware
  const userId = opts.req.headers['x-user-id'] as string | undefined;
  const username = opts.req.headers['x-username'] as string | undefined;

  return await createContextInner({
    userId,
    username,
  });
}
