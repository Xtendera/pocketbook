import type { NextPageWithLayout } from './_app';
import Nav from '~/components/Nav';
import { Suspense, lazy, useState, useEffect } from 'react';
import Loading from '~/components/Loading';
import { GetServerSideProps } from 'next';

const BookGrid = lazy(() => import('../components/BookGrid'));

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
    <div className="min-h-screen mx-8">
      <Nav />
      <div>
        <h2 className="text-2xl mt-10">Library</h2>
        <Suspense fallback={<Loading />}>
          <BookGrid />
        </Suspense>
      </div>

      {/* Demo Warning Popup */}
      {showDemoWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-xl font-semibold text-red-600 mb-4">Demo Environment Notice</h3>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start space-x-2">
                <span className="text-red-500 font-bold">•</span>
                <span>Don't upload pirated material.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-red-500 font-bold">•</span>
                <span>Don't upload excessively.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-red-500 font-bold">•</span>
                <span>Files may be wiped periodically.</span>
              </div>
            </div>
            <button
              onClick={() => setShowDemoWarning(false)}
              className="mt-6 w-full bg-pocket-blue text-white py-2 px-4 rounded-xl hover:bg-pocket-blue/90 transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default IndexPage;

export const getServerSideProps: GetServerSideProps<MainPageProps> = async () => {
  const appConfig = {
    isDemoMode: process.env.DEMO === 'true',
  };

  return {
    props: {
      config: appConfig,
    },
  };
};
