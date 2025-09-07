/**
 * This file contains the root router of your tRPC-backend
 */
import { createCallerFactory, publicProcedure, router } from '../trpc';
import { authRouter } from './auth';
import { booksRouter } from './books';
export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'),
  
  auth: authRouter,

  books: booksRouter
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
