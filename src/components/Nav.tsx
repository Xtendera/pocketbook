import Link from 'next/link';
import { useRouter } from 'next/router';

const Nav: React.FC = () => {
  const router = useRouter();
  function signOut() {
    cookieStore.delete('jwt');
    router.push('/login');
  }
  return (
    <div className="flex justify-between">
      <div className="mt-8 flex items-center">
        <Link href="/">
          <h1 className="text-3xl text-center font-medium">Pocket Book</h1>
        </Link>
      </div>
      <div className="mt-8 flex items-center">
        <a href="#" onClick={signOut} className="text-center font-medium">
          Sign out
        </a>
      </div>
    </div>
  );
};

export default Nav;
