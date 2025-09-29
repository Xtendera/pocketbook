import Nav from '~/components/layout/Nav';
import { NextPageWithLayout } from '../_app';
import Footer from '~/components/layout/Footer';
import CollectionsGrid from '~/components/grids/CollectionsGrid';

const CollectionsPage: NextPageWithLayout = () => {
  return (
    <div className="flex flex-col h-screen mx-8">
      <Nav />
      <div className="flex-1">
        <CollectionsGrid />
      </div>
      <Footer />
    </div>
  );
};

export default CollectionsPage;
