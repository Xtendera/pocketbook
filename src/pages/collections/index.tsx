import Nav from '~/components/layout/Nav';
import { NextPageWithLayout } from '../_app';
import Footer from '~/components/layout/Footer';
import CollectionsGrid from '~/components/grids/CollectionsGrid';
import AddCircleIcon from '~/components/icons/AddCircleIcon';

const CollectionsPage: NextPageWithLayout = () => {
  return (
    <div className="flex flex-col h-screen mx-8">
      <Nav />
      <div className="flex-1">
        <h2 className="flex items-center text-2xl mt-10">
          Collections
          <button className="cursor-pointer ml-2">
            <AddCircleIcon size={32} className="text-white" />
          </button>
        </h2>
        <CollectionsGrid />
      </div>
      <Footer />
    </div>
  );
};

export default CollectionsPage;
