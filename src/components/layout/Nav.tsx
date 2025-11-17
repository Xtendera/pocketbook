import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';
import {
  MdAccountCircle,
  MdLogout,
  MdExpandLess,
  MdSettings,
  MdAdminPanelSettings,
} from 'react-icons/md';
import { trpc } from '~/utils/trpc';

const Nav: React.FC = () => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: userInfo } = trpc.auth.getInfo.useQuery();

  function signOut() {
    cookieStore.delete('jwt');
    router.reload();
  }

  function settings() {
    router.push('/settings');
  }

  function adminPanel() {
    router.push('/settings/admin');
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isAdmin = userInfo?.permission === 3;

  return (
    <div className="flex justify-between">
      <div className="mt-8 flex items-center space-x-8">
        <Link href="/">
          <h1 className="text-3xl text-center font-medium">Pocket Book</h1>
        </Link>
        <Link href="/collections">
          <span className="text-xl">Collections</span>
        </Link>
      </div>
      <div className="mt-8 flex items-center relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex cursor-pointer items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
        >
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <MdAccountCircle size={24} color="#FFFFFF" />
          </div>
          <MdExpandLess
            size={24}
            color="#FFFFFF"
            className={`transition-transform duration-200 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-12 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 pt-1 z-50">
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Account
              </p>
            </div>
            <button
              onClick={() => {
                settings();
                setIsDropdownOpen(false);
              }}
              className="w-full cursor-pointer text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors duration-200"
            >
              <MdSettings size={24} color="#FFFFFF" />
              <span>Settings</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  adminPanel();
                  setIsDropdownOpen(false);
                }}
                className="w-full cursor-pointer text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors duration-200"
              >
                <MdAdminPanelSettings size={24} color="#FFFFFF" />
                <span>Admin Panel</span>
              </button>
            )}
            <button
              onClick={() => {
                signOut();
                setIsDropdownOpen(false);
              }}
              className="w-full cursor-pointer text-left px-4 pt-2 pb-3 rounded-b-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors duration-200"
            >
              <MdLogout size={24} color="#FFFFFF" />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Nav;
