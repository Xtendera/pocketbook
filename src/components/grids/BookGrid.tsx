import { useRef, useState } from 'react';
import { trpc } from '~/utils/trpc';
import Loading from '../ui/Loading';
import UploadModal from '../modals/UploadModal';
import AddCircleIcon from '../icons/AddCircleIcon';
import { useRouter } from 'next/router';
import type { RouterOutput } from '~/utils/trpc';
import { CheckIcon } from '../icons';

interface BookGridProps {
  selection?: boolean;
  selectedBooks?: string[];
  setSelectedBooks?: (selected: string[]) => void;
}

const BookGrid: React.FC<BookGridProps> = ({
  selection,
  selectedBooks,
  setSelectedBooks,
}) => {
  const utils = trpc.useUtils();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const handlePlusClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const invalidFiles = Array.from(files).filter(
      (file) => !file.name.toLowerCase().endsWith('.epub'),
    );

    if (invalidFiles.length > 0) {
      alert(
        `Please select only EPUB files. Invalid files: ${invalidFiles.map((f) => f.name).join(', ')}`,
      );
      e.target.value = '';
      return;
    }

    setSelectedFiles(files);
    setShowModal(true);
    e.target.value = ''; // Reset file input
  };

  const handleUpload = async (
    isPrivate: boolean,
    title: string,
    files: FileList,
  ) => {
    setUploading(true);
    try {
      const formData = new FormData();

      for (let i = 0; i < files.length; i++) {
        formData.append('books', files[i]);
      }

      formData.append('title', title);
      formData.append('isPrivate', isPrivate ? 'true' : 'false');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        await utils.books.list.invalidate();
        setShowModal(false);
        setSelectedFiles(null);
      } else {
        alert(`Upload failed: ${result.message}`);
      }
    } catch {
      alert('Upload failed due to network error');
    } finally {
      setUploading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedFiles(null);
  };

  const handleBookRead = (bookItem: RouterOutput['books']['list'][0]) => {
    router.push(`/reader/${bookItem.uuid}`);
  };

  const { data: books, isLoading, error } = trpc.books.list.useQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center mt-10">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center mt-10">
        <p className="text-red-500">Error loading books: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 mt-6">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".epub,application/epub+zip"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <UploadModal
        isOpen={showModal}
        onClose={handleModalClose}
        onUpload={handleUpload}
        files={selectedFiles}
        uploading={uploading}
      />

      {!selection && (
        <div
          className={`w-full h-full transition-all duration-400 border-gray-600 hover:border-gray-400 border-dashed border-4 rounded-2xl flex items-center justify-center cursor-pointer group ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={uploading ? undefined : handlePlusClick}
        >
          <div
            className={`transition-all duration-400 fill-gray-600 group-hover:fill-gray-400 ${uploading ? 'animate-spin' : ''}`}
          >
            {uploading ? (
              <Loading />
            ) : (
              <AddCircleIcon
                size={32}
                className="transition-all duration-400 fill-gray-600 group-hover:fill-gray-400"
              />
            )}
          </div>
        </div>
      )}
      {books?.map((item) => {
        const cover = item.cover;
        const isSelected = selection && selectedBooks?.includes(item.uuid);
        return (
          <div
            className={`relative size-auto group overflow-hidden transition-all duration-400 rounded-2xl ${
              selection ? isSelected && 'scale-90' : 'hover:scale-105'
            }`}
          >
            <img
              key={item.uuid}
              src={cover || '/placeholder.jpg'}
              alt={item.title}
              onClick={
                selection
                  ? () => {
                      const currentSelected = selectedBooks || [];
                      const isSelected = currentSelected.includes(item.uuid);
                      const newSelected = isSelected
                        ? currentSelected.filter((id) => id !== item.uuid)
                        : [...currentSelected, item.uuid];
                      setSelectedBooks?.(newSelected);
                    }
                  : () => handleBookRead(item)
              }
              className="w-full h-full hover:cursor-pointer object-cover shadow-md"
            />
            <span className="opacity-0 group-hover:opacity-100 absolute inset-x-0 bottom-0 text-center bg-black/50 text-white p-2 transition-opacity duration-400 ease-in-out pointer-events-none select-none">
              {item.title}
            </span>
            {isSelected && (
              <div className="absolute top-2 right-2 bg-pocket-blue text-white rounded-full p-1 shadow-lg flex items-center justify-center">
                <CheckIcon size={24} className="text-white" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BookGrid;
