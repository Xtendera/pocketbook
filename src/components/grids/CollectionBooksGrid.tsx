import React from 'react';
import { trpc } from '~/utils/trpc';
import Loading from '../ui/Loading';
import { useRouter } from 'next/router';

interface CollectionBooksGridProps {
  collectionId: string;
}

const CollectionBooksGrid: React.FC<CollectionBooksGridProps> = ({
  collectionId,
}) => {
  const router = useRouter();
  const { data: books, isLoading: booksLoading } = trpc.books.list.useQuery();
  const {
    data: collection,
    isLoading: collectionLoading,
    error,
  } = trpc.books.getCollection.useQuery({ id: collectionId });

  const handleBookRead = (bookUuid: string) => {
    router.push(`/reader/${bookUuid}`);
  };

  if (booksLoading || collectionLoading) {
    return (
      <div className="flex justify-center items-center mt-10">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center mt-10">
        <p className="text-red-500">
          Error loading collection: {error.message}
        </p>
      </div>
    );
  }

  if (!collection || !books) {
    return (
      <div className="flex justify-center items-center mt-10">
        <p className="text-gray-500">Collection not found</p>
      </div>
    );
  }

  const bookMap = new Map(books.map((book) => [book.uuid, book]));
  const collectionBooks = collection.books
    .map((collectionBook) => bookMap.get(collectionBook.uuid))
    .filter((book): book is NonNullable<typeof book> => Boolean(book));

  if (collectionBooks.length === 0) {
    return (
      <div className="flex justify-center items-center mt-10">
        <p className="text-gray-500">No books in this collection</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 mt-6">
      {collectionBooks.map((book) => (
        <div
          key={book.uuid}
          className="relative size-auto group overflow-hidden transition-all duration-400 rounded-2xl hover:scale-105"
        >
          <img
            src={book.cover || '/placeholder.png'}
            alt={book.title}
            onClick={() => handleBookRead(book.uuid)}
            className="w-full h-full hover:cursor-pointer object-cover shadow-md"
          />
          <span className="opacity-0 group-hover:opacity-100 absolute inset-x-0 bottom-0 text-center bg-black/50 text-white p-2 transition-opacity duration-400 ease-in-out pointer-events-none select-none">
            {book.title}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CollectionBooksGrid;
