import { useRouter } from 'next/router';
import type { NextPageWithLayout } from './_app';
import { trpc } from '~/utils/trpc';
import Nav from '~/components/Nav';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { BookList } from '~/server/routers/books';

const IndexPage: NextPageWithLayout = () => {
  const utils = trpc.useUtils();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

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

    setUploading(true);

    try {
      const formData = new FormData();

      for (let i = 0; i < files.length; i++) {
        formData.append('books', files[i]);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        e.target.value = '';
        await utils.books.list.invalidate();
      } else {
        alert(`Upload failed: ${result.message}`);
      }
    } catch (error) {
      alert('Upload failed due to network error');
    } finally {
      setUploading(false);
    }
  };

  const { data: books = [] } = trpc.books.list.useQuery();
  const [bookCovers, setBookCovers] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (books.length === 0) return;
    
    const fetchCovers = async () => {
      const coverPromises = books.map(async (book) => {
        const coverResult = await utils.books.cover.fetch({ bookID: book.uuid });
        return { uuid: book.uuid, cover: coverResult.cover };
      });
      
      const covers = await Promise.all(coverPromises);
      const coverMap = covers.reduce((acc, { uuid, cover }) => {
        acc[uuid] = cover;
        return acc;
      }, {} as Record<string, string | null>);
      
      setBookCovers(coverMap);
    };

    fetchCovers();
  }, [books, utils.books.cover]);

  return (
    <div className="min-w-screen min-h-screen mx-8">
      <Nav />
      <div>
        <h2 className="text-2xl mt-10">Library</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 mt-6">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".epub,application/epub+zip"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <div
            className={`w-full h-auto transition-all duration-400 border-gray-600 hover:border-gray-400 border-dashed border-4 flex items-center justify-center cursor-pointer group ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={uploading ? undefined : handlePlusClick}
          >
            <div
              className={`transition-all duration-400 fill-gray-600 group-hover:fill-gray-400 ${uploading ? 'animate-spin' : ''}`}
            >
              {uploading ? loading_circle() : add_circle()}
            </div>
          </div>
          {books.map((item) => {
            const cover = bookCovers[item.uuid];
            return (
              <img
                key={item.uuid}
                src={cover || "/example2.jpg"}
                alt={item.title}
                className="w-full h-full object-cover transition-all duration-400 rounded-xl hover:rounded-none shadow-md"
              />
            );
          })}
        </div>
      </div>
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

function loading_circle() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="32px"
      viewBox="0 -960 960 960"
      width="32px"
    >
      <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-156t86-127Q252-817 325-848.5T480-880q17 0 28.5 11.5T520-840q0 17-11.5 28.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-17 11.5-28.5T840-520q17 0 28.5 11.5T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127.5 86T480-80Z" />
    </svg>
  );
}

export default IndexPage;
