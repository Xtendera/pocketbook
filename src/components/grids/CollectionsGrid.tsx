import React, { useState } from 'react';
import { trpc } from '~/utils/trpc';
import Loading from '../ui/Loading';
import { Button, LargeModal, Input } from '../ui';
import { AddCircleIcon } from '../icons';
import BookGrid from './BookGrid';
import { useRouter } from 'next/router';

interface NewCollectionModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  selectedBooks: string[];
  setSelectedBooks: (selected: string[]) => void;
  onSaveBooks: (collectionName: string) => void;
  isLoading?: boolean;
}

const NewCollectionModal: React.FC<NewCollectionModalProps> = ({
  showModal,
  setShowModal,
  selectedBooks,
  setSelectedBooks,
  onSaveBooks,
  isLoading = false,
}) => {
  const [collectionName, setCollectionName] = useState('');

  const handleSave = () => {
    const name = collectionName.trim() || 'Untitled Collection';
    onSaveBooks(name);
    setCollectionName('');
  };

  const handleClose = () => {
    setShowModal(false);
    setCollectionName('');
  };

  return (
    <LargeModal
      isOpen={showModal}
      title="Create New Collection"
      onClose={handleClose}
    >
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <Input
            placeholder="Collection Name"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-auto">
          <BookGrid
            selection={true}
            selectedBooks={selectedBooks}
            setSelectedBooks={setSelectedBooks}
          />
        </div>
        <div className="flex justify-end mt-4">
          <Button
            onClick={handleSave}
            disabled={isLoading || selectedBooks.length === 0}
          >
            {isLoading ? 'Saving...' : `Save ${selectedBooks.length} Books`}
          </Button>
        </div>
      </div>
    </LargeModal>
  );
};

const CollectionsGrid: React.FC = () => {
  const router = useRouter();
  const {
    data: books,
    isLoading: booksLoading,
    error: booksError,
  } = trpc.books.list.useQuery();
  const {
    data: collectionsData,
    isLoading: collectionsLoading,
    error: collectionsError,
    refetch: refetchCollections,
  } = trpc.books.listCollections.useQuery();

  const createCollection = trpc.books.createCollection.useMutation({
    onSuccess: () => {
      refetchCollections();
      setShowModal(false);
      setSelectedBooks([]);
    },
  });

  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);

  const collections = collectionsData?.collections || [];
  const [showModal, setShowModal] = useState(false);

  const handleSaveBooks = (collectionName: string) => {
    if (selectedBooks.length > 0) {
      createCollection.mutate({
        name: collectionName,
        bookIds: selectedBooks,
      });
    }
  };

  const handleCollectionClick = (collectionUuid: string) => {
    router.push(`/collections/${collectionUuid}`);
  };

  const bookMap = new Map(books?.map((book) => [book.uuid, book]) || []);

  const renderCollectionCover = (
    collectionBooks: { uuid: string; title: string }[],
  ) => {
    const booksWithCovers = collectionBooks
      .map((collectionBook) => bookMap.get(collectionBook.uuid))
      .filter(Boolean)
      .slice(0, 4);

    if (booksWithCovers.length === 0) {
      return <div className="w-full h-full bg-gray-800 rounded-lg"></div>;
    }

    const displayBooks = [...booksWithCovers];
    while (displayBooks.length < 4) {
      displayBooks.push(undefined);
    }

    return (
      <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5">
        {displayBooks.map((book, index) => (
          <div
            key={book?.uuid || `placeholder-${index}`}
            className="aspect-square overflow-hidden"
          >
            {book ? (
              <img
                src={book.cover || '/placeholder.png'}
                alt={book.title || ''}
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
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
            onSaveBooks={handleSaveBooks}
            isLoading={createCollection.isPending}
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
          onSaveBooks={handleSaveBooks}
          isLoading={createCollection.isPending}
        />
        {collections.map((collection) => (
          <div key={collection.uuid} className="flex flex-col">
            <div className="relative size-auto group overflow-hidden transition-all duration-400 rounded-2xl hover:scale-105 aspect-square border border-gray-600">
              <div
                onClick={() => handleCollectionClick(collection.uuid)}
                className="w-full h-full hover:cursor-pointer shadow-md"
              >
                {renderCollectionCover(collection.books)}
              </div>
            </div>
            <span className="text-white text-center text-lg mt-2">
              {collection.name}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

export default CollectionsGrid;
