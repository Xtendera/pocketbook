import type { NextPageWithLayout } from './_app';
import Nav from '~/components/layout/Nav';
import { Suspense, lazy, useState, useEffect } from 'react';
import Loading from '~/components/ui/Loading';
import Modal from '~/components/ui/Modal';
import Button from '~/components/ui/Button';
import { GetServerSideProps } from 'next';
import Footer from '~/components/layout/Footer';

const BookGrid = lazy(() => import('../components/grids/BookGrid'));

interface MainPageProps {
  config: {
    isDemoMode: boolean;
  };
}

const IndexPage: NextPageWithLayout<MainPageProps> = ({ config }) => {
  const [showDemoWarning, setShowDemoWarning] = useState(false);

  useEffect(() => {
    if (config.isDemoMode) {
      setShowDemoWarning(true);
    }
  }, [config.isDemoMode]);

  return (
    <div className="flex flex-col h-screen mx-8">
      <Nav />
      <div className="flex-1">
        <div>
          <h2 className="text-2xl mt-10">Library</h2>
          <Suspense fallback={<Loading />}>
            <BookGrid />
          </Suspense>
        </div>

        {/* Demo Warning Popup */}
        {showDemoWarning && (
          <Modal isOpen={showDemoWarning} title="Demo Environment Notice">
            <div className="space-y-3 text-gray-400 w-full">
              <div className="flex items-start space-x-3">
                <span className="text-red-400 font-bold text-lg">•</span>
                <span>Don't upload pirated material.</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-red-400 font-bold text-lg">•</span>
                <span>Don't upload excessively.</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-red-400 font-bold text-lg">•</span>
                <span>Files may be wiped periodically.</span>
              </div>
            </div>
            <Button
              onClick={() => setShowDemoWarning(false)}
              className="w-full"
            >
              I Understand
            </Button>
          </Modal>
        )}
      </div>
      <Footer />
    </div>
  );
};
export default IndexPage;

export const getServerSideProps: GetServerSideProps<
  MainPageProps
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
