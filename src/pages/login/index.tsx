// import { trpc } from '../utils/trpc';
import { useState } from 'react';
import type { NextPageWithLayout } from '../_app';
import type { GetServerSideProps } from 'next';
import { trpc } from '~/utils/trpc';
import { useRouter } from 'next/router';
// import type { inferProcedureInput } from '@trpc/server';
// import Link from 'next/link';
// import { Fragment } from 'react';
// import type { AppRouter } from '~/server/routers/_app';

interface LoginPageProps {
  config: {
    isDemoMode: boolean;
  };
}

const LoginPage: NextPageWithLayout<LoginPageProps> = ({ config }) => {
  const utils = trpc.useUtils(); // Gets the tRPC object with all of the remote calls from the server
  // const postsQuery = trpc.post.list.useInfiniteQuery(
  //   {
  //     limit: 5,
  //   },
  //   {
  //     getNextPageParam(lastPage) {
  //       return lastPage.nextCursor;
  //     },
  //   },
  // );

  // const addPost = trpc.post.add.useMutation({
  //   async onSuccess() {
  //     // refetches posts after a post is added
  //     await utils.post.list.invalidate();
  //   },
  // });

  // prefetch all posts for instant navigation
  // useEffect(() => {
  //   const allPosts = postsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  //   for (const { id } of allPosts) {
  //     void utils.post.byId.prefetch({ id });
  //   }
  // }, [postsQuery.data, utils]);

  const router = useRouter();

  const [btnText, setBtnText] = useState<string>('LOGIN');
  const [btnOn, setBtnOn] = useState<boolean>(true);
  const [user, setUser] = useState<string>('');
  const [pass, setPass] = useState<string>('');
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBtnOn(false);
    setBtnText('Cooking...');
    const resp = await utils.client.auth.login.mutate({
      username: user,
      password: pass,
    });
    if (!resp) {
      setBtnText('Something broke :|');
      setBtnOn(true);
      return;
    }
    if (resp.err) {
      setBtnText(resp.err);
      setBtnOn(true);
      return;
    }
    if (!resp.token) {
      setBtnText('Something went wrong!');
      setBtnOn(true);
      return;
    }
    setBtnText('Done!');

    const week = 24 * 60 * 60 * 1000 * 7;
    await cookieStore.set({
      name: 'jwt',
      value: await resp.token,
      expires: Date.now() + week,
    });
    router.push('/');
  }

  function userChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUser(e.target.value);
  }

  function passChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPass(e.target.value);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <h2 className="text-4xl">Login</h2>
          {config.isDemoMode ? "geWgewsgews" : ""}
          {config.isDemoMode && (
            <div className="bg-pocket-blue/10 border border-pocket-blue/30 rounded-xl p-4 w-64">
              <div className="text-center text-pocket-blue text-sm font-medium mb-2">
                Demo Credentials
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Username:</span>
                  <span className="font-mono">admin</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Password:</span>
                  <span className="font-mono">test123</span>
                </div>
              </div>
            </div>
          )}
          <form
            className="flex flex-col space-y-4 w-64"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              name="username"
              onChange={userChange}
              id="user_text"
              placeholder="Username"
              className="px-3 py-2 bg-pocket-field border border-pocket-blue rounded-xl outline-hidden focus:outline-hidden"
            />
            <input
              type="password"
              name="password"
              onChange={passChange}
              id="pass_text"
              placeholder="Password"
              className="px-3 py-2 bg-pocket-field border border-pocket-blue rounded-xl outline-hidden focus:outline-hidden"
            />
            <input
              type="submit"
              value={btnText}
              disabled={!btnOn}
              className="px-4 py-2 bg-pocket-blue disabled:bg-pocket-disabled disabled:cursor-default text-white rounded-xl cursor-pointer"
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

export const getServerSideProps: GetServerSideProps<LoginPageProps> = async () => {
  const appConfig = {
    isDemoMode: process.env.DEMO === 'true',
  };

  return {
    props: {
      config: appConfig,
    }
  };
};

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
