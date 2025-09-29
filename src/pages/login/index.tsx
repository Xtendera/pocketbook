import { useState } from 'react';
import type { NextPageWithLayout } from '../_app';
import type { GetServerSideProps } from 'next';
import { trpc } from '~/utils/trpc';
import { useRouter } from 'next/router';
import Footer from '~/components/layout/Footer';
import Input from '~/components/ui/Input';
import Button from '~/components/ui/Button';
import { setJwtToken } from '~/utils/cookies';

interface LoginPageProps {
  config: {
    isDemoMode: boolean;
  };
}

const LoginPage: NextPageWithLayout<LoginPageProps> = ({ config }) => {
  const utils = trpc.useUtils(); // Gets the tRPC object with all of the remote calls from the server

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

    // Set JWT token using cookie utility (7 days expiration)
    setJwtToken(await resp.token);

    router.push('/');
  }

  function userChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUser(e.target.value);
  }

  function passChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPass(e.target.value);
  }

  return (
    <div className="flex flex-col h-screen mx-8">
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <h2 className="text-4xl">Login</h2>
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
            <Input
              type="text"
              name="username"
              onChange={userChange}
              placeholder="Username"
              className="outline-hidden focus:outline-hidden"
            />
            <Input
              type="password"
              name="password"
              onChange={passChange}
              placeholder="Password"
              className="outline-hidden focus:outline-hidden"
            />
            <Button type="submit" disabled={!btnOn}>
              {btnText}
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;

export const getServerSideProps: GetServerSideProps<
  LoginPageProps
> = async () => {
  const appConfig = {
    isDemoMode: process.env.DEMO === 'true',
  };

  return {
    props: {
      config: appConfig,
    },
  };
};
