import React from 'react';
import { trpc } from '~/utils/trpc';
import Loading from '../ui/Loading';
import type { RouterOutput } from '~/utils/trpc';

const CollectionsGrid: React.FC = () => {
  const {
    data: books,
    isLoading: booksLoading,
    error: booksError,
  } = trpc.books.list.useQuery();
  const {
    data: collectionsData,
    isLoading: collectionsLoading,
    error: collectionsError,
  } = trpc.books.listCollections.useQuery();

  const collections = collectionsData?.collections || [];

  const handleCollectionClick = (collectionUuid: string) => {
    // Navigate to collection view (placeholder)
    console.log('Navigate to collection:', collectionUuid);
  };

  const bookMap = new Map(books?.map((book) => [book.uuid, book]) || []);

  const renderCollectionCover = (
    collectionBooks: { uuid: string; title: string }[],
  ) => {
    const booksWithCovers = collectionBooks
      .map((collectionBook) => bookMap.get(collectionBook.uuid))
      .filter(Boolean)
      .slice(0, 4);

    const displayBooks: (RouterOutput['books']['list'][0] | undefined)[] = [
      ...booksWithCovers,
    ];
    while (displayBooks.length < 4) {
      displayBooks.push(undefined);
    }

    return (
      <div className="w-full h-full grid grid-cols-2 gap-0.5">
        {displayBooks.map((book, index) => (
          <img
            key={book?.uuid || `placeholder-${index}`}
            src={book?.cover || '/placeholder.jpg'}
            alt={book?.title || ''}
            className="w-full h-full object-cover"
          />
        ))}
      </div>
    );
  };

  // Loading
  if (booksLoading || collectionsLoading) {
    return (
      <div className="flex justify-center items-center mt-10">
        <Loading />
      </div>
    );
  }

  if (booksError || collectionsError) {
    return (
      <div className="flex justify-center items-center mt-10">
        <p className="text-red-500">
          Error loading data: {booksError?.message || collectionsError?.message}
        </p>
      </div>
    );
  }

  if (!collections || collections.length === 0) {
    return (
      <div className="flex justify-center items-center mt-10">
        <p className="text-gray-500">No collections found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 mt-6">
      {collections.map((collection) => (
        <div key={collection.uuid} className="flex flex-col">
          <div className="relative size-auto group overflow-hidden transition-all duration-400 rounded-2xl hover:rounded-none aspect-square">
            <div
              onClick={() => handleCollectionClick(collection.uuid)}
              className="w-full h-full hover:cursor-pointer shadow-md"
            >
              {renderCollectionCover(collection.books)}
            </div>
          </div>
          <span className="text-white text-center mt-2">{collection.name}</span>
        </div>
      ))}
    </div>
  );
};

export default CollectionsGrid;
