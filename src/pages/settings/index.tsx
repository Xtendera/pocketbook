import Nav from '~/components/Nav';
import { NextPageWithLayout } from '../_app';
import { trpc } from '~/utils/trpc';
import Loading from '~/components/Loading';
import { GetServerSideProps } from 'next';
import { useState } from 'react';
import ResetModal from '~/components/ResetModal';

interface SettingsPageProps {
  config: {
    isDemoMode: boolean;
  };
}

const InfoIcon: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="16px"
      viewBox="0 -960 960 960"
      width="16px"
      className="text-yellow-300 inline-block flex-shrink-0"
      fill="currentColor"
    >
      <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
    </svg>
  );
};

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
    <div className="min-h-screen mx-8">
      <Nav />
      <ResetModal isOpen={resetModal} onClose={onClose} />
      <div className="mt-2 grid grid-cols-1">
        <span className="text-xl">Username: {userInfo?.username}</span>
        <span className="text-xl">
          Password: ****
          <button
            disabled={config.isDemoMode}
            onClick={() => onResetClick()}
            className="px-2 py-1 ml-1.5 text-base bg-pocket-blue hover:bg-blue-600 disabled:bg-pocket-disabled disabled:cursor-default text-white rounded-md cursor-pointer transition-colors"
          >
            Reset
          </button>
          {config.isDemoMode ? (
            <span className="text-base ml-1 text-yellow-300 inline-flex items-center gap-1">
              <InfoIcon />
              Cannot reset password in DEMO mode
            </span>
          ) : (
            ''
          )}
        </span>
      </div>
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
