import Nav from '~/components/layout/Nav';
import { NextPageWithLayout } from '../_app';
import { trpc } from '~/utils/trpc';
import Loading from '~/components/ui/Loading';
import { GetServerSideProps } from 'next';
import { useState } from 'react';
import ResetModal from '~/components/modals/ResetModal';
import Footer from '~/components/layout/Footer';
import InfoIcon from '~/components/icons/InfoIcon';
import Button from '~/components/ui/Button';

interface SettingsPageProps {
  config: {
    isDemoMode: boolean;
  };
}

interface SettingsPageProps {
  config: {
    isDemoMode: boolean;
  };
}

const SettingsPage: NextPageWithLayout<SettingsPageProps> = ({ config }) => {
  const { data: userInfo, isLoading, error } = trpc.auth.getInfo.useQuery();
  const [resetModal, setResetModal] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className="min-h-screen mx-8">
        <Nav />
        <div className="mt-2 flex justify-center items-center">
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen mx-8">
        <Nav />
        <div className="mt-2">
          <span className="text-xl text-red-500">Error: {error.message}</span>
        </div>
      </div>
    );
  }

  function onResetClick() {
    setResetModal(true);
  }

  function onClose() {
    setResetModal(false);
  }

  return (
    <div className="flex flex-col h-screen mx-8">
      <Nav />
      <ResetModal isOpen={resetModal} onClose={onClose} />
      <div className="mt-2 flex-1 flex flex-col">
        <span className="text-xl">Username: {userInfo?.username}</span>
        <span className="text-xl">
          Password: ****
          <Button
            size="sm"
            disabled={config.isDemoMode}
            onClick={() => onResetClick()}
            className="ml-1.5"
          >
            Reset
          </Button>
          {config.isDemoMode ? (
            <span className="text-base ml-1 text-yellow-300 inline-flex items-center gap-1">
              <InfoIcon className="text-yellow-300 inline-block flex-shrink-0" />
              Cannot reset password in DEMO mode
            </span>
          ) : (
            ''
          )}
        </span>
      </div>
      <Footer />
    </div>
  );
};

export default SettingsPage;

export const getServerSideProps: GetServerSideProps<
  SettingsPageProps
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
