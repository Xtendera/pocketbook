import { trpc } from '../utils/trpc';
import type { NextPageWithLayout } from './_app';
import type { inferProcedureInput } from '@trpc/server';
import Link from 'next/link';
import { Fragment } from 'react';
import type { AppRouter } from '~/server/routers/_app';

const IndexPage: NextPageWithLayout = () => {
  const utils = trpc.useUtils(); // Gets the tRPC object with all of the remote calls from the server
  const postsQuery = trpc.post.list.useInfiniteQuery(
    {
      limit: 5,
    },
    {
      getNextPageParam(lastPage) {
        return lastPage.nextCursor;
      },
    },
  );

  const addPost = trpc.post.add.useMutation({
    async onSuccess() {
      // refetches posts after a post is added
      await utils.post.list.invalidate();
    },
  });

  // prefetch all posts for instant navigation
  // useEffect(() => {
  //   const allPosts = postsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  //   for (const { id } of allPosts) {
  //     void utils.post.byId.prefetch({ id });
  //   }
  // }, [postsQuery.data, utils]);

  return (
  <div className="min-h-screen flex flex-col">
    <h1 className='text-3xl ml-8 mt-8 font-medium'>Pocket Book</h1>
    <div className='flex-1 flex items-center justify-center'>
      <div className="flex flex-col items-center space-y-6">
        <h2 className='text-4xl'>Login</h2>
        <form className="flex flex-col space-y-4 w-64" action="" method="post">
          <input 
            type="text" 
            name="username" 
            id="user_text" 
            placeholder="Username"
            className="px-3 py-2 bg-pocket-field border border-pocket-blue rounded-xl outline-none focus:outline-none"
          />
          <input 
            type="password" 
            name="password" 
            id="pass_text" 
            placeholder="Password"
            className="px-3 py-2 bg-pocket-field border border-pocket-blue rounded-xl outline-none focus:outline-none"
          />
          <input 
            type="submit" 
            value="LOGIN"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer"
          />
        </form>
      </div>
    </div>
  </div>
  );
};

export default IndexPage;

/**
 * If you want to statically render this page
 * - Export `appRouter` & `createContext` from [trpc].ts
 * - Make the `opts` object optional on `createContext()`
 *
 * @see https://trpc.io/docs/v11/ssg
 */
// export const getStaticProps = async (
//   context: GetStaticPropsContext<{ filter: string }>,
// ) => {
//   const ssg = createServerSideHelpers({
//     router: appRouter,
//     ctx: await createContext(),
//   });
//
//   await ssg.post.all.fetch();
//
//   return {
//     props: {
//       trpcState: ssg.dehydrate(),
//       filter: context.params?.filter ?? 'all',
//     },
//     revalidate: 1,
//   };
// };
