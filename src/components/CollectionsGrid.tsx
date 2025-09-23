// Mock data for collections
const mockCollections = [
  {
    uuid: 'collection-1',
    name: 'Fantasy Collection',
    books: [
      { uuid: 'book-1', cover: '/example2.jpg' },
      { uuid: 'book-2', cover: '/example2.jpg' },
      { uuid: 'book-3', cover: '/example2.jpg' },
      { uuid: 'book-4', cover: '/example2.jpg' },
    ],
  },
  {
    uuid: 'collection-2',
    name: 'Science Fiction',
    books: [
      { uuid: 'book-5', cover: '/example2.jpg' },
      { uuid: 'book-6', cover: '/example2.jpg' },
      { uuid: 'book-7', cover: '/example2.jpg' },
    ],
  },
  {
    uuid: 'collection-3',
    name: 'Programming Books',
    books: [
      { uuid: 'book-8', cover: '/example2.jpg' },
      { uuid: 'book-9', cover: '/example2.jpg' },
    ],
  },
];

const CollectionsGrid: React.FC = () => {
  const handleCollectionClick = (collectionUuid: string) => {
    // Navigate to collection view (placeholder)
    console.log('Navigate to collection:', collectionUuid);
  };

  const renderCollectionCover = (books: { uuid: string; cover: string }[]) => {
    const displayBooks = [...books.slice(0, 4)];
    while (displayBooks.length < 4) {
      displayBooks.push({ uuid: '', cover: '/example2.jpg' });
    }

    return (
      <div className="w-full h-full grid grid-cols-2 gap-0.5">
        {displayBooks.map((book, index) => (
          <img
            key={book.uuid || `placeholder-${index}`}
            src={book.cover}
            alt=""
            className="w-full h-full object-cover"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 mt-6">
      {mockCollections.map((collection) => (
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
