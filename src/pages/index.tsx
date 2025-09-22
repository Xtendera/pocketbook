import type { NextPageWithLayout } from './_app';
import Nav from '~/components/Nav';
import { Suspense, lazy, useState, useEffect } from 'react';
import Loading from '~/components/Loading';
import { GetServerSideProps } from 'next';
import Footer from '~/components/Footer';

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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#17171d] border border-pocket-blue rounded-xl p-8 w-96 max-w-[90vw]">
              <div className="flex flex-col items-center space-y-6">
                <h3 className="text-2xl text-white font-semibold">
                  Demo Environment Notice
                </h3>
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
                <button
                  onClick={() => setShowDemoWarning(false)}
                  className="w-full px-4 py-2 bg-pocket-blue hover:bg-blue-600 text-white rounded-xl cursor-pointer transition-colors"
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
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
