/**
 * This file contains the root router of your tRPC-backend
 */
import { createCallerFactory, publicProcedure, router } from '../trpc';
import { authRouter } from './auth';
import { postRouter } from './post';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'),

  post: postRouter,
  auth: authRouter
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
