import React, { useState } from 'react';
import { trpc } from '~/utils/trpc';
import Loading from '../ui/Loading';
import type { RouterOutput } from '~/utils/trpc';
import { Button, LargeModal } from '../ui';
import { AddCircleIcon } from '../icons';
import BookGrid from './BookGrid';

interface NewCollectionModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  selectedBooks: string[];
  setSelectedBooks: (selected: string[]) => void;
}

const NewCollectionModal: React.FC<NewCollectionModalProps> = ({
  showModal,
  setShowModal,
  selectedBooks,
  setSelectedBooks,
}) => {
  return (
    <LargeModal
      isOpen={showModal}
      title="Select Books for Collection"
      onClose={() => setShowModal(false)}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto">
          <BookGrid
            selection={true}
            selectedBooks={selectedBooks}
            setSelectedBooks={setSelectedBooks}
          />
        </div>
        <div className="flex justify-end mt-4">
          <Button>Save {selectedBooks.length} Books</Button>
        </div>
      </div>
    </LargeModal>
  );
};

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

  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);

  const collections = collectionsData?.collections || [];
  const [showModal, setShowModal] = useState(false);

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
      <>
        <h2 className="flex items-center text-2xl mt-10">Collections</h2>
        <div className="flex justify-center items-center mt-10">
          <Loading />
        </div>
      </>
    );
  }

  if (booksError || collectionsError) {
    return (
      <>
        <h2 className="flex items-center text-2xl mt-10">Collections</h2>
        <div className="flex justify-center items-center mt-10">
          <p className="text-red-500">
            Error loading data:{' '}
            {booksError?.message || collectionsError?.message}
          </p>
        </div>
      </>
    );
  }

  if (!collections || collections.length === 0) {
    return (
      <>
        <h2 className="flex items-center text-2xl mt-10">
          Collections
          <button
            className="cursor-pointer ml-2"
            onClick={() => setShowModal(true)}
          >
            <AddCircleIcon size={32} className="text-white" />
          </button>
        </h2>
        <div className="flex justify-center items-center mt-10">
          <NewCollectionModal
            showModal={showModal}
            setShowModal={setShowModal}
            selectedBooks={selectedBooks}
            setSelectedBooks={setSelectedBooks}
          />
          <p className="text-gray-500">No collections found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="flex items-center text-2xl mt-10">
        Collections
        <button
          className="cursor-pointer ml-2"
          onClick={() => setShowModal(true)}
        >
          <AddCircleIcon size={32} className="text-white" />
        </button>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 mt-6">
        <NewCollectionModal
          showModal={showModal}
          setShowModal={setShowModal}
          selectedBooks={selectedBooks}
          setSelectedBooks={setSelectedBooks}
        />
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
            <span className="text-white text-center mt-2">
              {collection.name}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

export default CollectionsGrid;
