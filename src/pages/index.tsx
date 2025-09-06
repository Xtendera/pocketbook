// import { trpc } from '../utils/trpc';
import { useRouter } from 'next/router';
import type { NextPageWithLayout } from './_app';
import { trpc } from '~/utils/trpc';
import Nav from '~/components/Nav';
import Link from 'next/link';

const IndexPage: NextPageWithLayout = () => {
  const utils = trpc.useUtils(); // Gets the tRPC object with all of the remote calls from the server
  const router = useRouter();
  return (
    <div className="min-w-screen min-h-screen mx-8">
      <Nav />
      <div>
        <h2 className="text-2xl mt-10">Library</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 mt-6">
            <Link href='/create' className="w-full h-auto transition-all duration-400 border-gray-600 hover:border-gray-400 border-dashed border-4 flex items-center justify-center cursor-pointer group">
              <div className="transition-all duration-400 fill-gray-600 group-hover:fill-gray-400">
                {add_circle()}
              </div>
            </Link>
          <img
            src="/example.jpg"
            alt="Thumbnail"
            className="w-full h-auto object-cover transition-all duration-400 rounded-xl hover:rounded-none shadow-md"
          />
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

export default IndexPage;
