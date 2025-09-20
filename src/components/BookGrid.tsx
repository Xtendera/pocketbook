import { useRef, useState } from 'react';
import { trpc } from '~/utils/trpc';
import Loading from './Loading';
import UploadModal from './UploadModal';
import { useRouter } from 'next/router';
import type { RouterOutput } from '~/utils/trpc';

const BookGrid: React.FC = () => {
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

  const handleUpload = async (title: string, files: FileList) => {
    setUploading(true);

    try {
      const formData = new FormData();

      for (let i = 0; i < files.length; i++) {
        formData.append('books', files[i]);
      }

      formData.append('title', title);

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

      <div
        className={`w-full h-full transition-all duration-400 border-gray-600 hover:border-gray-400 border-dashed border-4 flex items-center justify-center cursor-pointer group ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={uploading ? undefined : handlePlusClick}
      >
        <div
          className={`transition-all duration-400 fill-gray-600 group-hover:fill-gray-400 ${uploading ? 'animate-spin' : ''}`}
        >
          {uploading ? <Loading /> : add_circle()}
        </div>
      </div>
      {books?.map((item) => {
        const cover = item.cover;
        return (
          <div className="relative size-auto group">
            <img
              key={item.uuid}
              src={cover || '/example2.jpg'}
              alt={item.title}
              onClick={() => handleBookRead(item)}
              className="w-full h-full hover:cursor-pointer object-cover transition-all duration-400 rounded-xl hover:rounded-none shadow-md"
            />
            <span className="opacity-0 group-hover:opacity-100 absolute inset-x-0 bottom-0 text-center bg-black/50 text-white p-2 rounded-b-xl transition-opacity duration-300 ease-in-out">
              {item.title}
            </span>
          </div>
        );
      })}
    </div>
  );
};

function add_circle() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="32px"
      viewBox="0 -960 960 960"
      width="32px"
    >
      <path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
    </svg>
  );
}

export default BookGrid;
