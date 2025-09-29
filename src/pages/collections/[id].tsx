import { useRouter } from 'next/router';
import { NextPageWithLayout } from '../_app';
import { DefaultLayout } from '~/components/layout';
import CollectionBooksGrid from '~/components/grids/CollectionBooksGrid';
import { trpc } from '~/utils/trpc';
import Loading from '~/components/ui/Loading';
import Link from 'next/link';

const CollectionPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;

  const {
    data: collection,
    isLoading,
    error,
  } = trpc.books.getCollection.useQuery(
    { id: id as string },
    { enabled: !!id },
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center mt-10">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center mt-10">
        <p className="text-red-500 mb-4">
          Error loading collection: {error.message}
        </p>
        <Link href="/collections" className="text-blue-400 hover:text-blue-300">
          ← Back to Collections
        </Link>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="flex flex-col items-center mt-10">
        <p className="text-gray-500 mb-4">Collection not found</p>
        <Link href="/collections" className="text-blue-400 hover:text-blue-300">
          ← Back to Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full mx-8">
      <div className="flex items-center gap-4 mt-6">
        <Link href="/collections" className="text-blue-400 hover:text-blue-300">
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-white">{collection.name}</h1>
        <span className="text-gray-400">
          (
          {collection.books.length == 1
            ? collection.books.length + ' book'
            : collection.books.length + ' books'}
          )
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        <CollectionBooksGrid collectionId={id as string} />
      </div>
    </div>
  );
};

CollectionPage.getLayout = function getLayout(page) {
  return <DefaultLayout>{page}</DefaultLayout>;
};

export default CollectionPage;
