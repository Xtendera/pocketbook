import Nav from '~/components/Nav';
import { NextPageWithLayout } from '../_app';
import Footer from '~/components/Footer';
import CollectionsGrid from '~/components/CollectionsGrid';

const CollectionsPage: NextPageWithLayout = () => {
  return (
    <div className="flex flex-col h-screen mx-8">
      <Nav />
      <div className="flex-1">
        <h2 className="text-2xl mt-10">Collections</h2>
        <CollectionsGrid />
      </div>
      <Footer />
    </div>
  );
};

export default CollectionsPage;
