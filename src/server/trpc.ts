/**
 * This is your entry point to setup the root configuration for tRPC on the server.
 * - `initTRPC` should only be used once per app.
 * - We export only the functionality that we use so we can enforce which base procedures should be used
 *
 * Learn how to create protected base procedures and other things below:
 * @see https://trpc.io/docs/v11/router
 * @see https://trpc.io/docs/v11/procedures
 */

import { TRPCError, initTRPC } from '@trpc/server';
import { transformer } from '~/utils/transformer';
import type { Context } from './context';
import { getPermission } from '~/utils/auth';

const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/v11/data-transformers
   */
  transformer,
  /**
   * @see https://trpc.io/docs/v11/error-formatting
   */
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * Create a router
 * @see https://trpc.io/docs/v11/router
 */
export const router = t.router;

/**
 * Create an unprotected procedure
 * @see https://trpc.io/docs/v11/procedures
 **/
export const publicProcedure = t.procedure;

/**
 * Create a protected procedure that requires authentication
 * @see https://trpc.io/docs/v11/procedures
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this endpoint',
    });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId, // Now guaranteed to be defined
      username: ctx.username,
    },
  });
});

export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  const userPermission = await getPermission(ctx.userId);
  if (userPermission < 2) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You do not have sufficient permissions to perform this action',
    });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId, // Now guaranteed to be defined
      username: ctx.username,
      permission: userPermission,
    },
  });
});

/**
 * Merge multiple routers together
 * @see https://trpc.io/docs/v11/merging-routers
 */
export const mergeRouters = t.mergeRouters;

/**
 * Create a server-side caller
 * @see https://trpc.io/docs/v11/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;
