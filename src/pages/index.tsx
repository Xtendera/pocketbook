import type { NextPageWithLayout } from './_app';
import Nav from '~/components/Nav';
import { Suspense, lazy } from 'react';
import Loading from '~/components/Loading.tsx';
// import { Library } from '~/components/Library';

const Library = lazy(() => import('../components/BookGrid.tsx'));

const IndexPage: NextPageWithLayout = () => {
  return (
    <div className="min-w-screen min-h-screen mx-8">
      <Nav />
      <div>
        <h2 className="text-2xl mt-10">Library</h2>
        <Suspense fallback={<Loading />}>
          <Library />
        </Suspense>
      </div>
    </div>
  );
};
export default IndexPage;
